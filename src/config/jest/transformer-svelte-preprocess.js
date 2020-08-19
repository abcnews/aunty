const svelte = require('svelte/compiler');
const sveltePreprocess = require('svelte-preprocess');

const { src, filename } = process.env;

svelte.preprocess(src, sveltePreprocess(), { filename }).then(r => {
  process.stdout.write(r.code);
});
