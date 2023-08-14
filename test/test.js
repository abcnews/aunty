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

/** The .jest-test-projects folder in the aunty project root where all our test projects will be generated/built */
const tempRoot = path.resolve(__dirname, '../.jest-test-projects/');

/**
 * same as rm -rf, supressing errors if the file doesn't exist
 */
async function rmRecursive(pathToDelete) {
  if (!pathToDelete.startsWith(tempRoot)) {
    throw new Error('Root path must be a child of the tests root folder');
  }
  try {
    await fs.rm(pathToDelete, { recursive: true });
  } catch (e) {
    if (!e.message.includes('ENOENT')) {
      throw e;
    }
  }
}

// clean and create working directory
beforeAll(async () => {
  // Generate is largely limited by npm & network speed.
  // Sometimes it's only a few seconds, sometimes it's minutes.
  jest.setTimeout(5 * 60 * 1000);

  // Clean everything up
  await rmRecursive(tempRoot);
  await fs.mkdir(tempRoot);
});

// Reset mocks
const oldEnv = process.env.NODE_ENV;
afterAll(async () => {
  // Clean everything up
  process.env.NODE_ENV = oldEnv;
  await rmRecursive(tempRoot);
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

            /** The path of the generated project inside the tempRoot folder */
            const generatedProjectRoot = path.join(tempRoot, projectName);

            beforeEach(() => {
              // We must be in development mode to install devDependencies
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
              process.chdir(tempRoot);

              // Generate the new project. If this fails, this promise will throw.
              await _testGenerate(argv);
              delete global.auntyYeomanAnswers;
            });

            it('should build the generated project', async () => {
              process.chdir(generatedProjectRoot);

              // If the build fails for any reason this will throw.
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
