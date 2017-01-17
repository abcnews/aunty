#!/usr/bin/env node

// Native
const {join, resolve} = require('path');
const exec = require('child_process').exec;

// Packages
const chalk = require('chalk');
const minimist = require('minimist');

// Ours
const {abort} = require('../lib/error');
const {getCredentials} = require('../lib/credentials');
const {getCurrentBranch} = require('../lib/git');
const {ftp, rsync, symlink} = require('../lib/deploy');

const name = require(resolve('package')).name;
const config = require(resolve('package')).aunty.deploy;

if (typeof config !== 'object') {
  abort(`This project has no ${chalk.dim('aunty.deploy')} property in its ${chalk.dim('package.json')} file.`);
}

const EXPECTED_PROPERTIES = ['from', 'to', 'type', 'username', 'password', 'host'];
const RECOGNISED_TYPES = ['ftp', 'ssh'];
const TARGET_DEFAULTS = {
  name,
  files: '**'
};
const ERRORS = {
  NO_TARGETS: 'There are no targets to deploy to.',
  TARGET_DOESNT_EXIST: targetName => `The target ${chalk.red(targetName)} doesn\'t exist in the project configuration`,
  TARGET_NOT_CONFIGURED: (targetName, prop) => `The target ${chalk.red(targetName)} in your configuration is incomplete or has incomplete credentials. Missing: ${chalk.red(prop)}`,
  UNRECOGNISED_TYPE: (targetName, type) => `The target ${chalk.red(targetName)} has an unrecognised deployment type: ${chalk.red(type)}. Acceptable types are: ${RECOGNISED_TYPES.join(', ')}`
};

const argv = minimist(process.argv.slice(2), {
  string: ['credentials', 'id', 'target'],
  boolean: ['force', 'help'],
  alias: {
    credentials: 'c',
    id: 'i',
    target: 't',
    force: 'f',
    help: 'h'
  },
  default: {
    credentials: join((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE), '.abc-credentials')
  }
});

const help = () => {
  console.log(`
  ${chalk.bold('aunty deploy')} [options]

  ${chalk.dim('Options:')}
    -c ${chalk.bold.underline('FILE')}, --credentials=${chalk.bold.underline('FILE')}   Local file where target's config/credentials are held      ${chalk.dim('["~/.abc-credentials"]')}
    -i ${chalk.bold.underline('ID')}, --id=${chalk.bold.underline('ID')}                Id for this deployment (can be used in destination path)   ${chalk.dim('[\`git branch\`]')}
    -t ${chalk.bold.underline('TARGET')}, --target=${chalk.bold.underline('TARGET')}    Specific target to deploy to                               ${chalk.dim('[]')}
    -f, --force                   Ignore all warnings and deploy anyway                      ${chalk.dim('[false]')}
    -h, --help                    Output usage information and exit                          ${chalk.dim('[false]')}

  Deployment details should be configured by adding ${chalk.dim('aunty:deploy:{target}')} to your ${chalk.dim('package.json')}:

    ${chalk.yellow(`"aunty": {
      "deploy": {
        "{target}": {
          "files": "**",
          "from": "build",
          "to": "/www/res/sites/news-projects/<name>/<id>"
        }
      }
    }`)}`);
  console.log(`

  ${chalk.gray('–')} If no ${chalk.dim('target')} option is specified, all targets found in ${chalk.dim('package.json')} will be deployed to.
  ${chalk.gray('–')} The ${chalk.dim('files')} property is optional and will default to ${chalk.dim('"**"')} (all files).
  ${chalk.gray('–')} The ${chalk.dim('<name>')} placeholder will be replaced with the value of the ${chalk.dim('name')} property in ${chalk.dim('package.json')}.
  ${chalk.gray('–')} The ${chalk.dim('<id>')} placeholder will be replaced with the ${chalk.dim('id')} setting.

  ${chalk.dim('Examples:')}
  ${chalk.gray('–')} Deploy the project to all targets configured in your ${chalk.dim('package.json')}
    ${chalk.cyan('$ aunty deploy')}
  ${chalk.gray('–')} Deploy the project only to the ${chalk.dim('contentftp')} target
    ${chalk.cyan('$ aunty deploy --target="contentftp"')}
  ${chalk.gray('–')} Deploy the project specifying where credentials are held
    ${chalk.cyan('$ aunty deploy --credentials=".local-abc-credentials"')}
  ${chalk.gray('–')} Deploy the project to a specific remote sub-directory
    ${chalk.cyan('$ aunty deploy --id="testing-feature-xyz"')}
`)
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
    console.log(`Deploying from ${chalk.blue(target.from)} to ${chalk.blue(target.to)} on ${chalk.blue(target.__key__)} (${chalk.blue(target.host)})`);

    if (RECOGNISED_TYPES.indexOf(target.type) === -1) {
      abort(ERRORS.UNRECOGNISED_TYPE(target.__key__, target.type));
    }

    deployTarget(target);
  });
}

deploy();
