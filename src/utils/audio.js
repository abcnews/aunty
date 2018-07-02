// Native
const childProcess = require('child_process');
const path = require('path');

const ANNOUNCEMENT_FILENAME = path.join(__dirname, '../../assets/done.mp3');

function has(cmd) {
  try {
    childProcess.execSync('which ' + cmd + ' 2>/dev/null 2>/dev/null');
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

  childProcess.spawn(bin, args);
};
