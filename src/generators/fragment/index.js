const Generator = require('yeoman-generator');
const Chalk = require('chalk');
const execa = require('execa');
const { getConfig } = require('../../config/project');

function printTemplate(label, root, url) {
  console.log('\n', Chalk.bold.magenta(label));
  console.log(
    `\n  <div class="init-interactive" data-${root}-root data-scripts="${url}index.js" data-no-support-msg="true" ></div>\n`
  );
}

module.exports = class extends Generator {
  usage() {
    if (this.options.aunty) {
      return 'aunty fragment';
    } else {
      return super.usage();
    }
  }

  end() {
    let config;

    const tag = execa.shellSync('git tag | tail -n 1').stdout;
    if (tag) {
      config = getConfig({ id: tag });
      printTemplate(`Release (${tag})`, config.pkg.name, config.deploy.contentftp.publicURL);
    }

    config = getConfig();
    printTemplate('Development', config.pkg.name, config.deploy.contentftp.publicURL);
  }
};
