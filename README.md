# Kilo CLI launcher

Kilo CLI launcher is an unofficial VS Code extension that opens Kilo CLI in a new side terminal directly from the editor toolbar.

Works on Windows, macOS, and Linux.

> **Disclaimer**
> This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode. "Kilo" and "KiloCode" are trademarks of their respective owners.

## Features

- Adds a launcher button to the editor title area
- Opens a fresh terminal beside the active editor on every launch
- Runs a configurable Kilo CLI command
- Supports quoted Windows executable paths
- Does not collect telemetry, analytics, or personal data

## Requirements

- VS Code `^1.86.0`
- Kilo CLI available on `PATH`, or a working custom launch command configured in settings

## Installation

1. Install the extension from the VS Code Marketplace.
2. Install Kilo CLI globally, for example:

```bash
pnpm add -g @kilocode/cli
```

3. Open any file in VS Code.
4. Click the launcher button in the editor title.

Any equivalent install or launch method that makes `kilo` available in your terminal also works.

## How It Works

Each launch creates a new terminal beside the current editor and sends the configured command immediately. Existing terminals are not reused.

## Configuration

The extension keeps the `kilocodeCliLauncher` setting IDs for backward compatibility. Only the user-facing labels use the `Kilo CLI launcher` name.

| Setting | Default | Description |
| --- | --- | --- |
| `kilocodeCliLauncher.cliCommand` | `kilo` | Command executed when the launcher button is clicked. |
| `kilocodeCliLauncher.terminalName` | `Kilo CLI` | Base label used for the created terminal. |

Use the Command Palette to open the extension settings:

- `Kilo CLI launcher: Open Settings`

Examples:

Default command:

```json
"kilocodeCliLauncher.cliCommand": "kilo"
```

Launch through `pnpm dlx`:

```json
"kilocodeCliLauncher.cliCommand": "pnpm dlx @kilocode/cli"
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

### Message: "Kilo CLI is not installed..."

Install Kilo CLI globally and confirm that `kilo` works in a regular terminal, for example:

```bash
pnpm add -g @kilocode/cli
```

### Nothing happens after clicking the button

Check `kilocodeCliLauncher.cliCommand` and verify that the same command works in a regular terminal.

### Custom executable path on Windows

Quote executable paths that contain spaces. This is required for commands such as `"C:\Program Files\Kilo CLI\kilo.cmd"`.

### Custom launch commands

Commands such as `pnpm dlx @kilocode/cli` are supported. The extension only performs the explicit install check when the executable is the plain `kilo` command.

## Privacy

Kilo CLI launcher does not collect telemetry, analytics, or personal data.

## Development

Local verification and packaging:

```bash
pnpm install
pnpm run check
pnpm run package
```

`pnpm run package` creates the `.vsix` file in the workspace root.

## Support

Open a GitHub issue for bugs and feature requests. For support details, see `SUPPORT.md`.

## License

Released under the MIT License. See `LICENSE` for details.
