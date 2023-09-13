# Bun Commands

The following commands are supported.
You must set `NODE_ENV` to use these commands.
To do so, you can add the following line to your `.env` file:

```
NODE_ENV=development
```

## Local dev server
- `bun dev` - Run the local dev server.

## Building
- `bun build` - Compile without a dev server, into `/static` directory.

## Translations
- `bun i18n` - Rebuilds app and updates English locale to prepare for translations in other languages. Should always be run after editing i18n strings.

- `bun manage:translations` - A low-level translations manager utility.

## Tests
- `bun test:all` - Runs all tests and linters.

- `bun test` - Runs Jest for frontend unit tests.

- `bun lint` - Runs all linters.

- `bun lint:js` - Runs only JavaScript linter.

- `bun lint:sass` - Runs only SASS linter.
