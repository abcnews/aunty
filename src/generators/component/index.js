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
    super(args, {
      ...opts,
      localConfigOnly: true
    });

    this.argument('name', { required: false });

    this.option('template', {
      description: 'Type of project [basic|preact|react|svelte]'
    });
    this.option('d3', { description: 'This component will use D3' });

    this.dependencies = [];
    this.devDependencies = [];
  }

  usage() {
    return `${cmd('aunty generate component')} -- ${opt('[options] [<name>]')}`;
  }

  initializing() {
    try {
      const { root, type, hasTS } = getProjectConfig();

      process.chdir(root);
      this.destinationRoot(root);
      this.options.template = type;
      this.options.typescript = hasTS;
    } catch (err) {}
  }

  async prompting() {
    let prompts = [];

    if (!this.options.template) {
      prompts.push({
        type: 'list',
        name: 'template',
        message: 'What type of project is it again?',
        choices: [
          { name: 'Preact', value: 'preact' },
          { name: 'Basic', value: 'basic' },
          { name: 'React', value: 'react' },
          { name: 'Svelte', value: 'svelte' }
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
  }

  writing() {
    const isSFC = this.options.template === 'svelte';
    const isJSX = this.options.template === 'preact' || this.options.template === 'react';
    const sourceName = `component${this.options.d3 ? '-with-d3' : ''}`;
    const sourceScriptExt = isJSX ? 'tsx' : 'ts';
    const destinationScriptExt = this.options.typescript ? sourceScriptExt : 'js';
    const context = {
      className: this.options.name,
      isTS: this.options.typescript
    };

    if (isSFC) {
      this.fs.copyTpl(
        this.templatePath(this.options.template, `${sourceName}.${this.options.template}`),
        this.destinationPath(`src/components/${this.options.name}/${this.options.name}.${this.options.template}`),
        context
      );
    } else {
      this.fs.copyTpl(
        this.templatePath(this.options.template, `${sourceName}.${sourceScriptExt}`),
        this.destinationPath(`src/components/${this.options.name}/index.${destinationScriptExt}`),
        context,
        { globOptions: { noext: true } }
      );
      this.fs.copy(
        this.templatePath(`_non_sfc/styles.scss`),
        this.destinationPath(`src/components/${this.options.name}/styles.scss`),
        context
      );
    }

    this.fs.copyTpl(
      this.templatePath(this.options.template, `${sourceName}.test.${sourceScriptExt}`),
      this.destinationPath(
        `src/components/${this.options.name}/${isSFC ? this.options.name : 'index'}.test.${destinationScriptExt}`
      ),
      context,
      { globOptions: { noext: true } }
    );
  }

  async install() {
    if (this.options.typescript) {
      this.devDependencies.push('@types/jest', '@types/webpack-env');
    }

    if (this.options.d3) {
      this.dependencies.push('d3-selection');

      if (this.options.typescript) {
        this.devDependencies.push('@types/d3-selection');
      }
    }

    switch (this.options.template) {
      case 'preact':
        this.devDependencies.push('html-looks-like', 'preact-render-to-string');
        this.dependencies.push('preact');
        break;
      case 'react':
        this.devDependencies.push(
          'react-test-renderer',
          ...(this.options.typescript ? ['@types/react', '@types/react-dom', '@types/react-test-renderer'] : [])
        );
        this.dependencies.push('react', 'react-dom');
        break;
      case 'svelte':
        this.devDependencies.push('@testing-library/svelte');
        this.dependencies.push('svelte');
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
