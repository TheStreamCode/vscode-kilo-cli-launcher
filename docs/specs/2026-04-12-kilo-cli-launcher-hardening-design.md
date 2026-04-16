# Kilo CLI launcher hardening design

**Status:** Historical design note for the April 2026 hardening pass.

## Summary

This document captures the design used to harden the Kilo CLI launcher repository. The goal of the pass was to improve reliability, naming consistency, packaging hygiene, and regression coverage without changing the extension's scope.

## Problems Addressed

At the time of the change, the repository had a small but meaningful set of issues:

- command parsing could fail on Windows when the executable path was quoted and contained spaces
- user-facing naming was not fully consistent across metadata and documentation
- automated coverage for the fragile helper logic was missing
- public and engineering documentation needed clearer separation

## Goals

- standardize user-facing naming as `Kilo CLI launcher`
- make executable detection quote-aware and Windows-safe
- add unit tests for the most failure-prone logic
- keep packaging lean and documentation easier to navigate

## Non-Goals

- adding new extension features
- introducing CI workflows
- adding end-to-end VS Code integration tests
- restructuring the extension into a larger architecture

## Design Approach

### Keep the runtime small

The extension remains intentionally lightweight. `src/extension.ts` stays as the runtime entry point, while pure helper logic lives in `src/command-utils.ts` where it can be tested independently.

### Keep parsing narrow and deliberate

The extension does not need to parse full shell syntax. It only needs to extract the first executable token reliably enough to decide whether the explicit `kilo` install check should run.

## Runtime Behavior

When the launcher command runs, the extension should:

1. read extension settings
2. normalize `cliCommand` and `terminalName`
3. stop early if `cliCommand` is blank
4. extract the executable using quote-aware parsing
5. run the install check only when the executable is the plain `kilo` command
6. create a new terminal beside the active editor
7. send the configured command to the terminal and show a short status message

## Testing Strategy

The hardening pass adds focused unit tests for:

- command trimming and normalization
- executable extraction for plain commands and quoted Windows paths
- terminal naming and fallback behavior
- install-check decision logic
- public metadata and packaging expectations

The test scope is intentionally narrow. The aim is regression protection for the extension's critical helper paths, not a full shell parser or a VS Code integration harness.

## Documentation And Packaging

The repository documentation should be split by audience:

- the root `README.md` remains the end-user guide
- `SUPPORT.md` explains issue reporting and maintainer contact
- `docs/` stores engineering notes and historical design or planning material

The published VSIX should continue to exclude tests, source maps, and engineering-only material.

## Acceptance Criteria

- user-facing naming is consistent across metadata and public documentation
- quoted executable paths no longer break executable detection
- empty command configuration still fails with a clear error
- automated tests cover helper logic and metadata checks
- compile, tests, and package inspection succeed locally
