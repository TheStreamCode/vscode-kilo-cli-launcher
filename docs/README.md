# Documentation

This directory contains engineering documents for the repository. End-user installation, usage, and troubleshooting guidance lives in the root `README.md`.

## Structure

- `specs/`: scoped design documents for engineering changes
- `plans/`: implementation plans and historical execution notes
- `images/github-social-preview.png`: reusable 1280×640 repository social preview; it is intentionally excluded from the VSIX
- `security-review-2026-08-01.md`: dated review of runtime, dependency, packaging, and CI security
- `security-review-2026-08-08.md`: current dependency, regression, packaging, and GitHub governance review

Current release hardening focuses on predictable direct terminal launch behavior, workspace-aware terminal placement, manual installation guidance through the official Kilo CLI documentation, npm-based local tooling, packaged branding assets for VS Code and Marketplace surfaces, and automated validation in CI.

## Document Status

Files in `docs/` capture design and implementation decisions at a specific point in time. They may describe historical context, while the root documentation reflects the current product behavior.
