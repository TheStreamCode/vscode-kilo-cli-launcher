# Security Policy

## Supported Versions

Security fixes are applied to the latest Marketplace and Open VSX release. Upgrade to the latest available version before reporting an issue that affects an older build.

## Reporting A Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Email security concerns to info@mikesoft.it with a clear description, affected version, reproduction details, and potential impact. Redact tokens, credentials, personal data, and unrelated workspace content.

## Security Model

This extension launches user-configured terminal commands. Review workspace trust prompts and configuration changes before running commands in untrusted repositories.

The launch command is read only from the user-level setting or the extension default; workspace-controlled command overrides are ignored. The extension does not install Kilo CLI, create temporary installer scripts, invoke child processes, or inspect terminal shell executions. It sends the configured command only to the visible VS Code integrated terminal after Workspace Trust is granted. If Kilo CLI is missing, use only the [official Kilo CLI documentation](https://kilocode.ai/docs/code-with-ai/platforms/cli) for installation instructions.
