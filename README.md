# @abcnews/aunty

A toolkit for working with ABC News projects

THIS IS A NEW BRANCH FOR AUNTY@NEXT PLEASE BITE OFF A CHUNK OF WORK AND MERGE INTO the `aunty-next` BRANCH

# Contributing

The repo is split up by commands. You should be able to jump into the command you're interested in, and follow the logic from start to finish.

### Command Entry Points

- [build](./src/commands/build/index.ts)
- [create](./src/commands/create/index.ts) (aliased as `new`)
- [deploy](./src/commands/deploy/index.ts)
- [release](./src/commands/release/index.ts)
- [release-check](./src/commands/release-check/index.ts)
- [serve](./src/commands/serve/index.ts)

Aunty uses the pattern of "helpers" to abstract complex logic out and hopefully make our main entrypoints flat and readable.

The main CLI logic is in [src/bin/commander.ts](./src/bin/commander.ts).

# Developing

To develop on Aunty, run the watch command to compile your changes in real-time:

```bash
npm run watch
```

Or build the project manually:

```bash
npm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for specifics.

# Templates

`aunty create` uses a custom template system to create new projects. See [TEMPLATES.md](./TEMPLATES.md) for specifics.
