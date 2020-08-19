// Native
const path = require('path');

// External
const fs = require('fs-extra');
const getAllPaths = require('get-all-paths');
const requireg = require('requireg');
const Generator = require('yeoman-generator');

// Ours
const { BUILD_DIRECTORY_NAME, DEPLOY_FILE_NAME } = require('../../constants');
const { cmd, hvy, opt, sec } = require('../../utils/color');
const { success } = require('../../utils/logging');
const { installDependencies } = require('../../utils/npm');
const { combine } = require('../../utils/structures');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, {
      ...opts,
      localConfigOnly: true
    });

    this.argument('name', {
      description: `Project name. Create this directory if ${opt('--here')} is not specified`,
      required: false
    });
    this.option('here', { description: `Assume ${opt('<name>')} is current working directory` });
    this.option('template', { description: 'Type of project [basic|preact|react|svelte|vue]' });
  }

  usage() {
    return `${cmd('aunty generate project')} -- ${opt('[options] [<name>]')}

  Two shorthands are available - ${cmd('aunty new')} and ${cmd('aunty init')} - for quick project creation.

Shorthand examples (assuming xyz is your project name):

  ${cmd('aunty new')}        ==>    ${cmd('aunty generate project')}
  ${cmd('aunty new')} ${opt('xyz')}    ==>    ${cmd('aunty generate project')} -- ${opt('xyz')}
  ${cmd('aunty init')}       ==>    ${cmd('aunty generate project')} -- ${opt('--here')}
`;
  }

  async prompting() {
    let prompts = [];

    if (this.options.here) {
      this.options.name = path.basename(process.cwd());
    } else {
      prompts.push({
        type: 'input',
        name: 'name',
        message: 'What is your project called?',
        default: this.options.name || 'New Project'
      });
    }

    if (!this.options.template) {
      prompts.push({
        type: 'list',
        name: 'template',
        message: 'What type of project is it?',
        choices: [
          { name: 'Basic', value: 'basic' },
          { name: 'Preact', value: 'preact' },
          { name: 'React', value: 'react' },
          { name: 'Svelte', value: 'svelte' },
          { name: 'Vue', value: 'vue' }
        ]
      });
    }

    prompts.push({
      type: 'confirm',
      name: 'typescript',
      message: 'Will you be authoring your project in TypeScript?',
      default: false
    });

    const answers = await this.prompt(prompts);

    this.options = combine(this.options, answers);

    this.options.projectSlug = this.options.name
      .toLowerCase()
      .replace(/\s/g, '-')
      .replace(/[^0-9a-z\-\_]/g, '');

    if (this.options.here) {
      this.options.path = process.cwd();
    } else {
      this.options.path = process.cwd() + '/' + this.options.projectSlug;
    }
  }

  async configuring() {
    const directory = this.options.path;

    await fs.ensureDir(directory);
    process.chdir(directory);
    this.destinationRoot(directory);
  }

  writing() {
    const context = {
      BUILD_DIRECTORY_NAME,
      DEPLOY_FILE_NAME,
      projectName: this.options.name,
      projectSlug: this.options.projectSlug,
      projectType: this.options.template,
      isTS: this.options.typescript,
      authorName: this.user.git.name(),
      authorEmail: this.user.git.email()
    };

    const hasSFCs = this.options.template === 'svelte' || this.options.template === 'vue';
    const templateDirs = [this.options.template, '_common'].concat(hasSFCs ? [] : ['_styles']);
    const templateDirPaths = templateDirs.map(dir => this.templatePath(dir));
    const pathExclusions = [].concat(this.options.typescript ? [] : ['tsconfig.json']);
    const pathReplacements = templateDirPaths
      .map(dirPath => [`${dirPath}/`, ''])
      .concat(this.options.typescript ? [] : [[/\.tsx?/, '.js']], [['_.', '.']]);

    getAllPaths(...templateDirPaths).forEach(filePath => {
      if (pathExclusions.some(exclusion => filePath.includes(exclusion))) {
        return;
      }

      this.fs.copyTpl(
        filePath,
        this.destinationPath(
          pathReplacements.reduce((filePath, replacement) => filePath.replace(...replacement), filePath)
        ),
        context
      );
    });
  }

  async install() {
    let auntyVersion;

    try {
      auntyVersion = requireg('@abcnews/aunty/package.json').version;
    } catch (ex) {
      // Nothing
    }

    const devDependencies = [`@abcnews/aunty${auntyVersion ? `@${auntyVersion}` : ''}`].concat(
      this.options.typescript ? ['@types/webpack-env'] : []
    );
    const dependencies = [];

    switch (this.options.template) {
      case 'preact':
        devDependencies.push('html-looks-like', 'preact-render-to-string');
        dependencies.push('preact');
        break;
      case 'react':
        devDependencies.push(
          'react-test-renderer',
          ...(this.options.typescript ? ['@types/react', '@types/react-dom'] : [])
        );
        dependencies.push('react', 'react-dom');
        break;
      case 'svelte':
        devDependencies.push('@testing-library/svelte');
        dependencies.push('svelte');
        break;
      case 'vue':
        devDependencies.push('@vue/test-utils');
        dependencies.push('vue');
        break;
      default:
        break;
    }

    const allDependencies = [].concat(devDependencies).concat(dependencies);
    const projectDirectoryName = this.options.path.split('/').reverse()[0];

    if (allDependencies.includes(projectDirectoryName)) {
      throw new Error(
        `npm will refuse to install a package ("${projectDirectoryName}") which matches the project directory name.`
      );
    }

    await installDependencies(devDependencies.sort(), ['--save-dev'], this.log);
    await installDependencies(dependencies.sort(), null, this.log);
  }

  end() {
    const where = this.options.here ? 'the current directory' : `./${this.options.projectSlug}`;

    success(`Created ${hvy(this.options.name)} project in ${hvy(where)}`);
  }
};
