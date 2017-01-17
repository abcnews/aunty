// Native
const exec = require('child_process').exec;

async function hasChanges () {
  return new Promise((resolve, reject) => {
    exec('git status -s', (err, stdout) => {
      if (err) {
        return reject(err);
      }

      resolve(stdout.length > 0);
    });
  });
}

async function getCurrentBranch () {
  return new Promise((resolve, reject) => {
    exec('git branch --quiet', (err, stdout) => {
      if (err) {
        return reject(err);
      }

      const [, branch] = stdout.match(/\*\s+([^\n]+)\n/);

			if (!branch) {
        return reject(new Error('No branches found at current HEAD.'));
			}

      resolve(branch);
    });
  });
}

async function getCurrentTags () {
  return new Promise((resolve, reject) => {
    exec('git tag -l --points-at HEAD', (err, stdout) => {
      if (err) {
        return reject(err);
      }

      const tags = '\n'.concat(stdout).match(/([^\n]+)/g);

      resolve(tags === null ? [] : tags);
    });
  });
}

async function hasTag (tag) {
  return new Promise((resolve, reject) => {
    exec(`git show-ref --tags --verify "refs/tags/${tag}"`, err => {
      resolve(!err);
    });
  });
}

async function createTag (tag) {
  return new Promise((resolve, reject) => {
    exec(`git tag -a ${tag} -m "Tagging version ${tag}"`, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

async function pushTag (tag) {
  return new Promise((resolve, reject) => {
    exec(`git push origin ${tag}`, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

module.exports = {
  hasChanges,
  getCurrentBranch,
  getCurrentTags,
  hasTag,
  createTag,
  pushTag
};
