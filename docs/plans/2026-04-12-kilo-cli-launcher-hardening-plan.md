# Kilo CLI launcher hardening implementation plan

**Status:** Historical implementation note for the April 2026 hardening pass.

## Goal

Harden command parsing, align user-facing naming, and add regression coverage without expanding the extension's feature scope.

## Scope

The plan focused on three related workstreams:

1. command parsing and terminal naming
2. metadata, documentation, and packaging cleanup
3. local verification for release readiness

## File Map

- `src/command-utils.ts`: pure helpers for command normalization, executable extraction, and terminal naming
- `src/extension.ts`: VS Code command wiring and runtime integration
- `test/command-utils.test.js`: regression tests for helper behavior
- `test/metadata.test.js`: regression tests for metadata, docs, and ignore rules
- `package.json`: extension metadata and local verification scripts
- `README.md`: end-user installation, configuration, and troubleshooting guide
- `SUPPORT.md`: issue-reporting and maintainer contact guidance
- `CHANGELOG.md`: release notes
- `docs/README.md`: engineering documentation index

## Workstream 1: Command Parsing

The runtime change was intentionally small:

- keep `src/extension.ts` as the extension entry point
- extract fragile logic into `src/command-utils.ts`
- support quoted Windows executable paths without attempting to parse full shell syntax
- preserve the explicit install check only for the plain `kilo` executable

## Workstream 2: Metadata And Documentation

The public-facing cleanup covered:

- standardizing the product name as `Kilo CLI launcher`
- clarifying Windows quoting examples and configuration guidance
- separating end-user documentation from engineering notes
- keeping support, privacy, and changelog information short and easy to find

## Workstream 3: Verification

Release readiness for the hardening pass was based on:

- successful TypeScript compilation
- passing unit tests for helpers and metadata
- package inspection to confirm that tests, source maps, and engineering notes were excluded from the VSIX
- final review of metadata and public documentation for naming consistency

## Outcome

The hardening pass stayed proportionate to the size of the project. It delivered a safer command-parsing path, basic regression coverage, and a cleaner public repository without adding new product scope or unnecessary infrastructure.
