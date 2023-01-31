import { execaCommandSync } from "execa";
import { error } from "isaacscript-common-ts";
import sourceMapSupport from "source-map-support";
import {
  BUILD_SCRIPT,
  LINT_SCRIPT,
  PACKAGE_JSON,
  PROJECT_NAME,
  UPDATE_SCRIPT,
} from "./constants.js";
import { PackageManager } from "./enums/PackageManager.js";
import { fileExists, getHashOfFile } from "./file.js";
import { gitCommitAllAndPush, isGitClean, isGitRepository } from "./git.js";
import { isLoggedInToNPM } from "./npm.js";
import { getPackageManagerUsedForThisProject } from "./packageManager.js";
import { Args, parseArgs } from "./parseArgs.js";
import { getVersionOfThisPackage, incrementVersion } from "./version.js";

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
  lintProject();

  const version = getVersionOfThisPackage();
  gitCommitAllAndPush(`chore: release ${version}`);

  execaCommandSync("npm publish --access public");

  console.log(`Published ${PROJECT_NAME} version ${version} successfully.`);
}

function validate() {
  if (!isGitRepository()) {
    error(
      "Failed to publish since the current working directory is not inside of a git repository.",
    );
  }

  if (!isGitClean()) {
    error(
      "Failed to publish since the Git repository was dirty. Before publishing, you must push any current changes to git. (Version commits should not contain any code changes.)",
    );
  }

  if (!fileExists(PACKAGE_JSON)) {
    error(
      `Failed to find the "${PACKAGE_JSON}" file in the current working directory.`,
    );
  }

  if (!isLoggedInToNPM()) {
    error(
      'Failed to publish since you are not logged in to npm. Try doing "npm login".',
    );
  }
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

function lintProject() {
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
