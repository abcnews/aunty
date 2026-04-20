# @abcnews/aunty

A toolkit for working with ABC News projects

THIS IS A NEW BRANCH FOR AUNTY@NEXT PLEASE BITE OFF A CHUNK OF WORK AND MERGE INTO the `aunty-next` BRANCH

## Developing

Aunty is built using TypeScript, but can be run directly without a manual build step because the `bin` is run via tsx. To set up:

1. clone the repo and `npm i`.
2. run Aunty directly in node with `node . -h` or `node [path to aunty] -h`

## Projects in CoreMedia

Choose the entrypoint that matches your deployment environment:

- **CoreMedia**: Use `es5entry.js` to bootstrap your app in non-module environments.
- **ES6 projects**: Use `modules/index.js` when loading directly as a `<script type="module">`.
