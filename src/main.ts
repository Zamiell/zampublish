#!/usr/bin/env node

import { execaCommandSync } from "execa";
import { error } from "isaacscript-common-ts";
import sourceMapSupport from "source-map-support";
import {
  BUILD_SCRIPT,
  LINT_SCRIPT,
  PACKAGE_JSON,
  UPDATE_SCRIPT,
} from "./constants.js";
import { PackageManager } from "./enums/PackageManager.js";
import { fileExists, getHashOfFile } from "./file.js";
import { gitCommitAllAndPush } from "./git.js";
import { getPackageManagerUsedForThisProject } from "./packageManager.js";
import { Args, parseArgs } from "./parseArgs.js";
import { validate } from "./validate.js";
import { getPackageJSONField, incrementVersion } from "./version.js";

main();

function main() {
  sourceMapSupport.install();

  const args = parseArgs();
  const packageManager = getPackageManagerUsedForThisProject();

  validate();

  execaCommandSync("git pull --rebase");
  updateDependencies(args, packageManager);
  incrementVersion(args, packageManager);
  buildProject();
  lintProject(args);

  const version = getPackageJSONField("version");
  gitCommitAllAndPush(`chore: release ${version}`);

  execaCommandSync("npm publish --access public");

  const projectName = getPackageJSONField("name");
  console.log(`Published ${projectName} version ${version} successfully.`);
}

function updateDependencies(args: Args, packageManager: PackageManager) {
  const skipUpdate = args.skipUpdate === true;
  if (skipUpdate) {
    return;
  }

  if (!fileExists(UPDATE_SCRIPT)) {
    return;
  }

  console.log("Updating NPM dependencies...");

  const beforeHash = getHashOfFile(PACKAGE_JSON);
  execaCommandSync(`bash ${UPDATE_SCRIPT}`);
  const afterHash = getHashOfFile(PACKAGE_JSON);

  if (beforeHash !== afterHash) {
    execaCommandSync(`${packageManager} install`);
    gitCommitAllAndPush("chore: update deps");
  }
}

function buildProject() {
  if (!fileExists(BUILD_SCRIPT)) {
    error(`Failed to find the build script: ${BUILD_SCRIPT}`);
  }

  console.log(`Running "${BUILD_SCRIPT}"...`);

  try {
    execaCommandSync(`bash ${BUILD_SCRIPT}`);
  } catch (err) {
    execaCommandSync("git reset --hard");
    error("Failed to build the project:", err);
  }
}

function lintProject(args: Args) {
  const skipLint = args.skipLint === true;
  if (skipLint) {
    return;
  }

  if (!fileExists(LINT_SCRIPT)) {
    error(`Failed to find the build script: ${LINT_SCRIPT}`);
  }

  console.log(`Running "${LINT_SCRIPT}"...`);

  try {
    execaCommandSync(`bash ${LINT_SCRIPT}`);
  } catch (err) {
    execaCommandSync("git reset --hard");
    error("Failed to lint the project:", err);
  }
}
