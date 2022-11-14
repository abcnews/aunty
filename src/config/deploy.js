// Native
const { join } = require('path');

// External
const importLazy = require('import-lazy')(require);
const loadJsonFile = importLazy('load-json-file');

// Ours
const { VALID_TYPES } = require('../cli/deploy/constants');
const { isRepoSync, getCurrentLabelSync } = require('../utils/git');
const { warn } = require('../utils/logging');
const { combine } = require('../utils/structures');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');

const DEFAULT_PROFILES_FILE_PATH = join(
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
  '.abc-credentials'
);

const KNOWN_PROFILES_CONFIG = {
  contentftp: {
    to: '/www/res/sites/news-projects/<name>/<id>',
    resolvePublicPath: config => `${config.to.replace('/www', 'https://www.abc.net.au')}/`
  }
};

const MESSAGES = {
  incomplete: 'Your deploy configuration may be missing required properties.',
  noProfile: () => `Your profiles file doesn't contain a "${profile}" profile. ${MESSAGES.incomplete}`,
  noProfilesFile: path => `Could not load a profiles file from "${path}". ${MESSAGES.incomplete}`
};

module.exports.getDeployConfig = ({ id } = {}) => {
  let { deploy: projectDeployTargetsConfigs } = getProjectConfig();
  const { to } = getBuildConfig();

  id = id || (isRepoSync() && getCurrentLabelSync()) || 'unversioned';

  // Ensure projectDeployTargetsConfigs is not a primitive
  if (typeof projectDeployTargetsConfigs !== 'object') {
    projectDeployTargetsConfigs = {};
  }

  // ## DEPRECATED ##
  // Convert old profile key-based config objects to array
  else if (!Array.isArray(projectDeployTargetsConfigs)) {
    const projectDeployTargetsConfigsKeys = Object.keys(projectDeployTargetsConfigs);
    const expectedProps = VALID_TYPES.get('ftp').REQUIRED_PROPERTIES;
    // We assume that if we find an prop that references an object and
    // isn't in the expected props for an FTP target, it was a profile name
    if (
      projectDeployTargetsConfigsKeys.filter(
        key => typeof projectDeployTargetsConfigs[key] === 'object' && !expectedProps.includes(key)
      ).length > 0
    ) {
      projectDeployTargetsConfigs = projectDeployTargetsConfigsKeys.map(profile =>
        combine({ profile }, projectDeployTargetsConfigs[profile])
      );
    }
  }
  // ## END DEPRECATED ##

  // Ensure projectDeployConfig is an array
  if (!Array.isArray(projectDeployTargetsConfigs)) {
    projectDeployTargetsConfigs = [projectDeployTargetsConfigs];
  }

  const deployTargetConfigInputProperties = {
    id,
    from: to,
    files: '**'
  };

  return {
    id,
    targets: projectDeployTargetsConfigs.map(projectDeployTargetConfig =>
      combine(
        deployTargetConfigInputProperties,
        addKnownProfileProperties,
        projectDeployTargetConfig,
        resolveProperties,
        removeExtraneousProperties
      )
    )
  };
};

const addKnownProfileProperties = config => {
  const profile = config.profile || 'contentftp'; // default

  return combine(config, { profile }, KNOWN_PROFILES_CONFIG[profile]);
};

function resolveProperties(config) {
  const { pkg, root } = getProjectConfig();
  const { name } = pkg;
  // Package name may be in `@scope/name` format
  const unscopedName = name.split('/').reverse()[0];

  config.from = join(root, config.from);
  config.to = config.to.replace('<name>', unscopedName).replace('<id>', config.id);
  config.publicPath = typeof config.resolvePublicPath === 'function' ? config.resolvePublicPath(config) : '/';

  return config;
}

function removeExtraneousProperties(config) {
  delete config.id;
  delete config.resolvePublicPath;

  return Object.keys(config)
    .sort()
    .reduce((memo, prop) => {
      memo[prop] = config[prop];

      return memo;
    }, {});
}

module.exports.addProfileProperties = config => {
  const { profile } = config;
  const profilesFilePath = config.profilesFilePath || DEFAULT_PROFILES_FILE_PATH;
  let profiles;

  try {
    profiles = loadJsonFile.sync(profilesFilePath);
  } catch (err) {
    warn(MESSAGES.noProfilesFile(profilesFilePath));

    return config;
  }

  const profileProps = profiles[profile];

  if (!profileProps) {
    warn(MESSAGES.noProfile(profile));
  }

  return combine(config, profileProps);
};

module.exports.addKnownProfileProperties = addKnownProfileProperties;