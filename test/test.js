const { _testBuild } = require('../src/cli/build');
const { _testGenerate } = require('../src/cli/generate');
const path = require('path');
const fs = require('fs/promises');
const mem = require('mem');
const { getBuildConfig } = require('../src/config/build');
const { getBabelConfig } = require('../src/config/babel');
const { getProjectConfig } = require('../src/config/project');

/**
 * Magic argv. You can get this by console.logging from the running app
 */
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
  jest.setTimeout(5 * 60 * 1000);
  await rmRecursive(examplesRoot);
  await fs.mkdir(examplesRoot);
});

// Reset mocks
const oldEnv = process.env.NODE_ENV;
afterAll(async () => {
  process.env.NODE_ENV = oldEnv;
  await rmRecursive(examplesRoot);
});

['basic', 'react', 'preact', 'svelte'].forEach(template => {
  describe(`${template} project`, () => {
    [true, false].forEach(hasTypescript => {
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

            beforeEach(() => {
              // Generate is largely limited by npm & network speed.
              // Sometimes it's only a few seconds, sometimes it's minutes.
              process.env.NODE_ENV = 'development';

              // Clear memoised functions between runs, otherwise weird things happen
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
              process.chdir(examplesRoot);
              await _testGenerate(argv);
              delete global.auntyYeomanAnswers;
            });

            it('should build the generated project', async () => {
              process.chdir(generatedProjectRoot);
              await _testBuild(argv);
              const fileList = await fs.readdir(path.join(generatedProjectRoot, '.aunty/build'));

              // Other files may exist in the fileList but this should be enough of a smoke test
              expect(fileList.includes('index.html'));
              expect(fileList.includes('index.js'));
              expect(fileList.includes('index.js.map'));
            });
          });
        });
      });
    });
  });
});
