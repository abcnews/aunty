// Ours
const { cmd, hvy, opt, sec, req } = require('../../utils/color');

module.exports.OPTIONS = {
  boolean: ['local'],
  string: ['id'],
  alias: {
    id: 'i',
    local: 'l'
  }
};

// TODO: Add aunty config section to usage

module.exports.MESSAGES = {
  build: ({ id, publicPaths }) => `Build (${hvy(process.env.NODE_ENV)}):${
    id
      ? `
  ┣ ${hvy('id')}: ${req(id)}`
      : ''
  }
  ┗ ${hvy('publicPaths')}:${publicPaths
    .map(
      (publicPath, index) => `
    ${index === publicPaths.length - 1 ? '┗' : '┣'} ${hvy(`[${index}]`)}: ${req(publicPath)}`
    )
    .join('')}`,
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}           Output the generated webpack (& deployment) configuration, then exit
  ${opt('-l')}, ${opt('--local')}         Only build for local purposes; don't output deployment configuration
  ${opt('-i NAME')}, ${opt('--id=NAME')}  Id for this build (can be used in deployment path) ${opt(
    `[default: ${cmd('git branch')}]`
  )}

${sec('Environment variables')}

  • Builds will assume you have set ${cmd('NODE_ENV=production')}, unless you specify otherwise.
`
};
