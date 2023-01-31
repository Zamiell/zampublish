import { execaCommandSync } from "execa";
import fs from "fs";
import { error, isRecord } from "isaacscript-common-ts";
import { PACKAGE_JSON } from "./constants.js";
import { PackageManager } from "./enums/PackageManager.js";
import { Args } from "./parseArgs.js";

export function getPackageJSONField(fieldName: string): string {
  const packageJSON = getPackageJSON();
  const field = packageJSON[fieldName];
  if (typeof field !== "string") {
    error(
      `Failed to parse the "${fieldName}" field from the "${PACKAGE_JSON}" file.`,
    );
  }

  return field;
}

function getPackageJSON(): Record<string, unknown> {
  const packageJSONString = fs.readFileSync(PACKAGE_JSON, "utf8");
  const packageJSON = JSON.parse(packageJSONString) as unknown;
  if (!isRecord(packageJSON)) {
    error(`Failed to parse the "${PACKAGE_JSON}" file.`);
  }

  return packageJSON;
}

export function incrementVersion(
  args: Args,
  packageManager: PackageManager,
): void {
  const skipIncrement = args.skipIncrement === true;
  if (skipIncrement) {
    return;
  }

  const versionFlag = getVersionFlag(args);
  // The "--no-git-tag-version" flag will prevent the package manager from both making a commit and
  // adding a tag.
  execaCommandSync(
    `${packageManager} version --no-git-tag-version --${versionFlag}`,
  );
}

function getVersionFlag(args: Args): string {
  const major = args.major === true;
  if (major) {
    return "major";
  }

  const minor = args.minor === true;
  if (minor) {
    return "minor";
  }

  const patch = args.patch === true;
  if (patch) {
    return "patch";
  }

  // Default to a patch version.
  return "patch";
}
