# Kilo CLI launcher hardening implementation plan

**Status:** Historical implementation note for the April 2026 hardening pass.

## Goal

Harden command parsing, align user-facing naming, and add regression coverage without expanding the extension's feature scope.

## Scope

The plan focused on three related workstreams:

1. terminal launch behavior and terminal naming
2. metadata, documentation, and packaging cleanup
3. local and CI verification for release readiness

## File Map

- `src/command-utils.ts`: pure helpers for command normalization, terminal naming, settings queries, and workspace-aware cwd resolution
- `src/extension.ts`: VS Code command wiring and runtime integration
- `test/command-utils.test.js`: regression tests for helper behavior
- `test/metadata.test.js`: regression tests for metadata, docs, and ignore rules
- `test/integration/`: VS Code smoke tests for activation and command execution
- `package.json`: extension metadata and local verification scripts
- `.github/workflows/ci.yml`: Windows and Linux validation workflow
- `README.md`: end-user installation, configuration, and troubleshooting guide
- `SUPPORT.md`: issue-reporting and maintainer contact guidance
- `CHANGELOG.md`: release notes
- `docs/README.md`: engineering documentation index

## Workstream 1: Terminal Launch Behavior

The runtime change was intentionally small:

- keep `src/extension.ts` as the extension entry point
- extract runtime decisions into `src/command-utils.ts`
- resolve terminal cwd from the active editor workspace when possible
- support direct command launch without a blocking local PATH probe
- add guided feedback when shell integration confirms that the default `kilo` command is missing
- keep terminal creation and status feedback lightweight

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
- passing VS Code integration smoke tests
- a minimal CI workflow on Windows and Linux
- package inspection to confirm that tests, source maps, and engineering notes were excluded from the VSIX
- user-facing feedback stays clear when the default `kilo` command is missing from the terminal environment
- final review of metadata and public documentation for naming consistency

## Outcome

The hardening pass stayed proportionate to the size of the project. It delivered a safer terminal-launch path, workspace-aware behavior, stronger automated validation, and a cleaner public repository without adding unnecessary product scope.
