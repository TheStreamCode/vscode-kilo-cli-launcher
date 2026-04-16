# Kilo CLI launcher hardening design

**Status:** Historical design note for the April 2026 hardening pass.

## Summary

This document captures the design used to harden the Kilo CLI launcher repository. The goal of the pass was to improve reliability, naming consistency, packaging hygiene, and regression coverage without changing the extension's scope.

## Problems Addressed

At the time of the change, the repository had a small but meaningful set of issues:

- the launch flow could incorrectly block valid commands because it relied on the extension host PATH instead of the integrated terminal environment
- terminal launch location was not explicit in multi-root or editor-driven workflows
- user-facing naming was not fully consistent across metadata and documentation
- automated coverage for the fragile helper logic was missing
- public and engineering documentation needed clearer separation and release validation was still local-only

## Goals

- standardize user-facing naming as `Kilo CLI launcher`
- launch commands through the integrated terminal without a blocking local PATH probe
- resolve terminal cwd from the active editor workspace when possible
- add unit tests and VS Code integration smoke tests for the most failure-prone logic
- add minimal CI coverage for release validation
- keep packaging lean and documentation easier to navigate

## Non-Goals

- adding new extension features
- restructuring the extension into a larger architecture

## Design Approach

### Keep the runtime small

The extension remains intentionally lightweight. `src/extension.ts` stays as the runtime entry point, while pure helper logic lives in `src/command-utils.ts` where it can be tested independently.

### Let the integrated terminal be the execution authority

The extension should not second-guess whether the configured command exists by probing the extension host environment. Launch should stay simple: validate only obviously invalid input such as a blank command, then send the configured command to the integrated terminal and let that environment determine whether it succeeds.

### Make launch location predictable

Terminal startup should use the active editor workspace folder when possible, because that is the strongest signal for user intent in a multi-root VS Code window. If no matching editor workspace exists, the extension should fall back to the first workspace folder and otherwise leave cwd unspecified.

## Runtime Behavior

When the launcher command runs, the extension should:

1. read extension settings
2. normalize `cliCommand` and `terminalName`
3. stop early if `cliCommand` is blank
4. resolve terminal cwd from the active editor workspace when possible
5. create a new terminal beside the active editor
6. send the configured command to the terminal and show a short status message
7. open extension settings through the current extension id rather than a hardcoded marketplace id

## Testing Strategy

The hardening pass adds focused unit tests for:

- command trimming and normalization
- terminal naming and fallback behavior
- workspace-aware cwd resolution
- settings query generation
- public metadata and packaging expectations

It also adds VS Code integration smoke tests for:

- extension activation
- public command registration
- launcher command execution creating a terminal
- settings command execution without throwing

The automated scope remains intentionally narrow. The aim is regression protection for the extension's critical launch paths, not a full end-to-end terminal automation suite.

## Documentation And Packaging

The repository documentation should be split by audience:

- the root `README.md` remains the end-user guide
- `SUPPORT.md` explains issue reporting and maintainer contact
- `docs/` stores engineering notes and historical design or planning material

The published VSIX should continue to exclude tests, source maps, engineering-only material, and the npm lockfile that is not needed at runtime.

## Acceptance Criteria

- user-facing naming is consistent across metadata and public documentation
- empty command configuration still fails with a clear error
- terminal launch no longer blocks on extension-host PATH detection
- terminal cwd follows the active editor workspace when available
- automated tests cover helper logic, metadata checks, and VS Code smoke scenarios
- CI validates the extension on Windows and Linux
- compile, tests, and package inspection succeed locally
