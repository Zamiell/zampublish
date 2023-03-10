import { execaCommandSync, execaSync } from "execa";

export function isGitRepository(): boolean {
  try {
    execaCommandSync("git rev-parse --is-inside-work-tree");
    return true;
  } catch {
    return false;
  }
}

export function isGitClean(): boolean {
  const { stdout } = execaCommandSync("git status --short");
  return stdout.length === 0;
}

export function gitCommitAllAndPush(message: string): void {
  execaCommandSync("git add --all");
  execaSync("git", ["commit", "--message", message]);
  execaCommandSync("git push");
}
