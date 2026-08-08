# Security Review — 2026-08-08

## Executive Summary

The extension retains a small, appropriate runtime surface with no production npm dependencies. No unresolved critical or high-impact runtime vulnerability was identified. This review resolved three high-severity advisories in development-only packaging dependencies, strengthened regression coverage for the launch security boundaries, and corrected GitHub governance settings that had drifted from the repository policy.

## Scope And Method

The review covered TypeScript runtime code, Node and VS Code integration tests, package metadata, the npm dependency graph, VSIX contents, GitHub Actions, branch protection, Dependabot, CodeQL, secret scanning, private vulnerability reporting, documentation, and release artifacts. Validation included static inspection, `npm audit`, registry signature verification, strict compilation, Node tests, VS Code extension-host tests at the minimum and current stable versions, package-content inspection, and comparison of published VSIX payloads.

## Resolved Findings

### SEC-005 — Vulnerable transitive development dependencies

**Project impact:** Moderate. **Advisory severity:** High.

The build and packaging dependency tree resolved `fast-uri` 3.1.4, `js-yaml` 4.3.0, and `undici` 7.28.0. The affected packages were reachable through development-only tooling rather than the shipped extension runtime, but they caused the repository's high-severity audit gate to fail.

**Resolution:** The lockfile now resolves the compatible patched releases `fast-uri` 3.1.5, `js-yaml` 4.3.1, and `undici` 7.29.0 (`package-lock.json`, lines 2001–2005, 2581–2585, and 4413–4418). `npm run audit` remains the explicit high-severity gate (`package.json`, lines 116–117), and the extension still has no production npm dependencies.

### SEC-006 — Branch protection did not enforce the documented policy

**Project impact:** Moderate.

`main` required the obsolete contexts `validate (ubuntu-latest)` and `validate (windows-latest)`, while the matrix produced different job names. Protection therefore failed closed for normal contributors. Administration enforcement was also disabled, so an administrator could bypass the required review and checks; pull request 15 had been merged without an approving review.

**Resolution:** CI now exposes one stable `Required CI` aggregation job that succeeds only when the complete validation matrix succeeds (`.github/workflows/ci.yml`, lines 59–70). Remote protection requires that context in strict mode, applies to administrators, keeps one approving review and conversation resolution, and continues to require linear history while disallowing force-pushes and branch deletion.

### SEC-007 — Security automation and reporting settings had drifted

**Project impact:** Moderate.

Dependabot alerts were enabled, but Dependabot security updates were disabled even though the repository workflow was designed to queue safe security-update pull requests. GitHub private vulnerability reporting was also disabled, leaving email as the only private reporting channel.

**Resolution:** Dependabot security updates are enabled while scheduled version updates remain intentionally disabled (`AGENTS.md`, line 72). GitHub private vulnerability reporting is enabled and documented alongside the existing security email address (`SECURITY.md`, lines 8–11). Secret scanning and push protection remain enabled.

### SEC-008 — Security invariants lacked direct regression coverage

**Project impact:** Low.

The helper tests covered user-level command resolution, but the manifest scopes, restricted configuration, Workspace Trust ordering, and blank-command terminal behavior were not directly protected against regression.

**Resolution:** Metadata tests now assert the manifest scopes and ordering of the trust gate, command inspection, terminal creation, and command dispatch (`test/metadata.test.js`, lines 91–115). The extension-host test also confirms that a blank global command does not create another terminal (`test/integration/suite/index.js`, lines 45–48).

## Validated Security Controls

- Workspace Trust blocks launch before settings can create a terminal or send a command (`src/extension.ts`, lines 15–29).
- The executable command is resolved from global/default configuration only; workspace-controlled values remain ignored (`src/extension.ts`, lines 31–32; `src/command-utils.ts`, lines 20–30).
- Blank commands fail closed with a visible error (`src/extension.ts`, lines 37–40).
- Commands are sent only to a visible integrated terminal after trust validation (`src/extension.ts`, lines 43–52).
- The manifest keeps the command machine-scoped and restricted in untrusted workspaces (`package.json`, lines 29–39 and 89–99).
- GitHub Actions remain least-privileged, use pinned action SHAs, do not persist checkout credentials, and bound job execution time.
- The Dependabot `pull_request_target` workflow verifies the Dependabot author, does not check out pull-request code, and does not approve its own pull requests.
- CodeQL default setup, secret scanning, and secret-scanning push protection remain enabled with no open alerts at review time.

## Validation Results

- `npm run audit`: zero vulnerabilities.
- `npm audit signatures`: 318 verified registry signatures and 15 verified attestations.
- Strict TypeScript checks, 28 Node tests, and extension-host tests passed at VS Code `1.103.0` and current stable `1.132.0`.
- The VSIX contains only the expected 11 extension payload files plus its two package metadata files.
- The published GitHub, Visual Studio Marketplace, and Open VSX version `0.3.3` payloads matched the package rebuilt from the tagged source; the `0.3.4` candidate advances release metadata and documentation without changing runtime behavior.

## Residual And Accepted Risks

- The extension intentionally executes an arbitrary user-level command in the integrated terminal. Workspace Trust and global-only command resolution prevent repositories from selecting that command, but users remain responsible for their global setting and shell environment.
- The affected npm packages remain development-only transitive dependencies. Future advisories must continue to be handled through the audit gate and Dependabot security updates.
- Routine Dependabot version-update pull requests remain disabled; major and non-security dependency upgrades require deliberate maintainer review.
- Publishing remains manual, and publisher credentials stay outside the repository.

## Result

The reviewed state has no known npm audit findings, no open CodeQL or secret-scanning alerts, and no identified unresolved critical or high-impact runtime vulnerability. Runtime behavior, public command and setting IDs, and the published icon artwork are unchanged; release metadata advances to `0.3.4`.
