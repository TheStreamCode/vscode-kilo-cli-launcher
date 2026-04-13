# Kilo CLI Launcher Hardening Design

## Context

This design covers a narrow hardening pass for the public VS Code extension repository. The goal is to improve reliability, public consistency, and maintainability without changing the extension's product scope or adding heavyweight infrastructure.

Current repository observations:

- The extension implementation is intentionally small and currently lives in `src/extension.ts`.
- Public naming is inconsistent: the published extension is `Kilo CLI Launcher`, while some commands and configuration labels still use `KiloCode`.
- Command parsing is fragile on Windows because it derives the executable from `cliCommand.split(/\s+/)[0]`, which breaks quoted paths and commands containing spaces.
- There are no automated tests in the repository.
- Packaging is already lean, but the repo/package setup can be cleaned up further.

## Goal

Deliver a safe, low-risk improvement pass with two concrete outcomes:

1. Fix and polish the current extension behavior and public metadata.
2. Add a minimal automated test layer around the most failure-prone logic.

This pass does not include CI workflows, feature expansion, or a full refactor into multiple modules.

## Scope

Included:

- Align public naming from `KiloCode` to `Kilo CLI Launcher` where it affects user-facing text.
- Replace fragile command parsing with a Windows-safe and quote-aware executable extraction strategy.
- Keep the extension architecture simple while extracting a few pure utility functions inside the current code area.
- Add unit tests for command parsing, naming, and related guard logic.
- Improve repo hygiene and packaging rules where the changes are clearly beneficial and low risk.
- Normalize release notes wording if touched by the improvement pass.

Excluded:

- GitHub Actions or other CI automation.
- End-to-end VS Code integration tests.
- New extension features.
- Deep architectural refactors.
- Marketplace publishing, release tagging, or remote GitHub operations.

## Recommended Approach

### Option A: Metadata-only cleanup

Update naming, docs, and ignore rules without changing runtime logic.

Pros:

- Very low implementation risk.
- Quick to ship.

Cons:

- Leaves the Windows command parsing bug in place.
- Still has no test coverage for critical logic.

### Option B: Targeted hardening in-place

Keep the current single-entrypoint structure, extract a few pure helpers, fix runtime edge cases, and add unit tests.

Pros:

- Best balance of safety and practical value.
- Fixes the main correctness issue.
- Adds regression protection without overengineering.

Cons:

- Slightly more code movement than a metadata-only patch.

### Option C: Broader refactor with test harness expansion

Split the extension into multiple modules and introduce fuller testing scaffolding.

Pros:

- Better long-term modularity.

Cons:

- Too much change for the size of the project.
- Higher regression risk for limited short-term benefit.

Recommendation: Option B.

## Architecture

The extension remains intentionally small. The runtime entrypoint stays in `src/extension.ts`, but the logic inside it is reorganized into focused pure functions plus a thin command-registration layer.

Planned logical units:

- `resolveCliCommand`: read and normalize the configured command string.
- `extractExecutable`: derive the executable from the configured command in a quote-aware way.
- `resolveTerminalName`: normalize the terminal label and apply the sequence suffix.
- `shouldCheckKiloBinary`: decide when the explicit `kilo` presence check is required.
- Command handlers: wire VS Code APIs to the pure helpers.

This keeps the file easy to understand while making the fragile parts independently testable.

## Runtime Behavior

### Open CLI command

When the toolbar command runs:

1. Read extension configuration.
2. Normalize `cliCommand` and `terminalName`.
3. Reject an empty command with a clear user-facing error.
4. Extract the executable using quote-aware parsing that supports Windows paths with spaces.
5. If the command resolves to bare `kilo`, verify installation with the existing platform-specific binary check.
6. Create a new side terminal with a stable naming rule.
7. Send the configured command to the terminal.
8. Show a short status message.

### Settings command

The settings command continues to open the extension settings page, but the search/filter text and user-facing labels are updated to match the actual extension branding.

## Data Flow

The extension has no persisted runtime data beyond VS Code settings. The only internal state that remains is the terminal sequence counter.

Flow:

- VS Code command invocation -> configuration read -> pure normalization/parsing helpers -> installation guard -> terminal creation -> status feedback.

This flow stays synchronous from the user's point of view, with only the binary presence check remaining async.

## Error Handling

The hardening pass should make failure states explicit and predictable.

Cases to handle:

- Empty `cliCommand`: show a clear configuration error and stop.
- `kilo` requested but not installed: show the existing install guidance.
- Quoted path or path with spaces: parse correctly instead of failing the presence check incorrectly.
- Non-`kilo` custom commands: do not over-validate beyond the current intended behavior.

Non-goal: aggressively validate arbitrary shell syntax. The parser only needs to correctly extract the first executable token for the extension's own decision-making.

## Testing Strategy

Add a minimal unit-test setup focused on pure logic rather than VS Code API integration.

Tests should cover:

- Bare command parsing: `kilo`, `npx kilo`, `node script.js`.
- Quoted executable parsing on Windows-style paths.
- Unquoted executables with arguments.
- Terminal name normalization and fallback behavior.
- Decision logic for when the install check should run.

The goal is not exhaustive shell parsing. The goal is regression protection for the edge cases that matter to this extension.

## Documentation Changes

Update public-facing docs and metadata to match the behavior and branding:

- `package.json`: command category/title text, configuration title, and any user-facing labels.
- `README.md`: consistent product naming, improved Windows guidance, and clearer configuration wording.
- `CHANGELOG.md`: add a clear entry for the hardening pass and normalize nearby formatting if needed.
- Ignore/package rules: keep local tooling artifacts out of version control or packaging when appropriate.

## Packaging And Repo Hygiene

Low-risk cleanup items:

- Ensure local workspace artifacts such as `.kilo/` are not accidentally committed if they are project-local tooling only.
- Exclude files from the VSIX if they provide no user value in the published package.
- Preserve existing lightweight packaging behavior and avoid introducing extra distribution steps.

This should be done conservatively so the published artifact remains correct and reproducible.

## Acceptance Criteria

- User-facing branding is consistent with `Kilo CLI Launcher` across updated extension metadata and docs.
- Quoted or space-containing executable paths no longer break the extension's internal executable detection.
- Empty command configuration still fails fast with a clear message.
- The repository contains automated unit tests for the extracted pure helpers.
- Local verification can be done with compile plus tests.
- No new product features or architectural complexity are introduced.

## Verification Plan

Implementation will be considered ready only if all of the following pass after the code changes:

- TypeScript compile succeeds.
- Unit tests succeed.
- The package file list remains sensible for Marketplace publishing.
- Public docs/metadata match the implemented behavior.

## Risks And Mitigations

- Risk: command parsing changes may mis-handle edge cases.
  Mitigation: keep the parser narrow, test the supported cases, and avoid pretending to parse full shell syntax.

- Risk: branding cleanup may miss one or two strings.
  Mitigation: search all user-facing metadata and docs before final verification.

- Risk: repo hygiene changes may hide files that are intentionally tracked.
  Mitigation: only ignore clearly local/generated artifacts and verify the final package contents.

## Implementation Notes

The implementation should stay proportionate to the project size. A few pure helpers and a small test harness are enough. The design intentionally avoids CI, release automation, or broad restructuring because those are separate decisions from this focused hardening pass.
