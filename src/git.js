// Native
const {exec} = require('child_process');

const createTag = tag => new Promise((resolve, reject) => {
  exec(`git tag -a ${tag} -m "Tagging version ${tag}"`, err => {
    if (err) {
      return reject(err);
    }

    resolve();
  });
});

const getCurrentBranch = () => new Promise((resolve, reject) => {
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

const getCurrentTags = () => new Promise((resolve, reject) => {
  exec('git tag -l --points-at HEAD', (err, stdout) => {
    if (err) {
      return reject(err);
    }

    const tags = '\n'.concat(stdout).match(/([^\n]+)/g);

    resolve(tags === null ? [] : tags);
  });
});

const getRemotes = () => new Promise((resolve, reject) => {
  exec('git remote', (err, stdout) => {
    if (err) {
      return reject(err);
    }

    const remotes = '\n'.concat(stdout).match(/([^\n]+)/g);

    resolve(remotes === null ? [] : remotes);
  });
});

const hasChanges = () => new Promise((resolve, reject) => {
  exec('git status -s', (err, stdout) => {
    if (err) {
      return reject(err);
    }

    resolve(stdout.length > 0);
  });
});

const hasTag = tag => new Promise((resolve, reject) => {
  exec(`git show-ref --tags --verify "refs/tags/${tag}"`, err => {
    resolve(!err);
  });
});

const pushTag = (remote, tag) => new Promise((resolve, reject) => {
  exec(`git push ${remote} ${tag}`, err => {
    if (err) {
      return reject(err);
    }

    resolve();
  });
});

module.exports = {
  createTag,
  getCurrentBranch,
  getCurrentTags,
  getRemotes,
  hasChanges,
  hasTag,
  pushTag
};
