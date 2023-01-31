import { execaCommandSync } from "execa";
import fs from "fs";
import { error, isRecord } from "isaacscript-common-ts";
import { PACKAGE_JSON } from "./constants.js";
import { PackageManager } from "./enums/PackageManager.js";
import { Args } from "./parseArgs.js";

/** Returns the version from the "package.json" file. (There is no "v" prefix.) */
export function getVersionOfThisPackage(): string {
  const packageJSONString = fs.readFileSync(PACKAGE_JSON, "utf8");
  const packageJSON = JSON.parse(packageJSONString) as unknown;
  if (!isRecord(packageJSON)) {
    error(`Failed to parse the "${PACKAGE_JSON}" file.`);
  }

  const { version } = packageJSON;
  if (typeof version !== "string") {
    error(`Failed to parse the version from the "${PACKAGE_JSON}" file.`);
  }

  return version;
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
  execaCommandSync(`${packageManager} version --${versionFlag}`);
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
