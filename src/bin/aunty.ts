#!/usr/bin/env node
console.log("Hello from Aunty Next! 🎉");

import "zx/globals";

const list = await $`ls -la`;
const dir = $.sync`pwd`;

console.log(list);
console.log(dir);
