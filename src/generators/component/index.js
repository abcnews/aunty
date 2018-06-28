const Generator = require('yeoman-generator');
const guessRootPath = require('guess-root-path');
const Path = require('path');
const Inflect = require('i')();
const Chalk = require('chalk');
const { installDependencies } = require('../../utils/generator-helpers');

/**
 * Generate a Component
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('name', { required: false });

    this.option('template', {
      description: 'Type of project (eg. basic, preact, react, vue)'
    });
    this.option('d3', { description: 'This component will use D3' });

    this.dependencies = [];
    this.devDependencies = [];
  }

  usage() {
    if (this.options.aunty) {
      return 'aunty generate component [options] [<name>]';
    } else {
      return super.usage();
    }
  }

  initializing() {
    if (!this.config.get('template')) {
      const directory = guessRootPath();
      process.chdir(directory);
      this.destinationRoot(directory);
      this.config.save();

      // Try and guess what template is being used from the aunty config
      try {
        const packageJson = require(directory + '/package.json');
        const template = packageJson.aunty.replace('-app', '');
        this.config.set('template', template);
      } catch (ex) {
        // Couldn't detect a thing
      }
    }
  }

  async prompting() {
    let prompts = [];

    this.options.template = this.config.get('template');
    if (!this.options.template) {
      prompts.push({
        type: 'list',
        name: 'template',
        message: 'What type of project is it again?',
        choices: [
          { name: 'Preact', value: 'preact' },
          { name: 'Basic', value: 'basic' },
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' }
        ]
      });
    }

    if (!this.options.name) {
      prompts.push({
        type: 'input',
        name: 'name',
        message: 'Component name?',
        default: 'NewComponent'
      });
    }

    if (!this.options.d3) {
      prompts.push({
        type: 'confirm',
        name: 'd3',
        message: 'Is this a D3 component?',
        default: false
      });
    }

    if (prompts.length > 0) {
      const answers = await this.prompt(prompts);
      this.options = Object.assign({}, this.options, answers);
    }

    this.options.name = Inflect.classify(this.options.name.replace(' ', '_'));

    this.config.set('template', this.options.template);
  }

  writing() {
    const templatePath = this.templatePath(this.options.template);
    const context = {
      className: this.options.name
    };

    // Copy the actual component
    let component = 'component';
    if (this.options.d3) {
      component = 'component-with-d3';
      this.dependencies = this.dependencies.concat('d3-selection');
    }

    if (this.options.template === 'vue') {
      this.fs.copyTpl(
        `${templatePath}/${component}.vue`,
        this.destinationPath(`src/components/${this.options.name}.vue`),
        context
      );

      // Copy test over
      this.fs.copyTpl(
        `${templatePath}/${component}.test.js`,
        this.destinationPath(`src/components/__tests__/${this.options.name}.test.js`),
        context
      );
    } else {
      this.fs.copyTpl(
        `${templatePath}/${component}.js`,
        this.destinationPath(`src/components/${this.options.name}/index.js`),
        context
      );
      this.fs.copyTpl(
        `${templatePath}/component.scss`,
        this.destinationPath(`src/components/${this.options.name}/styles.scss`),
        context
      );

      // Copy test over
      this.fs.copyTpl(
        `${templatePath}/${component}.test.js`,
        this.destinationPath(`src/components/${this.options.name}/index.test.js`),
        context
      );
    }
  }

  async install() {
    const devDependencies = [];
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
    this.log('\n 👍', Chalk.bold(this.options.name), 'created', '\n');
  }
};
