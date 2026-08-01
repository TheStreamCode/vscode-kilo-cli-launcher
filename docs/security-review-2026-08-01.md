# Security Review — 2026-08-01

## Executive Summary

The extension has a small, appropriate runtime surface and no production npm dependencies. No unresolved critical or high-impact runtime vulnerabilities were found. The review identified two supply-chain weaknesses, one test-isolation issue, and one asset-integrity issue; all were corrected without changing launcher behavior.

## Scope And Method

The review covered TypeScript runtime code, Node and VS Code integration tests, package metadata, npm dependencies, VSIX contents, GitHub Actions, trust boundaries, settings scopes, documentation, and repository hygiene. Validation included static inspection, `npm audit`, strict compilation, Node tests, VS Code extension-host tests, and package-content inspection.

## Resolved Findings

### SEC-001 — Vulnerable transitive build dependency

**Project impact:** Moderate. **Advisory severity:** High.

The development dependency tree resolved `brace-expansion` to a version affected by a denial-of-service advisory. The package is reachable through VSIX build tooling rather than the shipped extension runtime, which limits end-user exposure but leaves local and CI builds on a vulnerable dependency.

**Resolution:** The npm lockfile was refreshed to a patched compatible version, and `npm run audit` now provides an explicit high-severity gate (`package.json`, lines 115–117). The runtime still has no production npm dependencies.

### SEC-002 — Mutable GitHub Action references

**Project impact:** Moderate.

The CI workflow used movable major-version tags for checkout and Node setup. A compromised or retargeted tag could change code executed by CI without a repository diff.

**Resolution:** Both actions are pinned to full commit SHAs verified against their official repositories, checkout credentials are not persisted, workflow permissions remain read-only, and jobs have bounded execution time (`.github/workflows/ci.yml`, lines 11–18 and 33–49).

### SEC-003 — Integration test configuration restoration

**Project impact:** Low.

The integration test captured resolved settings with `configuration.get()` and restored those values globally. If a test host supplied a default or workspace value, cleanup could persist it as a global setting rather than restoring the exact pre-test state.

**Resolution:** The test now captures `globalValue` through `configuration.inspect()` and restores only the configuration target it mutates (`test/integration/suite/index.js`, lines 31–49).

### SEC-004 — Stale asset generator able to overwrite a published icon

**Project impact:** Low.

`scripts/generate-icon.ps1` wrote directly to `media/icon.png`, the icon published on the Marketplace and Open VSX. The script was last touched for `0.1.0`, while the icon was replaced for `0.1.8`, so running it rendered a different placeholder (5,007 bytes) over the shipped artwork (26,767 bytes). Nothing referenced the script — no npm script, workflow, test, or document — so the only realistic outcome of running it was silent corruption of a published brand asset.

**Resolution:** The unreferenced script was removed and `test/metadata.test.js` now asserts that no file under `scripts/`, `src/`, or `.github/` and no npm script can write `media/icon.png` or `media/launcher-mark.svg`. `.vscodeignore` keeps `scripts/**` excluded so any future tooling stays out of the VSIX.

## Validated Security Controls

- Workspace Trust blocks launch before any terminal is created or command is sent (`src/extension.ts`, lines 15–29).
- The executable command is resolved from global/default configuration only; workspace-controlled values are ignored (`src/extension.ts`, lines 31–32; `src/command-utils.ts`, lines 20–30).
- Blank commands fail closed with a visible error (`src/extension.ts`, lines 37–40).
- Commands are sent only to a visible integrated terminal after trust validation (`src/extension.ts`, lines 43–52).
- The manifest marks the command setting as machine-scoped and restricted in untrusted workspaces (`package.json`, lines 29–39 and 89–99).
- The Dependabot `pull_request_target` workflow does not check out or execute pull-request code, verifies the Dependabot author, pins its only action to a full commit SHA, and limits its write permissions to the auto-merge operation (`.github/workflows/dependabot-auto-merge.yml`, lines 27–43).

## Residual And Accepted Risks

- The extension intentionally executes an arbitrary user-level command in the integrated terminal. Workspace Trust and global-only command resolution reduce repository-driven execution, but users remain responsible for reviewing their configured command and shell environment.
- The auto-merge workflow requires write permissions by design. Its safety depends on the author check, pinned metadata action, no pull-request checkout, and protected required CI checks.
- `main` branch protection lists required status check contexts (`validate (ubuntu-latest)`, `validate (windows-latest)`) that the CI job names no longer produce; the workflow reports `<os> / VS Code <version>` contexts instead. Protection therefore fails closed — pull requests wait on checks that are never reported — and the required contexts need to be re-pointed in repository settings.
- Routine Dependabot version-update pull requests are intentionally disabled. Dependabot alerts and manual `npm outdated`/`npm audit` reviews remain necessary.
- Publisher credentials and release automation are outside this repository. Publishing should remain manual or use protected repository environments and secrets if automated later.

## Result

After the applied fixes, the reviewed repository has no known npm audit findings at the configured high-severity threshold and no identified unresolved critical or high-impact code vulnerability. Re-run this review when command execution, settings scope, dependency policy, or release automation changes.
