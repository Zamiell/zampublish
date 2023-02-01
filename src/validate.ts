import { execaCommandSync } from "execa";
import { error } from "isaacscript-common-ts";
import { PACKAGE_JSON } from "./constants.js";
import { fileExists } from "./file.js";
import { isGitClean, isGitRepository } from "./git.js";

export function validate(): void {
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

function isLoggedInToNPM(): boolean {
  try {
    execaCommandSync("npm whoami");
    return true;
  } catch {
    return false;
  }
}
