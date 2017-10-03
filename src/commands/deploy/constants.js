// Native
const { join } = require('path');

// Ours
const { cmd, hvy, opt, req, sec } = require('../../utils/color');
const { styleLastSegment } = require('../../utils/strings');

const VALID_TYPES = (module.exports.VALID_TYPES = new Map());
VALID_TYPES.set('ftp', {
  REQUIRED_PROPERTIES: ['from', 'to', 'type', 'username', 'password', 'host']
});
VALID_TYPES.set('ssh', {
  REQUIRED_PROPERTIES: ['from', 'to', 'type', 'username', 'host']
});

module.exports.DEFAULTS = {
  RSYNC: {
    ssh: true,
    recursive: true
  },
  SYMLINK: {
    NAME: 'latest'
  }
};

module.exports.OPTIONS = {
  boolean: ['shouldRespectTargetSymlinks'],
  string: ['credentials'],
  alias: {
    credentials: 'c'
  },
  default: {
    credentials: join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.abc-credentials')
  }
};

module.exports.MESSAGES = {
  NO_TARGETS: 'There are no targets to deploy to.',
  NO_MAPPABLE_ID: 'Could not create symlink because target path does not contain a mappable id.',
  sourceIsNotDirectory: from => `${hvy(from)} is not a directory.`,
  targetDoesNotExist: key => `The target ${hvy(key)} doesn't exist in the project configuration`,
  targetNotConfigured: (key, prop) =>
    `The target ${hvy(key)} in your configuration is incomplete or has incomplete credentials. Missing: ${hvy(prop)}`,
  unrecognisedType: (key, type) =>
    `The target ${hvy(key)} has ${type ? 'an unrecognised' : 'no'} deployment type${type
      ? `: ${hvy(type)}`
      : ''}. Acceptable types are: ${Array.from(VALID_TYPES.keys())
      .map(x => hvy(x))
      .join(', ')}`,
  deployment: (type, from, to, host) => `Deployment (${hvy(type)}):
  ┣ ${hvy('from')} ${styleLastSegment(from, req)}
  ┣ ${hvy('to')}   ${styleLastSegment(to, req)}
  ┗ ${hvy('on')}   ${req(host)}`,
  publicURL: url => `Public URL: ${hvy(url)}`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}                    Output the deployment target(s) configuration, then exit
  ${opt('-c PATH')}, ${opt('--credentials=PATH')}  File where target credentials/config is held ${opt(
    '[default: "~/.abc-credentials"]'
  )}
  ${opt('-i NAME')}, ${opt('--id=NAME')}           Id for this deployment (can be used in destination path) ${opt(
    `[default: ${cmd('git branch')}]`
  )}
  ${opt('-t NAME')}, ${opt('--target=NAME')}       Target to deploy to ${opt('[default: ---]')}

${sec(`Example ${hvy('aunty')} config`)}:

  ${req(`deploy: {
    [target_name]: {
      files: '**',
      from: 'build',
      to: '/www/res/sites/news-projects/${opt('<name>')}/${opt('<id>')}'
    }
  }`)}

  • If no ${opt('--target')} is specified, all targets found in the config will be deployed to.
  • The ${opt('--files')} property is optional and will default to ${opt('"**"')} (all files under ${hvy('from')}).
  • The ${opt('<name>')} placeholder will be replaced with the ${opt('name')} property in ${hvy('package.json')}.
  • The ${opt('<id>')} placeholder will be replaced with the ${opt('--id')} setting.

${sec('Examples')}

  ${cmd('aunty deploy')}
    Deploy the project to all targets configured in your config.

  ${cmd('aunty deploy')} ${opt('--target="contentftp"')}
    Deploy the project only to the ${opt('contentftp')} target.

  ${cmd('aunty deploy')} ${opt('--credentials=".local-abc-credentials"')}
    Deploy the project, specifying where credentials are held.

  ${cmd('aunty deploy')} ${opt('--id="testing-feature-xyz"')}
    Deploy the project, specifying config targets' ${opt('<id>')} replacement.
`
};
