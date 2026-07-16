/**
 * @file
 * This config does two things:
 * 1. resolve your Aunty certificates and serve via HTTPS on your ABC hostname
 * 2. create a non-ESM entrypoint called coremedia.js, to bootstrap our ESM app
 *
 * The idea is that eventually these will be imported from @abcnews/aunty, but
 * for now they're inline so we can test and modify.
 */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { abcCorsPlugin, es5EntryPlugin, getServer } from '@abcnews/aunty/vite';

const isTS = existsSync(join(process.cwd(), 'src/index.ts'));
const entryPoint = isTS ? 'src/index.ts' : 'src/index.js';

export default defineConfig({
  base: '',
  plugins: [svelte(), es5EntryPlugin(), abcCorsPlugin()],
  server: getServer(),
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        indexEntry: entryPoint,
        ...(existsSync(join(process.cwd(), 'builder/index.html')) ? { builder: 'builder/index.html' } : {})
      },
      output: {
        // entry points don't get hashed to remain backward compatibility
        entryFileNames: 'modules/[name].js',

        // the remainder of assets get hashed to avoid name collisions.
        chunkFileNames: 'modules/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
