#!/usr/bin/env node

// Native
const {resolve} = require('path');

// Packages
const chalk = require('chalk');
const minimist = require('minimist');

// Ours
const {abort} = require('../lib/error');
const {hasChanges, getCurrentTags, hasTag, createTag, pushTag} = require('../lib/git');

const {version} = require(resolve('package'));

const argv = minimist(process.argv.slice(2), {
  boolean: ['skip-tag', 'force', 'help'],
  alias: {
    'skip-tag': 's',
    force: 'f',
    help: 'h'
  }
});

const ERRORS = {
  DIRTY: `You shouldn't release builds which may contain un-committed changes! Use the ${chalk.dim('--force')} option to release anyway.`,
  UNTAGGED: `You can't skip tagging because the tag ${chalk.red(version)} doesn't exist!`,
  TAG_ELSEWHERE: `You can't skip tagging because the tag ${chalk.red(version)} exists, but your current HEAD doesn't point to it!`,
  TAG_EXISTS: `The tag ${chalk.red(version)} already exists! Try skipping tagging with the ${chalk.dim('--skip-tag')} option.`
};

const help = () => {
  console.log(`
  ${chalk.bold('aunty release')} [options] [options for ${chalk.dim('aunty deploy')}]

  ${chalk.dim('Options:')}
    -s, --skip-tag   Skip tag creation and pass existing tag as ${chalk.dim('name')} option to ${chalk.dim('aunty deploy')}   ${chalk.dim('[false]')}
    -f, --force      Ignore all warnings and release anyway                                   ${chalk.dim('[false]')}
    -h, --help       Output usage information and exit                                        ${chalk.dim('[false]')}

  ${chalk.dim('Examples:')}
  ${chalk.gray('–')} Tag a new release (using ${chalk.dim('package.json:version')}), then deploy it
    ${chalk.cyan('$ aunty release')}
  ${chalk.gray('–')} Deploy an existing release tag we expect to find on the current HEAD
    ${chalk.cyan('$ aunty release --skip-tag')}
`);
};

if (argv.help) {
  help();
  process.exit(0);
}

const deploy = () => {
  const bin = resolve(__dirname, 'aunty-deploy.js');

  process.argv = process.argv.concat(['--id', version]);

  require(bin, 'may-exclude');
};

async function release () {
  const isForced = argv.force;
  let isDirty, isCurrentVersionTagged, isTagOnHead;

  try {
    isDirty = await hasChanges();

    if (isDirty && !isForced) {
      abort(ERRORS.DIRTY);
    }

    isCurrentVersionTagged = await hasTag(version);

    if (isCurrentVersionTagged) {
      isTagOnHead = (await getCurrentTags()).indexOf(version) > -1;
    }
  } catch (err) {
    abort(err.message);
  }

  if (argv['skip-tag']) {
    if (!isCurrentVersionTagged) {
      abort(ERRORS.UNTAGGED);
    } else if (!isTagOnHead) {
      abort(ERRORS.TAG_ELSEWHERE);
    }
  } else {
    if (isCurrentVersionTagged) {
      abort(ERRORS.TAG_EXISTS);
    }

    try {
      await createTag(version);
      console.log(`Created tag ${chalk.blue(version)}`);

      await pushTag(version);
      console.log(`Pushed tag ${chalk.blue(version)} to remote`);
    } catch (err) {
      abort(err.message);
    }
  }

  deploy();
}

release();
