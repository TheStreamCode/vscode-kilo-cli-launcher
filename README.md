# Kilo CLI launcher

Kilo CLI launcher is an unofficial VS Code extension that opens Kilo CLI in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux.

> **Disclaimer**
> This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode. "Kilo" and "KiloCode" are trademarks of their respective owners.

## Features

- Adds a launcher button to the editor title area
- Opens a fresh terminal beside the active editor on every launch
- Uses the active editor workspace when available, with a fallback to the first open workspace folder
- Runs a configurable Kilo CLI command
- Shows a guided warning when the default `kilo` command is not available, with a one-click install button that runs the installation automatically
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code `^1.86.0`
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

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

When possible, the launcher opens the terminal in the workspace folder of the active editor. If the active editor is outside the workspace, it falls back to the first workspace folder in the current VS Code window.

The launcher checks command availability when the terminal runs, so it behaves consistently with your normal integrated terminal environment.

If the default `kilo` command is missing, the extension shows a guided warning with an `Install` button that opens a new terminal and runs the installation command automatically, plus a shortcut to the extension settings.

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

The launcher also shows a VS Code warning so the problem is easier to understand than relying only on terminal output.

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

## License

Released under the MIT License. See `LICENSE` for details.
