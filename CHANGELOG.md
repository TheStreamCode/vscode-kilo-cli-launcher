# Changelog

All notable changes to this project are documented in this file.

## Unreleased

## 0.3.4

Released 2026-08-08. No change to launcher behavior, settings, command IDs, or published icon artwork.

### Added

- Added a dedicated 1280×640 GitHub social preview and a clearer product visual at the top of the README.

### Changed

- Reorganized the README around a concise quick start, user configuration, behavior, and troubleshooting before engineering details.
- Moved the Super CLI cross-promotion to the support section and standardized the public Kilo CLI Launcher capitalization.
- Updated official Kilo CLI documentation links to the canonical `kilo.ai` domain.

### Security

- Updated the lockfile to resolve current high-severity advisories in the development-only `fast-uri`, `js-yaml`, and `undici` dependency paths.
- Added regression coverage for the Workspace Trust, machine-scoped command, restricted-configuration, and blank-command security boundaries.
- Added a stable required CI check and aligned repository protection, Dependabot security updates, and private vulnerability reporting with the documented governance policy.

## 0.3.3

Released 2026-08-02. No change to launcher behavior, settings, or command IDs.

### Removed

- Removed the unreferenced `scripts/generate-icon.ps1`. It rendered a placeholder straight over `media/icon.png`, the icon published on the Marketplace and Open VSX, and had not matched that artwork since `0.1.8`.

### Added

- Added a metadata regression test that fails if any repository script or npm script can write over the published `media/` assets.

### Changed

- Documented `npm run test:unit` and `npm run package:contents` in the README command table.
- Corrected the Dependabot auto-merge workflow comments: `main` requires an approving review as well as passing checks, so auto-merge queues a pull request rather than merging on green CI alone.
- Recorded the branch-protection, asset, and packaging constraints of this repository in `AGENTS.md`.
- Made the extension-host test runner set an explicit non-zero exit code instead of relying on Node's unhandled-rejection default.

### Security

- Recorded the removed icon generator as finding `SEC-004` in `docs/security-review-2026-08-01.md`, together with the required-status-check mismatch on `main` as an accepted, fail-closed risk.

## 0.3.2

### Added

- Added an explicit type-check command, stricter TypeScript compiler checks, deterministic VS Code compatibility testing, and repository editor settings.
- Added a dated security review covering the extension runtime, dependencies, packaging, and GitHub Actions workflows.

### Changed

- Aligned release metadata across the package manifest, lockfile, citation file, and changelog; expanded development and release guidance; and refreshed contributor and agent instructions.
- Pinned VS Code API types to the minimum supported editor version and excluded engineering-only metadata from the VSIX package.
- Restored only the original global settings after integration tests, avoiding accidental persistence of resolved workspace or default values.

### Security

- Updated the lockfile to resolve the `brace-expansion` denial-of-service advisory in the development toolchain.
- Pinned GitHub Actions to verified full commit SHAs and disabled persisted checkout credentials in the read-only CI workflow.

## 0.3.1

### Security

- The launch command is now read from user-level settings only. `configuration.get('cliCommand')` also resolves workspace and workspace-folder values, so a cloned repository shipping a `.vscode/settings.json` could choose the command sent to the terminal on the first toolbar click. The extension now inspects the setting and reads `globalValue`/`defaultValue`, matching the hardening the sibling launchers have carried since their first release.

## 0.3.0

### Changed

- Superseded the `0.2.11` release with the same direct terminal launch behavior and manual installation guidance.

## 0.2.11

### Changed

- Removed automatic npm installation, temporary installer scripts, and terminal shell execution inspection.
- Kept the trusted-workspace launch flow while sending the configured command directly to the integrated terminal.
- Directs users with a missing Kilo CLI only to the verified official installation documentation.

### Security

- Reduced the extension runtime surface by removing generated scripts and child-process shell execution.

## 0.2.10

### Changed

- Improved legal documentation, trademark notices, third-party terms references, and metadata cleanup.

## 0.2.9

### Changed

- Upgraded TypeScript from `^5.0.0` to `^7.0.0` (resolved 7.0.2). No source or configuration changes were required.
- Raised the minimum required VS Code version to `^1.103.0` and aligned `@types/vscode` to match, so `vsce` validation passes against the declared engine floor.

### Security

- Resolved npm security vulnerabilities via `npm audit fix`.

## 0.2.8

### Added

- Added `CONTRIBUTING.md`, `SECURITY.md`, and `TRADEMARKS.md` governance documents for the public repository.
- Added a Workspace Trust check to the launch command so the agent is not started in untrusted workspaces, matching the rest of the launcher family.
- Added the `untrustedWorkspaces` capability, machine/window setting scopes, and a `test:unit` script.

### Changed

