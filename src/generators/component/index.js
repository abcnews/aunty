// External
const Inflect = require('i')();
const Generator = require('yeoman-generator');

// Ours
const { getProjectConfig } = require('../../config/project');
const { cmd, hvy, opt } = require('../../utils/color');
const { success } = require('../../utils/logging');
const { installDependencies } = require('../../utils/npm');
const { combine } = require('../../utils/structures');

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
    return `${cmd('aunty generate component')} -- ${opt('[options] [<name>]')}`;
  }

  initializing() {
    if (!this.config.get('template')) {
      const { root, type } = getProjectConfig();

      process.chdir(root);
      this.destinationRoot(root);
      this.config.save();

      try {
        this.config.set('template', type);
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
      this.options = combine(this.options, answers);
    }

    this.options.name = Inflect.camelize(this.options.name.replace(' ', '_'));
    this.config.set('template', this.options.template);
  }

  writing() {
    const context = {
      className: this.options.name
    };

    let component = 'component';

    if (this.options.d3) {
      component = 'component-with-d3';
      this.dependencies.push('d3-selection');
    }

    if (this.options.template === 'vue') {
      this.fs.copyTpl(
        this.templatePath(this.options.template, `${component}.vue`),
        this.destinationPath(`src/components/${this.options.name}/${this.options.name}.vue`),
        context
      );
    } else {
      this.fs.copyTpl(
        this.templatePath(this.options.template, `${component}.js`),
        this.destinationPath(`src/components/${this.options.name}/index.js`),
        context,
        { globOptions: { noext: true } }
      );
      this.fs.copy(
        this.templatePath(this.options.template, `component.scss`),
        this.destinationPath(`src/components/${this.options.name}/styles.scss`),
        context
      );
    }

    this.fs.copyTpl(
      this.templatePath(this.options.template, `${component}.test.js`),
      this.destinationPath(`src/components/${this.options.name}/index.test.js`),
      context,
      { globOptions: { noext: true } }
    );
  }

  async install() {
    switch (this.options.template) {
      case 'preact':
        this.devDependencies.push('html-looks-like', 'preact-render-to-string');
        this.dependencies.push('preact', 'preact-compat');
        break;
      case 'react':
        this.devDependencies.push('react-test-renderer');
        this.dependencies.push('react', 'react-dom');
        break;
      case 'vue':
        this.devDependencies.push('@vue/test-utils');
        this.dependencies.push('vue');
        break;
      default:
        break;
    }

    await installDependencies(this.devDependencies.sort(), ['--save-dev'], this.log);
    await installDependencies(this.dependencies.sort(), null, this.log);
  }

  end() {
    success(`Created ${hvy(this.options.name)} component`);
  }
};
