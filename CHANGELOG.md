# Changelog

All notable changes to this project are documented in this file.

## Unreleased

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
