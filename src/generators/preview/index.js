require('isomorphic-fetch');

const Generator = require('yeoman-generator');
const Chalk = require('chalk');
const { getGithubVersion } = require('../../utils/generator-helpers');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('plugin-odyssey', { description: 'Include Odyssey in the template' });
    this.option('plugin-scrollyteller', { description: 'Include Scrollyteller in the template' });
    this.option('plugin-parallax', { description: 'Include Parallax in the template' });
  }

  async prompting() {
    this.plugins = [];
    let showPrompt = true;

    // If any plugins where specifically mentioned then don't prompt
    ['odyssey', 'scrollyteller', 'parallax'].forEach(plugin => {
      if (typeof this.options['plugin-' + plugin] !== 'undefined') {
        showPrompt = false;
        this.plugins = this.plugins.concat([plugin]);
      }
    });

    if (showPrompt) {
      const answers = await this.prompt([
        {
          type: 'checkbox',
          name: 'plugins',
          message: 'Which plugins are you using?',
          choices: [
            { name: 'Odyssey', value: 'odyssey', checked: true },
            { name: 'Scrollyteller', value: 'scrollyteller' },
            { name: 'Parallax', value: 'parallax' }
          ]
        }
      ]);
      this.plugins = answers.plugins;
    }

    // if any plugins are selected then include odyssey too
    if (this.plugins.length > 0 && !this.plugins.includes('odyssey')) {
      this.plugins = ['odyssey'].concat(this.plugins);
    }
  }

  async writing() {
    const context = {
      authorName: this.user.git.name(),
      odyssey: this.plugins.includes('odyssey') ? await getGithubVersion('abcnews/odyssey') : false,
      scrollyteller: this.plugins.includes('scrollyteller')
        ? await getGithubVersion('abcnews/odyssey-scrollyteller')
        : false,
      parallax: this.plugins.includes('parallax') ? await getGithubVersion('abcnews/odyssey-parallax') : false
    };

    this.fs.copyTpl(this.templatePath('mobile.html'), this.destinationPath('public/mobile.html'), context);
    this.fs.copyTpl(this.templatePath('desktop.html'), this.destinationPath('public/desktop.html'), context);
  }

  end() {
    this.log('\n 👍 ', 'Templates created', '\n');
  }
};
