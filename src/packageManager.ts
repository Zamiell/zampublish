import { error, getEnumValues } from "isaacscript-common-ts";
import { PackageManager } from "./enums/PackageManager.js";
import { fileExists } from "./file.js";

const PACKAGE_MANAGER_LOCK_FILE_NAMES = {
  [PackageManager.NPM]: "package-lock.json",
  [PackageManager.YARN]: "yarn.lock",
  [PackageManager.PNPM]: "pnpm-lock.yaml",
} as const satisfies Record<PackageManager, string>;

export function getPackageManagerUsedForThisProject(): PackageManager {
  for (const packageManager of getEnumValues(PackageManager)) {
    const lockFileName = PACKAGE_MANAGER_LOCK_FILE_NAMES[packageManager];

    if (fileExists(lockFileName)) {
      return packageManager;
    }
  }

  error(
    'Failed to find the package manager used for this project. Have you installed the dependencies for the project yet? e.g. "npm install"',
  );
}
