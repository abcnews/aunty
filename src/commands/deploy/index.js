// Native
const { existsSync, statSync } = require('fs');

// External
const loadJsonFile = require('load-json-file');
const pify = require('pify');
const pump = require('pump');
const rsyncwrapper = require('rsyncwrapper');
const SSH = require('ssh2');

// Ours
const { command } = require('../../cli');
const { packs, throws, unpack } = require('../../utils/async');
const { dry, info, spin, warn } = require('../../utils/logging');
const { DEFAULTS, OPTIONS, MESSAGES, VALID_TYPES } = require('./constants');
const ftpDeploy = require('../../utils/ftp');

// Wrapped
const getJSON = packs(loadJsonFile);
const ftp = packs(ftpDeploy);

const rsync = packs(target => {
  let opts = Object.assign({}, DEFAULTS.RSYNC, {
    src: `${target.from}/${Array.isArray(target.files) ? target.files[0] : target.files}`,
    dest: `${target.username}@${target.host}:${target.to}`,
    args: [`--rsync-path="mkdir -p ${target.to} && rsync"`]
  });
  return pify(rsyncwrapper)(opts);
});

const symlink = packs(async target => {
  const symlinkName = typeof target.symlink === 'string' ? target.symlink : DEFAULTS.SYMLINK.NAME;
  const symlinkPath = target.to.replace(target.id, symlinkName);

  if (symlinkPath === target.to) {
    warn(MESSAGES.NO_MAPPABLE_ID);
    return;
  }

  const ssh = new SSH();

  ssh.connect(target);

  await pify(ssh.on)('ready');

  const stream = await pify(ssh.exec)(`rm -rf ${symlinkPath} && ln -s ${target.to} ${symlinkPath}`);

  await pify(stream.on)('exit');

  ssh.end();
});

const deployToServer = packs(async target => {
  info(MESSAGES.deployment(target.type, target.from, target.to, target.host));

  const spinner = spin('Deploy');

  try {
    if (target.type === 'ftp') {
      throws(await ftp(target, spinner));
    } else if (target.type === 'ssh') {
      // ensure target directory has a trailing slash
      target.to = target.to.replace(/\/?$/, '/');
      throws(await rsync(target));
      if (target.symlink) {
        throws(await symlink(target));
      }
    }
  } catch (err) {
    spinner.fail();

    throw err;
  }

  spinner.succeed();

  if (target.publicURL) {
    info(MESSAGES.publicURL(target.publicURL));
  }
});

module.exports.deploy = command(
  {
    name: 'deploy',
    options: OPTIONS,
    usage: MESSAGES.usage,
    isProjectConfigRequired: true
  },
  async (argv, config) => {
    // 1) Get known/specified deployment target(s)

    let keys = Object.keys(config.deploy);

    if (argv.target) {
      keys = keys.filter(key => key === argv.target);

      if (keys.length < 1) {
        throw MESSAGES.targetDoesNotExist(argv.target);
      }
    }

    if (keys.length < 1) {
      throw MESSAGES.NO_TARGETS;
    }

    // 2) Create an array of config objects for each target we know about

    const credentials = unpack(await getJSON(argv.credentials));

    const targets = keys.reduce((memo, key) => {
      const value = config.deploy[key];
      const partialTargets = Array.isArray(value) ? value : [value];

      return memo.concat(
        partialTargets.map((partialTarget, index) =>
          Object.assign(
            {
              __key__: partialTargets.length > 1 ? `${key}_${index}` : key,
              id: config.id,
              name: config.pkg.name,
              files: '**'
            },
            credentials[key],
            partialTarget,
            argv.shouldRespectTargetSymlinks ? {} : { symlink: null }
          )
        )
      );
    }, []);

    // 3) Validate & normalise those configs (in parallel)

    await Promise.all(
      targets.map(async target => {
        // 3.1) Check 'type' is valid
        if (!VALID_TYPES.has(target.type)) {
          throw MESSAGES.unrecognisedType(target.__key__, target.type);
        }

        // 3.2) Check all properties are present
        VALID_TYPES.get(target.type).REQUIRED_PROPERTIES.forEach(prop => {
          if (target[prop] == null) {
            throw MESSAGES.targetNotConfigured(target.__key__, prop);
          }
        });

        // 3.3) Check 'from' directory exists
        if (!existsSync(target.from) || !statSync(target.from).isDirectory()) {
          throw MESSAGES.sourceIsNotDirectory(target.from);
        }

        // 3.4) Remove temporary properties
        delete target._from;
        delete target._to;
      })
    );

    if (argv.dry) {
      return dry(
        targets.reduce((memo, target) => {
          memo[`Deployment to ${target.__key__}`] = target;

          return memo;
        }, {})
      );
    }

    for (const target of targets) {
      throws(await deployToServer(target));
    }
  }
);
