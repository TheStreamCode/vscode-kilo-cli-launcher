# Security Policy

Please do not report security vulnerabilities through public GitHub issues.

Email security concerns to info@mikesoft.it with a clear description, affected version, and reproduction details.

This extension launches user-configured terminal commands. Review workspace trust prompts and configuration changes before running commands in untrusted repositories.

The extension does not install Kilo CLI, create temporary installer scripts, invoke child processes, or inspect terminal shell executions. It sends the configured command only to the visible VS Code integrated terminal after Workspace Trust is granted. If Kilo CLI is missing, use only the [official Kilo CLI documentation](https://kilocode.ai/docs/code-with-ai/platforms/cli) for installation instructions.
