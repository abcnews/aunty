// Native
const { join } = require('path');

// Ours
const { DEPLOY_FILE_NAME } = require('../../constants');
const { cmd, hvy, opt, req, sec } = require('../../utils/color');
const { styleLastSegment } = require('../../utils/text');

const VALID_TYPES = (module.exports.VALID_TYPES = new Map());
VALID_TYPES.set('ftp', {
  REQUIRED_PROPERTIES: ['from', 'to', 'type', 'username', 'password', 'host']
});
VALID_TYPES.set('ssh', {
  REQUIRED_PROPERTIES: ['from', 'to', 'type', 'username', 'host']
});

module.exports.MESSAGES = {
  deploy: ({ from, host, to, type }) => `Deploy (${hvy(type)}):
  ┣ ${hvy('from')}: ${styleLastSegment(from, req)}
  ┣ ${hvy('to')}: ${styleLastSegment(to, req)}
  ┗ ${hvy('host')}: ${req(host)}`,
  deployed: publicPath => `Deployed at ${sec(publicPath)}`,
  deploying: 'Deploying',
  missingProperty: prop => `Missing required property: '${hvy(prop)}'`,
  noDeployConfigFile:
    'No deploy configuration file was found, or its format was unrecognisable. Please re-build the project.',
  noFromDirectory: from => `Directory specified by 'from' property does not exist: ${hvy(from)}`,
  publicURL: url => `Public URL: ${hvy(url)}`,
  unrecognisedType: type =>
    `${type ? 'Unrecognised' : 'No'} deploy type${type ? `: ${hvy(type)}` : ''}. Acceptable types are: ${Array.from(
      VALID_TYPES.keys()
    )
      .map(x => hvy(x))
      .join(', ')}`,

  // TODO: Add aunty config section to usage
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}  Output the deploy configuration, then exit
`
};
