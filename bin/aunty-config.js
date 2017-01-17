#!/usr/bin/env node

// Native
const {resolve} = require('path');

// Project's
const config = require(resolve('package')).aunty;

console.log(JSON.stringify(config, null, '  '));
