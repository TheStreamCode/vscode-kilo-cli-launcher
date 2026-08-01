# Kilo CLI launcher

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/mikesoft.vscode-kilo-cli-launcher?label=Marketplace&color=6366F1)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-kilo-cli-launcher)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/mikesoft.vscode-kilo-cli-launcher?color=0EA5E9)](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-kilo-cli-launcher)
[![Open VSX](https://img.shields.io/open-vsx/v/mikesoft/vscode-kilo-cli-launcher?label=Open%20VSX&color=a60ee5)](https://open-vsx.org/extension/mikesoft/vscode-kilo-cli-launcher)
[![CI](https://github.com/TheStreamCode/vscode-kilo-cli-launcher/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/vscode-kilo-cli-launcher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-TheStreamCode-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/TheStreamCode)

Kilo CLI launcher is an unofficial VS Code extension that opens Kilo CLI in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux.

See [CHANGELOG.md](CHANGELOG.md) for release-by-release changes.

> **✨ Want one launcher for every agent?** Try **[Super CLI](https://marketplace.visualstudio.com/items?itemName=mikesoft.vscode-super-cli)** — a single sidebar that launches Claude Code, Codex, Copilot, Cursor, Grok, Kilo, Antigravity, OpenCode, and more. Install this launcher for Kilo alone, or Super CLI for the whole set.

> **Disclaimer**
> This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode. Kilo-related names are used only to identify the compatible CLI. See [TRADEMARKS.md](TRADEMARKS.md).

## Features

- Adds a launcher button to the editor title area
- Opens a fresh terminal beside the active editor on every launch
- Uses the active editor workspace when available, with a fallback to the first open workspace folder
- Runs a configurable Kilo CLI command
- Leaves installation decisions to the user and links only to the official Kilo CLI documentation
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code `^1.103.0`
- Kilo CLI available in the integrated terminal environment, or a working custom launch command configured in settings

## Installation

1. Install the extension from the VS Code Marketplace.
2. Install Kilo CLI by following the [official Kilo CLI documentation](https://kilocode.ai/docs/code-with-ai/platforms/cli).

3. Open any file in VS Code.
4. Click the launcher button in the editor title.

Any equivalent install or launch method that makes `kilo` available in your terminal also works.

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

When possible, the launcher opens the terminal in the workspace folder of the active editor. If the active editor is outside the workspace, it falls back to the first workspace folder in the current VS Code window.

Launching is available only in trusted workspaces. The launcher runs the configured command only in VS Code's integrated terminal; review the workspace and command before you trust or launch it.

The extension does not install Kilo CLI, create installer scripts, or inspect shell execution. If `kilo` is unavailable, use the terminal error and open the [official Kilo CLI documentation](https://kilocode.ai/docs/code-with-ai/platforms/cli) to choose and run an installation method yourself.

## Architecture

The runtime intentionally has two small modules:

- `src/extension.ts` connects VS Code commands, Workspace Trust, settings, and terminal creation.
- `src/command-utils.ts` contains pure normalization and workspace-resolution helpers covered by Node unit tests.

Compiled CommonJS output is written to `out/` for the VS Code extension host. The extension has no production npm dependencies, background services, network client, telemetry, or persistent storage.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `kilocodeCliLauncher.cliCommand` | `kilo` | Command executed when the launcher button is clicked. The command is sent directly to the integrated terminal. |
| `kilocodeCliLauncher.terminalName` | `Kilo CLI` | Base label used for the created terminal. |

For security, `cliCommand` is read only from the user-level machine setting or its default. Workspace and workspace-folder overrides are ignored, so a cloned repository cannot replace the command launched from the toolbar. `terminalName` remains a window-scoped presentation setting.

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

Follow the [official Kilo CLI documentation](https://kilocode.ai/docs/code-with-ai/platforms/cli), then confirm that `kilo` works in a regular integrated terminal.

If your setup relies on shell initialization, restart VS Code after installation so new terminals inherit the updated environment.

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

## Environment Variables

The extension requires no runtime environment variables and does not load `.env` files. Kilo CLI itself may use its own environment or authentication configuration; follow the official Kilo documentation for those requirements.

For development only, `VSCODE_VERSION` selects the VS Code build used by the extension-host tests. It defaults to the minimum supported version, `1.103.0`; CI also tests the current stable release. Publishing credentials must stay outside the repository and be supplied through the publisher CLI's credential store or protected CI secrets.

## Development

Development requires Node.js 22 and npm. Install the exact dependency tree from `package-lock.json`:

```bash
npm ci
```

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run compile` | Build TypeScript into `out/`. |
| `npm run watch` | Recompile TypeScript in watch mode. |
| `npm run typecheck` | Run strict TypeScript checks without emitting files. |
| `npm run test:command-utils` | Run focused helper regressions. |
| `npm run test:metadata` | Validate metadata, documentation, packaging rules, and CI expectations. |
| `npm run test:unit` | Compile and run every Node unit test without launching VS Code. |
| `npm run test:integration` | Compile and run VS Code extension-host smoke tests. |
| `npm test` | Compile and run all unit, metadata, and integration tests. |
| `npm run audit` | Fail on high-severity npm advisories. |
| `npm run package:contents` | List the files that would ship inside the `.vsix`. |
| `npm run check` | Run type-check, all tests, integration smoke tests, and VSIX content inspection. |
| `npm run package` | Build a local `.vsix` package. |

Before opening a pull request:

```bash
npm run typecheck
npm run check
```

To test another editor version in PowerShell:

```powershell
$env:VSCODE_VERSION = 'stable'
npm run test:integration
```

`npm run package` creates an ignored `.vsix` file in the workspace root. Generated `out/`, `.vscode-test/`, coverage, logs, local `.env` files, and package artifacts are intentionally untracked.

The repository includes unit tests, metadata checks, VS Code integration smoke tests, and CI coverage for Windows and Linux.

## Release And Deployment

Releases are distributed through the Visual Studio Marketplace and Open VSX. Before publishing:

1. Update `package.json`, `package-lock.json`, `CITATION.cff`, and `CHANGELOG.md` to the same version.
2. Run `npm ci`, `npm run audit`, and `npm run check` from a clean checkout.
3. Run `npm run package` and install the resulting VSIX locally for a final smoke test.
4. Publish the verified artifact with authenticated Marketplace and Open VSX tooling.
5. Create the matching Git tag and GitHub release, then verify both marketplace listings.

CI validates pushes and pull requests but intentionally does not publish releases. Do not commit publisher tokens or place them in `.env` files.

## Support

Open a GitHub issue for bugs and feature requests. For support details, see `SUPPORT.md`.

Financial support for the independent maintainer is available through GitHub Sponsors: [github.com/sponsors/TheStreamCode](https://github.com/sponsors/TheStreamCode).

## License

Released under the MIT License. See `LICENSE` for details.
