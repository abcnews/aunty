#!/usr/bin/env node

if (!require('import-local')(__filename)) {
  (async () => {
    const importLazy = require('import-lazy')(require);
    const { cli } = require('../cli');
    const { createErrorLogo } = importLazy('../utils/branding');
    const { error, log } = importLazy('../utils/logging');

    function exit(err) {
      if (err) {
        log(createErrorLogo());
        error(err);
        process.exit(1);
      }

      process.exit(0);
    }

    process.on('uncaughtException', exit);
    process.on('unhandledRejection', exit);

    const [err] = await cli(process.argv.slice(2));

    exit(err);
  })();
}
