import fs from "fs";
import { error, isRecord } from "isaacscript-common-ts";
import { PACKAGE_JSON } from "./constants.js";

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
