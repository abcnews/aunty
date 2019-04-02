// Ours
const { cmd, opt, sec } = require('../../utils/color');

module.exports.MESSAGES = {
  opensslArgs: (host, keyout, out) => [
    'req',
    '-newkey',
    'rsa:2048',
    '-x509',
    '-nodes',
    '-keyout',
    keyout,
    '-new',
    '-out',
    out,
    '-subj',
    `/CN=${host}`,
    '-reqexts',
    'SAN',
    '-extensions',
    'SAN',
    '-config',
    `<(cat /System/Library/OpenSSL/openssl.cnf <(printf '[SAN]\nsubjectAltName=DNS:${host}'))`,
    '-sha256',
    '-days',
    '3650'
  ],
  manual: path => `You should install this certificate in your Mac OS Keychain:
    ${path}
`,
  platform: `Sorry, this command is only supported on MacOS (for now)`,
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')} Output the assumed host, file paths & openssl command that would have run, then exit

${sec('Environment variables')}

  • You can override the host the certificate would be generated for by setting ${cmd('AUNTY_HOST')}
`
};
