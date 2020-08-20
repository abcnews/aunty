// External
const fs = require('fs-extra');
const getAllPaths = require('get-all-paths');
const Generator = require('yeoman-generator');

// Ours
const { getProjectConfig } = require('../../config/project');
const { cmd, hvy, opt } = require('../../utils/color');
const { success } = require('../../utils/logging');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, {
      ...opts,
      localConfigOnly: true
    });
  }

  usage() {
    return `${cmd('aunty generate thumbnail')} -- ${opt('[options]')}`;
  }

  async configuring() {
    const { root } = getProjectConfig();

    process.chdir(root);
    this.destinationRoot(root);
  }

  writing() {
    const commonPath = this.templatePath(`_common`);

    getAllPaths(commonPath).forEach(file => {
      this.fs.copy(file, this.destinationPath(file.replace(`${commonPath}/`, '')));
    });
  }

  end() {
    success(`Created thumbnail`);
  }
};
