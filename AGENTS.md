# Repository Guidelines

## Project Structure & Module Organization

- `src/extension.ts` registers VS Code commands and terminal behavior.
- `src/command-utils.ts` contains pure helpers for command parsing, terminal names, settings queries, and cwd resolution.
- `test/*.test.js` contains Node unit and metadata tests.
- `test/integration/` contains VS Code extension-host smoke tests using `@vscode/test-electron`.
- `media/` stores packaged Marketplace and command assets.
- `docs/` stores engineering specs and plans. Keep user-facing docs in `README.md`.
- Build output is emitted to `out/` and should not be edited manually.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run compile`: compile TypeScript into `out/`.
- `npm run watch`: run TypeScript in watch mode while editing.
- `npm run test:command-utils`: run focused helper tests.
- `npm run test:metadata`: validate metadata, docs, assets, and CI expectations.
- `npm run test:integration`: compile and run VS Code extension-host tests.
- `npm test`: compile, run unit tests, then run integration tests.
- `npm run check`: full validation, including `vsce ls` package contents.
- `npm run package`: build a `.vsix` package with `@vscode/vsce`.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and NodeNext modules. Prefer small pure helpers in `src/command-utils.ts` when behavior can be tested without the VS Code API. Keep names descriptive, for example `normalizeCliCommand`, `buildTerminalName`, and `resolveTerminalCwd`.

Follow the existing style: two-space indentation in JSON, single quotes in TypeScript, semicolons, and concise comments only for non-obvious behavior.

## Testing Guidelines

Tests use Node's built-in `node:test` plus `node:assert/strict`. Add command parsing regressions in `test/command-utils.test.js`. Add metadata or packaging assertions in `test/metadata.test.js` when package-visible files change.

Integration tests should avoid depending on Kilo CLI being installed locally. Use stable commands such as `node --version` when only terminal launch behavior is under test.

## Commit & Pull Request Guidelines

Existing release commits use messages like `release: prepare 0.2.0 update`. For regular changes, keep subjects concise and imperative, with a scoped prefix when useful, for example `fix: reduce missing CLI false positives`.

Pull requests should include a short description, linked issue when applicable, user-visible behavior changes, and verification output. For asset changes, include screenshots or before/after notes. Run `npm run check` before requesting review.

## Security & Configuration Tips

Do not execute user-configured commands outside the integrated terminal. Keep `kilocodeCliLauncher` setting IDs stable for backward compatibility. Avoid telemetry or analytics unless the README and Marketplace metadata are updated accordingly.
