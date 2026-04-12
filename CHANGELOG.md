# Changelog

All notable changes to this project are documented in this file.

## Unreleased

## 0.0.9

### Added

- Added metadata regression tests for extension packaging and branding.

### Changed

- Updated user-facing branding to Kilo CLI Launcher while keeping `kilocodeCliLauncher` setting IDs for compatibility.
- Made compile, test, and check scripts deterministic by invoking workspace-local TypeScript and VSCE binaries.
- Documented quoted Windows path examples and the local `pnpm` workflow in the README.

### Fixed

- Tightened ignore and packaging rules so tests, docs, source maps, `.gitignore`, and local tooling artifacts stay out of VSIX or local-only git noise as appropriate.

## 0.0.8

### Fixed

- Stability improvements.

## 0.0.7

### Changed

- Refined extension metadata wording for Marketplace presentation.
- Updated documentation wording and credits formatting.

### Added

- Added a new command to open extension settings quickly from Command Palette.
- Added package filtering via `.vscodeignore` for cleaner Marketplace artifacts.

### Changed

- Updated Marketplace metadata for better discoverability.
- Updated toolbar command title to clarify side-terminal behavior.
- Added a lightweight `npm run check` quality script.

### Fixed

- Added a blocking system message when `kilo` is configured but Kilo CLI is not installed.

## 0.0.6

### Added

- Added a new command to open extension settings quickly from Command Palette.
- Added package filtering via `.vscodeignore` for cleaner Marketplace artifacts.

### Changed

- Updated Marketplace metadata for better discoverability.
- Updated toolbar command title to clarify side-terminal behavior.
- Added a lightweight `npm run check` quality script.
- Expanded README with requirements and troubleshooting guidance.

### Fixed

- Added a blocking system message when `kilo` is configured but Kilo CLI is not installed.

## 0.0.5

- Prepared the next Marketplace release with the latest public wording updates.

## 0.0.4

- Prepared the next Marketplace release after the custom branding update.

## 0.0.3

- Updated the toolbar and Marketplace icons with custom branding.

## 0.0.2

- Prepared Marketplace metadata and release assets.
- Refined the extension description and public presentation.
- Added support information for the Marketplace listing.

## 0.0.1

- Initial release of the Kilo CLI quick-open extension.
