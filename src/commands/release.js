#!/usr/bin/env node

// Native
const {resolve} = require('path');

// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../config');
const {abort} = require('../error');
const {createTag, getCurrentTags, getRemotes,
  hasChanges, hasTag, pushTag} = require('../git');
const {getPackage} = require('../package');
const {bad, cmd, hvy, opt, sec} = require('../text');

const version = getPackage('version');
getConfig('deploy'); // Quickly config exists for deployment

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'skip-tagging',
    'force',
    'help'
  ],
  alias: {
    'skip-tagging': 's',
    force: 'f',
    help: 'h'
  }
});

const ERRORS = {
  DIRTY: `You shouldn't release builds which may contain un-committed changes! Use the ${opt('--force')} option to release anyway.`,
  UNTAGGED: `You can't skip tagging because the tag ${bad(version)} doesn't exist!`,
  TAG_ELSEWHERE: `You can't skip tagging because the tag ${bad(version)} exists, but your current HEAD doesn't point to it!`,
  TAG_EXISTS: `The tag ${bad(version)} already exists! Try skipping tagging with the ${opt('--skip-tagging')} option.`
};

const help = () => {
  console.log(`
Usage: ${cmd('aunty release')} ${opt('[options]')} ${opt('[deploy_options]')}

${sec('Options')}

  ${opt('-s')}, ${opt('--skip-tagging')}  Skip tag creation and using the existing tag ${opt('[default: false]')}
  ${opt('-f')}, ${opt('--force')}         Ignore all warnings and release anyway ${opt('[default: false]')}
  ${opt('-h')}, ${opt('--help')}          Display this help message and exit

${sec('Examples')}

  ${cmd('aunty release')}
    Tag a release with ${hvy('git')} (using ${hvy('package.json:version')}), then deploy it,
    passing the tag as the ${opt('--id')} option to ${cmd('aunty deploy')}

  ${cmd(`aunty release ${opt('--skip-tagging')}`)}
    Expect the version's tag to exist on the current ${hvy('git')} working copy,
    then deploy it, passing the tag as the ${opt('--id')} option to ${cmd('aunty deploy')}
`);
};

if (argv.help) {
  help();
  process.exit(0);
}

const deploy = () => {
  const bin = resolve(__dirname, 'deploy.js');

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

  if (argv['skip-tagging']) {
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
      console.log(`Created tag ${hvy(version)}`);

      const remotes = await getRemotes();

      if (remotes.length) {
        remotes.forEach(async function (remote) {
          await pushTag(remote, version);
          console.log(`Pushed tag ${hvy(version)} to remote ${hvy(remote)}`);
        });
      }
    } catch (err) {
      abort(err.message);
    }
  }

  deploy();
}

release();
