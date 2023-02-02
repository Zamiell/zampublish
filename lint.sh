#!/bin/bash

set -e # Exit on any errors

# Get the directory of this script:
# https://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SECONDS=0

cd "$DIR"

# Use Prettier to check formatting.
npx prettier --check .

# Use ESLint to lint the TypeScript.
# Since all ESLint errors are set to warnings, we set max warnings to 0 so that warnings will fail
# in CI.
npx eslint --max-warnings 0 .

# Check for unused imports.
# The "--error" flag makes it return an error code of 1 if unused exports are found.
npx ts-prune --error

# Spell check every file using CSpell.
# We use "--no-progress" and "--no-summary" because we want to only output errors.
npx cspell --no-progress --no-summary .

# Check for orphaned words.
bash "$DIR/check-orphaned-words.sh"

# Check for base file updates.
# @template-ignore-next-line
npx zamts@latest check
# @template-customization-start
# (We cannot depend on "zamts" since that would cause a circular dependency.)
# @template-customization-end

echo "Successfully linted in $SECONDS seconds."