- Raised the minimum required VS Code version to `^1.93.0`, the actual floor for the terminal shell integration APIs the launcher uses (previously declared `^1.86.0`).
- Compiled against the `ES2022` target to align with the rest of the launcher family.

## 0.2.7

### Changed

- Unified the `LICENSE` copyright holder to **Michael Gasperini (Mikesoft)**. No functional changes.

## 0.2.6

### Changed

- Marketplace discoverability: added the **AI** and **Chat** categories, a more descriptive title and summary, and reordered keywords.
- Added Marketplace, Open VSX, and GitHub Sponsors badges, a `sponsor` link, and a pointer to **Super CLI** (the all-in-one launcher) to the README. No functional changes.

## 0.2.5

### Changed

- Documented the existing interactive guided install prompt with the official Kilo CLI npm package command.

## 0.2.4

### Changed

- Updated engineering documentation to reflect the current interactive terminal install prompt behavior.

## 0.2.3

### Changed

- Shortened the terminal install prompt and hid the internal prompt runner command from normal terminal output.

## 0.2.2

### Changed

- Replaced the VS Code missing CLI warning with an interactive terminal install prompt.

## 0.2.1

### Added

- Added `AGENTS.md` with repository contributor guidelines.

### Fixed

- Reduced false positives in the missing CLI warning when an installed `kilo` command reports unrelated missing files.
- Made the VS Code integration smoke test independent of a locally installed Kilo CLI.

## 0.2.0

### Added

- Added an `Install` button to the missing CLI warning that opens a new terminal and runs the installation command automatically.

### Changed

- Updated end-user documentation for the new one-click install flow.
- Rebuilt the `.vsix` package for the updated release.

## 0.1.9

### Changed

- Refined the public README so Marketplace-facing details stay focused on user-relevant setup, behavior, configuration, and troubleshooting.
- Removed internal branding and packaging notes from the end-user documentation.
- Rebuilt the `.vsix` package for the updated release.

## 0.1.8

### Changed

- Updated the packaged launcher mark and Marketplace icon assets to match the current branding.
- Refreshed the release documentation so the launcher SVG and Marketplace PNG are documented as separate packaged assets.
- Rebuilt the `.vsix` package for the updated release.

## 0.1.7

### Changed

- Aligned the command toolbar icon with VS Code UI icon guidance using a minimal monochrome SVG based on `currentColor`.
- Regenerated the Marketplace icon as a 256x256 branded PNG asset while keeping the product brand colors for store surfaces.
- Clarified the icon split in the README so packaging and branding expectations are easier to maintain.

## 0.1.6

### Changed

- Refreshed the extension logos and Marketplace icon assets.

## 0.1.5

### Changed

- Added a guided install warning when shell integration confirms that the default `kilo` command is missing from the terminal environment.
- Kept the non-blocking launch flow while avoiding false positives for custom commands and unrelated terminal failures.
- Updated end-user documentation for the new missing-install feedback path.

## 0.1.4

### Changed

- Removed the blocking local `kilo` PATH pre-check so launches rely on the integrated terminal environment.
- Opened new terminals in the active editor workspace when possible, with a workspace fallback for multi-root windows.
- Opened extension settings using the runtime extension id instead of a hardcoded marketplace identifier.
- Standardized local development on `npm`.
- Added VS Code integration smoke tests and CI coverage on Windows and Linux.
- Updated public and engineering documentation for the new runtime and verification behavior.

## 0.1.3

### Changed

- Reorganized repository documentation, support guidance, and engineering notes.
- Standardized public naming as `Kilo CLI launcher` across metadata and documentation.
- Clarified setup and Windows command examples for Kilo CLI launch commands.

## 0.1.2

### Changed

- Updated documentation and release packaging.

## 0.1.1

### Changed

- Updated release assets and packaging output.

## 0.1.0

### Changed

- Updated public-facing project details and documentation.
- Refined Marketplace presentation and repository materials.
- Refreshed release assets and packaging output.

## 0.0.9

### Added

- Added internal release validation coverage.

### Changed

- Updated project maintenance and packaging materials.
- Refreshed project documentation.

### Fixed

- Improved overall reliability and packaging consistency.

## 0.0.8

### Fixed

- General stability improvements.

## 0.0.7

### Added

- Added minor usability and packaging improvements.

### Changed

- Updated extension metadata, labels, and project documentation.

### Fixed

- Improved local CLI validation behavior.

## 0.0.6

### Added

- Added minor usability and packaging improvements.

### Changed

- Updated extension metadata and supporting documentation.

### Fixed

- Improved local CLI validation behavior.

## 0.0.5

- Documentation and packaging updates.

## 0.0.4

- Release preparation updates.

## 0.0.3

- Updated project assets.

## 0.0.2

- Updated Marketplace metadata and release assets.
- Refined public project information.
- Added support information.

## 0.0.1

- Initial release.
