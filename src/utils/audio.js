// Native
const { execSync, spawn } = require('child_process');
const { join } = require('path');

const ANNOUNCEMENT_FILENAME = join(__dirname, '../../assets/done.mp3');

function has(cmd) {
  try {
    execSync('which ' + cmd + ' 2>/dev/null 2>/dev/null');
    return true;
  } catch (err) {
    return false;
  }
}

module.exports.announce = () => {
  const args = [ANNOUNCEMENT_FILENAME];
  let bin = 'play';

  if (process.platform == 'darwin') {
    bin = 'afplay';
  }

  if (has('mplayer')) {
    bin = 'mplayer';
    args.unshift('-really-quiet');
  }

  spawn(bin, args);
};
