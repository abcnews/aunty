#!/usr/bin/env node

// Native
const {exec} = require('child_process');
const {join} = require('path');

// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../config');
const {getCredentials} = require('../credentials');
const {ftp, rsync, symlink} = require('../deploy');
const {abort} = require('../error');
const {getCurrentBranch} = require('../git');
const {getPackage} = require('../package');
const {bad, cmd, hvy, opt, req, sec} = require('../text');

const name = getPackage('name');
const config = getConfig('deploy');

const EXPECTED_PROPERTIES = ['from', 'to', 'type', 'username', 'password', 'host'];
const RECOGNISED_TYPES = ['ftp', 'ssh'];
const TARGET_DEFAULTS = {
  name,
  files: '**'
};
const ERRORS = {
  NO_TARGETS: 'There are no targets to deploy to.',
  TARGET_DOESNT_EXIST: targetName => `The target ${bad(targetName)} doesn\'t exist in the project configuration`,
  TARGET_NOT_CONFIGURED: (targetName, prop) => `The target ${bad(targetName)} in your configuration is incomplete or has incomplete credentials. Missing: ${bad(prop)}`,
  UNRECOGNISED_TYPE: (targetName, type) => `The target ${bad(targetName)} has an unrecognised deployment type: ${bad(type)}. Acceptable types are: ${RECOGNISED_TYPES.join(', ')}`
};

const argv = minimist(process.argv.slice(2), {
  string: [
    'credentials',
    'id',
    'target'
  ],
  boolean: [
    'force',
    'help'
  ],
  alias: {
    credentials: 'c',
    force: 'f',
    help: 'h',
    id: 'i',
    target: 't'
  },
  default: {
    credentials: join(
      (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE),
      '.abc-credentials'
    )
  }
});

const help = () => {
  console.log(`
Usage: ${cmd('aunty deploy')} ${opt('[options]')}

${sec('Options')}

  ${opt('-c FILE')},  ${opt('--credentials=FILE')}  Local file where target config/credentials are held ${opt('[default: "~/.abc-credentials"]')}
  ${opt('-i ID')},     ${opt('--id=ID')}            Id for this deployment (can be used in destination path) ${opt('[default: \`git branch\`]')}
  ${opt('-t TARGET')}, ${opt('--target=TARGET')}    Specific target to deploy to ${opt('[default: ----]')}
  ${opt('-f')}, ${opt('--force')}                   Ignore all warnings and deploy anyway ${opt('[default: false]')}
  ${opt('-h')}, ${opt('--help')}                    Display this help message and exit

${sec(`Example ${hvy('package.json')} config`)}:

  ${req(`"aunty": {
    "deploy": {
      "{target}": {
        "files": "**",
        "from": "build",
        "to": "/www/res/sites/news-projects/${opt('<name>')}/${opt('<id>')}"
      }
    }
  }`)}

  • If no ${opt('--target')} is specified, all targets found in ${hvy('package.json')} will be deployed to.
  • The ${opt('--files')} property is optional and will default to ${opt('"**"')} (all files).
  • The ${opt('<name>')} placeholder will be replaced with the ${opt('name')} property in ${hvy('package.json')}.
  • The ${opt('<id>')} placeholder will be replaced with the ${opt('--id')} setting.

${sec('Examples')}

  ${cmd('aunty deploy')}
    Deploy the project to all targets configured in your ${hvy('package.json')}.

  ${cmd('aunty deploy')} ${opt('--target="contentftp"')}
    Deploy the project only to the ${opt('contentftp')} target.

  ${cmd('aunty deploy')} ${opt('--credentials=".local-abc-credentials"')}
    Deploy the project, specifying where credentials are held.

  ${cmd('aunty deploy')} ${opt('--id="testing-feature-xyz"')}
    Deploy the project to a remote sub-directory (assuming ${opt('<id>')} is in config).
  `);
};

if (argv.help) {
  help();
  process.exit(0);
}

async function deployTarget (target) {
  try {
    if (target.type === 'ftp') {
      await ftp(target);
    } else if (target.type === 'ssh') {
      await rsync(target);
      if (target.symlink) {
        await symlink(target);
      }
    }
  } catch (err) {
    abort(err);
  }
}

async function deploy () {
  let id, credentials;

  try {
    id = argv.id || await getCurrentBranch();
    credentials = await getCredentials(argv.credentials);
  } catch (err) {
    abort(err.message);
  }

  let targetNames = Object.keys(config);

  if (argv.target) {
    targetNames = targetNames.filter(targetName => targetName === argv.target);

    if (targetNames.length < 1) {
      abort(ERRORS.TARGET_DOESNT_EXIST(argv.target));
    }
  }

  if (targetNames.length < 1) {
    abort(ERRORS.NO_TARGETS);
  }

  const targets = targetNames.map(targetName => {
    const target = Object.assign({__key__: targetName, id: id}, TARGET_DEFAULTS, config[targetName], credentials[targetName]);

    EXPECTED_PROPERTIES.forEach(prop => {
      let value = target[prop];

      if (target[prop] == null) {
        abort(ERRORS.TARGET_NOT_CONFIGURED(targetName, prop));
      }

      switch (prop) {
        case 'to':
          value = value.replace('<name>', name).replace('<id>', id);
          break;
        default:
          break;
      }

      target[prop] = value;
    });

    return target;
  });

  targets.forEach(target => {
    console.log(`Deploying from ${hvy(target.from)} to ${hvy(target.to)} on ${hvy(target.host)}`);

    if (RECOGNISED_TYPES.indexOf(target.type) === -1) {
      abort(ERRORS.UNRECOGNISED_TYPE(target.__key__, target.type));
    }

    deployTarget(target);
  });
}

deploy();
