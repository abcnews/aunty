// External
const execa = require('execa');
const Generator = require('yeoman-generator');

// Ours
const { getConfig } = require('../../config/project');
const { hvy } = require('../../utils/color');

function printTemplate(label, root, url) {
  console.log('\n', hvy.magenta(label));
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

    const tag = execa.shellSync('git tag | sort -t "." -k1,1n -k2,2n -k3,3n | tail -n 1').stdout;
    if (tag) {
      config = getConfig({ id: tag });
      printTemplate(`Release (${tag})`, config.pkg.name, config.deploy.contentftp.publicURL);
    }

    config = getConfig();
    printTemplate('Development', config.pkg.name, config.deploy.contentftp.publicURL);
  }
};
