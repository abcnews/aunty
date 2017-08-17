// Native
const {join} = require('path');

// Ours
const {BASIC_STORY} = require('../../projects/constants');
const {cmd, hvy, opt, req, sec} = require('../../utils/color');
const {styleLastSegment} = require('../../utils/strings');

module.exports.OPTIONS = {
  string: [
    'credentials',
    'id',
    'target'
  ],
  boolean: [
    'force',
    'shouldRespectTargetSymlinks',
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
};

module.exports.DEFAULTS = new Map([
  [BASIC_STORY, {
    contentftp: {
      from: 'build',
      to: '/www/res/sites/news-projects/<name>/<id>'
    }
  }]
]);

module.exports.REQUIRED_PROPERTIES = ['from', 'to', 'type', 'username', 'password', 'host'];

const VALID_TYPES = module.exports.VALID_TYPES = new Set(['ftp', 'ssh']);

const DOMAIN = 'abc.net.au';
const NEWSDEV = `newsdev3.aus.aunty.${DOMAIN}`;

module.exports.RECOGNISED_HOST_PATH_TO_URL_MAPPINGS = {
  [`contentftp.${DOMAIN}`]: [/\/www\/(.*)/, `http://www.${DOMAIN}/$1`],
  [NEWSDEV]: [/\/var\/www\/html\/(.*)/, `http://${NEWSDEV}/$1`]
};

module.exports.MESSAGES = {
  NO_TARGETS: 'There are no targets to deploy to.',
  sourceIsNotDirectory: from => `${hvy(from)} is not a directory.`,
  targetDoesNotExist: key => `The target ${hvy(key)} doesn't exist in the project configuration`,
  targetNotConfigured: (key, prop) => `The target ${hvy(key)} in your configuration is incomplete or has incomplete credentials. Missing: ${hvy(prop)}`,
  unrecognisedType: (key, type) => `The target ${hvy(key)} has ${type ? 'an unrecognised' : 'no'} deployment type${type ? `: ${hvy(type)}` : ''}. Acceptable types are: ${Array.from(VALID_TYPES).map(x => hvy(x)).join(', ')}`,
  deploying: (type, from, to, host) => `
  Deploying using ${type}:

  ${hvy('from')} ${styleLastSegment(from, req)}
  ${hvy('to')}   ${styleLastSegment(to, req)}
  ${hvy('on')}   ${req(host)}
`,
  publicURL: url => `\n  Public URL: ${hvy(url)}/`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-c FILE')}, ${opt('--credentials=FILE')}  File where target credentials/config is held ${opt('[default: "~/.abc-credentials"]')}
  ${opt('-i ID')}, ${opt('--id=ID')}               Id for this deployment (can be used in destination path) ${opt('[default: git branch]')}
  ${opt('-t TARGET')}, ${opt('--target=TARGET')}   Target to deploy to ${opt('[default: ----]')}
  ${opt('-f')}, ${opt('--force')}                  Ignore all warnings and deploy anyway ${opt('[default: false]')}
  ${opt('-h')}, ${opt('--help')}                   Display this help message and exit

${sec(`Example ${hvy('aunty')} config`)}:

  ${req(`deploy: {
    [target]: {
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
