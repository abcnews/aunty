// Global
const { existsSync } = require('fs');
const { join } = require('path');

// External
const importLazy = require('import-lazy')(require);
const guessRootPath = importLazy('guess-root-path');
const mem = require('mem');

// Ours
const { hvy } = require('../utils/color');
const { pretty, warn } = require('../utils/logging');
const { combine } = require('../utils/structures');
const { PROJECT_CONFIG_FILE_NAME } = require('../constants');

function ensureProjectConfigShape(x) {
  return typeof x === 'object' ? x : typeof x === 'string' ? { type: x } : {};
}

module.exports.getProjectConfig = mem(() => {
  const root = guessRootPath();

  if (root === null) {
    throw new Error(`Aunty doesn't work if your project doesn't have a ${hvy('package.json')} file.`);
  }

  let pkg;

  try {
    pkg = require(`${root}/package.json`);
  } catch (err) {
    throw pretty(err);
  }

  let projectConfigModule;

  try {
    projectConfigModule = require(`${root}/${PROJECT_CONFIG_FILE_NAME}`);
  } catch (err) {
    // The standalone config file is optional, but it may have syntax problems
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw pretty(err);
    }
  }

  const hasTS = existsSync(join(root, 'tsconfig.json'));

  return combine(
    {
      root,
      pkg,
      hasTS
    },
    ensureProjectConfigShape(pkg.aunty),
    ensureProjectConfigShape(projectConfigModule)
  );
});
