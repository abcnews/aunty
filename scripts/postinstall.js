/*
    Aunty v13 changes how build artefacts are created. When building a project,
    pre-v13, a .build folder and .deploy files were created inside your project
    directory. In v13, this was changed to a single .aunty directory, which
    contains a build filder and deploy.json file.

    This script runs after aunty is installed inside a project directory, and
    if the project was upgraded from a pre-v13 aunty, it will delete any old
    build artefacts, and update the .gitignore file to make sure the .aunty
    directory isn't committed, and remove the .build & .deploy references.
*/

const { existsSync, readFileSync, rmSync, rmdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const INSTALLATION_DIRECTORY = process.env.INIT_CWD || '.';

const PRE_AUNTY_13_GITIGNORE_PATTERN = /\/\.build\n\/\.deploy/;
const POST_AUNTY_13_GITIGNORE_REPLACEMENT = `/.aunty`;

const PRE_AUNTY_13_BUILD_DIR_PATH = join(INSTALLATION_DIRECTORY, '.build');
const PRE_AUNTY_13_DEPLOY_CONFIG_FILE_PATH = join(INSTALLATION_DIRECTORY, '.deploy');
const GITIGNORE_PATH = join(INSTALLATION_DIRECTORY, '.gitignore');

if (existsSync(PRE_AUNTY_13_BUILD_DIR_PATH)) {
  rmdirSync(PRE_AUNTY_13_BUILD_DIR_PATH, { recursive: true });
}

if (existsSync(PRE_AUNTY_13_DEPLOY_CONFIG_FILE_PATH)) {
  rmSync(PRE_AUNTY_13_DEPLOY_CONFIG_FILE_PATH);
}

if (existsSync(GITIGNORE_PATH)) {
  const fileContents = readFileSync(GITIGNORE_PATH, 'utf8');

  if (PRE_AUNTY_13_GITIGNORE_PATTERN.test(fileContents)) {
    const updatedFileContents = fileContents.replace(
      PRE_AUNTY_13_GITIGNORE_PATTERN,
      POST_AUNTY_13_GITIGNORE_REPLACEMENT
    );

    writeFileSync(GITIGNORE_PATH, updatedFileContents);
  }
}
