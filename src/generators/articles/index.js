// External
const Generator = require('yeoman-generator');

// Ours
const { cmd, opt } = require('../../utils/color');
const { getGithubVersion } = require('../../utils/git');
const { success } = require('../../utils/logging');
const { indented } = require('../../utils/text');
const { getFragmentMarkup } = require('../fragment');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, {
      ...opts,
      localConfigOnly: true
    });

    this.option('plugin-odyssey', { description: 'Include Odyssey in the template' });
    this.option('plugin-scrollyteller', { description: 'Include Scrollyteller in the template' });
    this.option('plugin-parallax', { description: 'Include Parallax in the template' });
  }

  usage() {
    return `${cmd('aunty generate articles')} -- ${opt('[options]')}`;
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
    const date = new Date();
    const fragment = getFragmentMarkup();
    const context = {
      dateString: date.toString(),
      dateISOString: date.toISOString(),
      authorName: this.user.git.name(),
      odysseyVersion: this.plugins.includes('odyssey') ? await getGithubVersion('abcnews/odyssey', 'master') : false,
      scrollytellerVersion: this.plugins.includes('scrollyteller')
        ? await getGithubVersion('abcnews/odyssey-scrollyteller', 'master')
        : false,
      parallaxVersion: this.plugins.includes('parallax')
        ? await getGithubVersion('abcnews/odyssey-parallax', 'master')
        : false,
      desktopFragment: indented(fragment, 16),
      mobileFragment: indented(fragment, 12)
    };

    this.fs.copyTpl(this.templatePath('desktop.html'), this.destinationPath('public/desktop.html'), context);
    this.fs.copyTpl(this.templatePath('mobile.html'), this.destinationPath('public/mobile.html'), context);
  }

  end() {
    success('Created templates');
  }
};
