import yargs from "yargs";
import { PACKAGE_JSON, PROJECT_NAME } from "./constants.js";

export interface Args {
  _: string[];

  skipIncrement?: boolean;
  skipUpdate?: boolean;
}

/** Parse command-line arguments. */
export function parseArgs(): Args {
  const yargsObject = yargs(process.argv.slice(2))
    .strict()
    .usage(`usage: ${PROJECT_NAME} <command> [options]`)
    .scriptName(PROJECT_NAME)

    .alias("h", "help") // By default, only "--help" is enabled
    .alias("V", "version") // By default, only "--version" is enabled

    .option("skip-increment", {
      alias: "s",
      type: "boolean",
      description: `Do not increment the version number in the ${PACKAGE_JSON} file`,
    })

    .option("skip-update", {
      alias: "u",
      type: "boolean",
      description: `Do not update dependencies in the ${PACKAGE_JSON} file`,
    })

    .parseSync();

  return yargsObject as Args;
}
