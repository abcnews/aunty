// Dependency graph containing wasm must be imported asyncronously
// Do it here once, so we don't have to worry later.

// import "@babel/polyfill";
// import 'promise-polyfill/src/polyfill';
import('./main.js')
  .catch(e => console.error('Error importing `main.js`:', e));
