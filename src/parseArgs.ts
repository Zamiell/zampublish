import yargs from "yargs";
import { PACKAGE_JSON, PROJECT_NAME } from "./constants.js";

export interface Args {
  _: string[];

  major?: boolean;
  minor?: boolean;
  patch?: boolean;

  skipIncrement?: boolean;
  skipLint?: boolean;
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

    .option("major", {
      type: "boolean",
      description: `Perform a major version increment in the "${PACKAGE_JSON}" file`,
    })

    .option("minor", {
      type: "boolean",
      description: `Perform a minor version increment in the "${PACKAGE_JSON}" file`,
    })

    .option("patch", {
      type: "boolean",
      description: `Perform a patch version increment in the "${PACKAGE_JSON}" file`,
    })

    .option("skip-increment", {
      type: "boolean",
      description: `Do not increment the version number in the "${PACKAGE_JSON}" file`,
    })

    .option("skip-lint", {
      type: "boolean",
      description: "Do not bother linting the project before publishing",
    })

    .option("skip-update", {
      type: "boolean",
      description: `Do not update dependencies in the "${PACKAGE_JSON}" file`,
    })

    .parseSync();

  return yargsObject as Args;
}
