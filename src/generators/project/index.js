// Native
const path = require('path');

// External
const getAllPaths = require('get-all-paths');
const makeDir = require('make-dir');
const requireg = require('requireg');
const Generator = require('yeoman-generator');
const ftp = require('basic-ftp');

// Ours
const { OUTPUT_DIRECTORY_NAME } = require('../../constants');
const { cmd, hvy, opt, sec } = require('../../utils/color');
const { success } = require('../../utils/logging');
const { installDependencies } = require('../../utils/npm');
const { combine } = require('../../utils/structures');
const { getCredentials } = require('../../config/deploy');

const DEPLOY_DIRECTORY = '/www/res/sites/news-projects/';

/**
 * Check if a project exists on FTP
 * @param {string} projectNameSlug
 * @returns boolean
 */
const existsExternally = async projectNameSlug => {
  console.log('Checking for existing:', projectNameSlug);
  const credentials = getCredentials();
  console.log(credentials);

  const { contentftp } = credentials;
  const { host, username: user, password } = contentftp;

  const client = new ftp.Client();

  try {
    await client.access({
      host,
      user,
      password,
      secure: false
    });
    await client.cd(DEPLOY_DIRECTORY);
    const list = await client.list();

    for (const item of list) {
      console.log(item);
      if (projectNameSlug === item.name) return true;
    }
  } catch (err) {
    console.log(err);
  }

  client.close();

  return false;
};

/**
 * Return a sluggified version of the string
 *
 * @param {string} input - The string to convert
 * @returns {string}
 */
const sluggify = input =>
  input
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^0-9a-z\-\_]/g, '');

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
    this.option('template', { description: 'Type of project [basic|preact|react|svelte]' });
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
      this.options.projectName = path.basename(process.cwd());
    } else {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: 'What is your project called?',
        default: this.options.projectName || 'New Project'
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
          { name: 'Svelte', value: 'svelte' }
        ]
      });
    }

    prompts.push({
      type: 'confirm',
      name: 'typescript',
      message: 'Will you be authoring your project in TypeScript?',
      default: true
    });

    prompts.push({
      type: 'confirm',
      name: 'odyssey',
      message: 'Will this project render components inside an Odyssey?',
      default: false
    });

    const answers = await this.prompt(prompts);

    this.options = combine(this.options, answers);

    console.log(this.options.projectName);
    console.log(sluggify(this.options.projectName));
    console.log('Probably there already?', await existsExternally(sluggify(this.options.projectName)));

    this.options.projectName = this.options.projectName.replace(/[^\w\-\_\s]/g, '');

    this.options.projectNameSlug = sluggify(this.options.projectName);

    this.options.projectNameFlat = this.options.projectNameSlug.replace(/-/g, '');

    if (this.options.here) {
      this.options.path = process.cwd();
    } else {
      this.options.path = process.cwd() + '/' + this.options.projectNameSlug;
    }
  }

  async configuring() {
    const directory = this.options.path;

    await makeDir(directory);
    process.chdir(directory);
    this.destinationRoot(directory);
  }

  writing() {
    const context = {
      OUTPUT_DIRECTORY_NAME,
      projectName: this.options.projectName,
      projectNameSlug: this.options.projectNameSlug,
      projectNameFlat: this.options.projectNameFlat,
      projectType: this.options.template,
      isTS: this.options.typescript,
      isOdyssey: this.options.odyssey,
      authorName: this.user.git.name(),
      authorEmail: this.user.git.email()
    };

    const hasSFCs = this.options.template === 'svelte';
    const templateDirs = [this.options.template, '_common'].concat(hasSFCs ? [] : ['_non_sfc']);
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
      this.options.typescript ? ['@types/jest', '@types/webpack-env'] : []
    );
    const dependencies = ['@abcnews/alternating-case-to-object', '@abcnews/env-utils', '@abcnews/mount-utils'];

    switch (this.options.template) {
      case 'preact':
        devDependencies.push('html-looks-like', 'preact-render-to-string');
        dependencies.push('preact');
        break;
      case 'react':
        devDependencies.push(
          'react-test-renderer',
          ...(this.options.typescript ? ['@types/react', '@types/react-dom', '@types/react-test-renderer'] : [])
        );
        dependencies.push('react', 'react-dom');
        break;
      case 'svelte':
        devDependencies.push('@testing-library/svelte');
        dependencies.push('svelte');
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
    const where = this.options.here ? 'the current directory' : `./${this.options.projectNameSlug}`;

    success(`Created ${hvy(this.options.projectName)} project in ${hvy(where)}`);
  }
};
