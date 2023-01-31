import { execaCommandSync } from "execa";

export function isLoggedInToNPM(): boolean {
  try {
    execaCommandSync("npm whoami");
    return true;
  } catch {
    return false;
  }
}
