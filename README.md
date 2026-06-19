# Kilo CLI launcher

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-kilo-cli-launcher?label=Marketplace&color=6366F1)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-kilo-cli-launcher)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/mikesoft.vscode-kilo-cli-launcher?color=0EA5E9)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-kilo-cli-launcher)
[![Open VSX](https://img.shields.io/open-vsx/v/mikesoft/vscode-kilo-cli-launcher?label=Open%20VSX&color=a60ee5)](https://open-vsx.org/extension/mikesoft/vscode-kilo-cli-launcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-TheStreamCode-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/TheStreamCode)

Kilo CLI launcher is an unofficial VS Code extension that opens Kilo CLI in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux.

Current documented release: `0.2.8`. See `CHANGELOG.md` for release-by-release changes.

> **✨ Want one launcher for every agent?** Try **[Super CLI](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-super-cli)** — a single sidebar that launches Claude Code, Codex, Copilot, Cursor, Grok, Kilo, Antigravity, OpenCode, and more. Install this launcher for Kilo alone, or Super CLI for the whole set.

> **Disclaimer**
> This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode. "Kilo" and "KiloCode" are trademarks of their respective owners.

## Features

- Adds a launcher button to the editor title area
- Opens a fresh terminal beside the active editor on every launch
- Uses the active editor workspace when available, with a fallback to the first open workspace folder
- Runs a configurable Kilo CLI command
- Prints an interactive terminal prompt when the default `kilo` command is not available
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code `^1.93.0`
- Kilo CLI available in the integrated terminal environment, or a working custom launch command configured in settings

## Installation

1. Install the extension from the VS Code Marketplace.
2. Install Kilo CLI globally, for example:

```bash
npm install -g @kilocode/cli
```

3. Open any file in VS Code.
4. Click the launcher button in the editor title.

Any equivalent install or launch method that makes `kilo` available in your terminal also works.

## Guided Installation

If the default `kilo` command is missing, the extension prints an interactive prompt in the same terminal. The prompt uses the official Kilo CLI npm package command and never installs without explicit confirmation:

```text
Cannot find Kilo CLI
Install Kilo CLI? (y/N):
```

Answer `y` or `yes` to run:

```bash
npm install -g @kilocode/cli
```

Any other answer cancels installation. Restart VS Code if your shell needs a new environment to see globally installed npm commands.

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

When possible, the launcher opens the terminal in the workspace folder of the active editor. If the active editor is outside the workspace, it falls back to the first workspace folder in the current VS Code window.

The launcher checks command availability when the terminal runs, so it behaves consistently with your normal integrated terminal environment.

If the default `kilo` command is missing, the extension prints the guided installation prompt in the same terminal:

```text
Cannot find Kilo CLI
Install Kilo CLI? (y/N):
```

Answer `y` or `yes` to run `npm install -g @kilocode/cli` in that terminal. Any other answer cancels installation.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `kilocodeCliLauncher.cliCommand` | `kilo` | Command executed when the launcher button is clicked. The command is sent directly to the integrated terminal. |
| `kilocodeCliLauncher.terminalName` | `Kilo CLI` | Base label used for the created terminal. |

Use the Command Palette to open the extension settings:

- `Kilo CLI launcher: Open Settings`

Examples:

Default command:

```json
"kilocodeCliLauncher.cliCommand": "kilo"
```

Launch through `npx`:

```json
"kilocodeCliLauncher.cliCommand": "npx --yes @kilocode/cli"
```

Windows executable path with spaces:

```json
"kilocodeCliLauncher.cliCommand": "\"C:\\Program Files\\Kilo CLI\\kilo.cmd\""
```

Windows executable path with arguments:

```json
"kilocodeCliLauncher.cliCommand": "\"C:\\Program Files\\Kilo CLI\\kilo.cmd\" --workspace \"C:\\Workspaces\\Sample Project\""
```

## Troubleshooting

### The terminal opens but `kilo` is not recognized

Install Kilo CLI globally and confirm that `kilo` works in a regular integrated terminal, for example:

```bash
npm install -g @kilocode/cli
```

If your setup relies on shell initialization, restart VS Code after installation so new terminals inherit the updated environment.

The launcher also prints an interactive terminal prompt so the problem is easier to resolve without leaving the terminal.

### Nothing happens after clicking the button

Check `kilocodeCliLauncher.cliCommand` and verify that the same command works in a regular terminal.

### Custom executable path on Windows

Quote executable paths that contain spaces. This is required for commands such as `"C:\Program Files\Kilo CLI\kilo.cmd"`.

### Custom launch commands

Commands such as `npx --yes @kilocode/cli` are supported.

### Multi-root workspaces

The launcher prefers the workspace folder of the active editor. To control where Kilo starts in a multi-root window, open a file from the target workspace before clicking the toolbar button.

## Privacy

Kilo CLI launcher does not collect telemetry, analytics, or personal data.

## Development

Local verification and packaging:

```bash
npm install
npm run check
npm run test:integration
npm run package
```

`npm run package` creates the `.vsix` file in the workspace root.

The repository includes unit tests, metadata checks, VS Code integration smoke tests, and CI coverage for Windows and Linux.

## Support

Open a GitHub issue for bugs and feature requests. For support details, see `SUPPORT.md`.

Financial support for the independent maintainer is available through GitHub Sponsors: [github.com/sponsors/TheStreamCode](https://github.com/sponsors/TheStreamCode).

## License

Released under the MIT License. See `LICENSE` for details.
