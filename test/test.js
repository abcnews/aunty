const { _testBuild } = require('../src/cli/build');
const { _testGenerate } = require('../src/cli/generate');
const path = require('path');
const fs = require('fs/promises');
const mem = require('mem');
const { getBuildConfig } = require('../src/config/build');
const { getBabelConfig } = require('../src/config/babel');
const { getProjectConfig } = require('../src/config/project');

const argv = {
  _: ['project'],
  dry: false,
  d: false,
  force: false,
  f: false,
  help: false,
  h: false,
  quiet: false,
  q: false,
  announce: false,
  a: false,
  '--': []
};

let oldCwd = process.cwd;
let oldEnv = process.env.NODE_ENV;
/**
 * Mocks the working directory. Same as `cd newCwd`
 */
function mockCwd(newCwd) {
  process.cwd = function () {
    return newCwd;
  };
}

/**
 * same as rm -rf, supressing errors if the file doesn't exist
 */
async function rmRecursive(rootPath) {
  try {
    await fs.rm(rootPath, { recursive: true });
  } catch (e) {
    if (!e.message.includes('ENOENT')) {
      throw e;
    }
  }
}

const examplesRoot = path.resolve(__dirname, './example-projects/');

// clean and create working directory
beforeAll(async () => {
  await rmRecursive(examplesRoot);
  await fs.mkdir(examplesRoot);
});

// Reset mocks
afterAll(async () => {
  process.cwd = oldCwd;
  process.env.NODE_ENV = oldEnv;
  await rmRecursive(examplesRoot);
});
['basic', 'react', 'preact', 'svelte'].forEach(template => {
  describe(`${template} project`, () => {
    [(true, false)].forEach(hasTypescript => {
      describe(hasTypescript ? 'with typescript' : 'without typescript', () => {
        [false, true].forEach(hasOdyssey => {
          describe(hasOdyssey ? 'with odyssey' : 'without odyssey', () => {
            const projectName = [
              'project',
              template,
              hasTypescript ? 'typescript' : 'js',
              hasOdyssey ? 'odyssey' : 'standalone'
            ].join('-');
            const generatedProjectRoot = path.join(examplesRoot, projectName);

            beforeAll(async () => {
              jest.setTimeout(60 * 1000);
              process.env.NODE_ENV = 'production';
            });

            // Clear memoised functions between runs, otherwise weird things happen
            beforeEach(() => {
              mem.clear(getBuildConfig);
              mem.clear(getBabelConfig);
              mem.clear(getProjectConfig);
            });

            it('should generate a project', async () => {
              const answers = {
                projectName,
                template,
                typescript: hasTypescript,
                odyssey: hasOdyssey
              };

              global.auntyYeomanAnswers = answers;
              await rmRecursive(generatedProjectRoot);
              mockCwd(examplesRoot);
              await _testGenerate(argv);
              delete global.auntyYeomanAnswers;
            });

            it('should build the generated project', async () => {
              mockCwd(generatedProjectRoot);
              await _testBuild(argv);
              const fileList = await fs.readdir(path.join(generatedProjectRoot, '.aunty/build'));

              expect(fileList.includes('index.html'));
              expect(fileList.includes('index.js'));
              expect(fileList.includes('index.js.map'));

              // Other files may exist in the fileList but this should be enough of a smoke test
            });
          });
        });
      });
    });
  });
});
