const Generator = require('yeoman-generator');
const fs = require('fs-extra');
const Chalk = require('chalk');
const requireg = require('requireg');
const Path = require('path');
const getAllPaths = require('get-all-paths');
const { installDependencies } = require('../../utils/generator-helpers');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('name', { required: false });
    this.option('here', { description: 'Initialize project into current directory' });
    this.option('template', { description: 'Type of project (eg. basic, preact, react)' });
  }

  usage() {
    if (this.options.aunty) {
      return 'aunty new [options] [<name>]';
    } else {
      return super.usage();
    }
  }

  async prompting() {
    let prompts = [];

    if (this.options.here) {
      this.options.name = Path.basename(process.cwd());
    }

    if (!this.options.name) {
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
          { name: 'Vue', value: 'vue' }
        ]
      });
    }

    if (prompts.length > 0) {
      const answers = await this.prompt(prompts);
      this.options = Object.assign({}, this.options, answers);
    }

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
    this.config.set('template', this.options.template);
  }

  writing() {
    const context = {
      projectName: this.options.name,
      projectSlug: this.options.projectSlug,
      projectType: this.options.template,
      authorName: this.user.git.name(),
      authorEmail: this.user.git.email()
    };

    const commonPath = this.templatePath(`_common`);
    const typePath = this.templatePath(`${this.options.template}`);
    const paths = getAllPaths(commonPath, typePath);

    paths.forEach(file => {
      // Ignore CSS files for Vue
      if (this.options.template === 'vue' && (file.includes('.css') || file.includes('.scss'))) return;

      this.fs.copyTpl(
        file,
        this.destinationPath(
          file
            .replace(`${commonPath}/`, '')
            .replace(`${typePath}/`, '')
            .replace('_.', '.')
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

    const devDependencies = [`@abcnews/aunty${auntyVersion ? `@${auntyVersion}` : ''}`];
    const dependencies = [];

    switch (this.options.template) {
      case 'preact':
        devDependencies.push('html-looks-like', 'preact-render-to-string');
        dependencies.push('preact', 'preact-compat');
        break;
      case 'react':
        devDependencies.push('react-test-renderer');
        dependencies.push('react', 'react-dom');
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

    this.log('\n 👍', Chalk.bold(this.options.name), 'created in', Chalk.bold(where), '\n');
  }
};
