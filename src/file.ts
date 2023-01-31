import crypto from "crypto";
import fs from "fs";
import { error } from "isaacscript-common-ts";

export function fileExists(filePath: string): boolean {
  let pathExists: boolean;
  try {
    pathExists = fs.existsSync(filePath);
  } catch (err) {
    error(`Failed to check to see if "${filePath}" exists:`, err);
  }

  return pathExists;
}

export function getHashOfFile(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}
