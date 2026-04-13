# Launcher for Kilo CLI

Launcher for Kilo CLI is an unofficial VS Code extension that helps you launch Kilo CLI from within the editor.

> **Disclaimer**
> This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode. "Kilo" and "KiloCode" are trademarks of their respective owners.

Each click opens a fresh terminal beside the active editor, so you can start a new Kilo CLI session quickly without reusing an old one.

## Quick Start

1. Install the extension from the VS Code Marketplace.
2. Make sure Kilo CLI is available in your terminal.
3. Open any file in VS Code.
4. Click the launcher button in the editor title bar.

One way to install Kilo CLI:

```bash
npm install -g @kilocode/cli
```

Any equivalent install method that makes `kilo` available on your PATH also works.

## Requirements

- VS Code `^1.86.0`
- Kilo CLI installed and available on PATH, or another working launch command configured in settings

If Kilo CLI is missing and the launcher is configured to use `kilo`, the extension shows a blocking system message with an install command.

## What It Does

- Adds a button to the editor title toolbar
- Opens a terminal beside the current editor
- Runs your configured Kilo launch command
- Creates a new terminal every time you click the button

## Configuration

The extension keeps the `kilocodeCliLauncher` setting IDs for backward compatibility with existing installs. Only the user-facing labels are branded as `Launcher for Kilo CLI`.

Available settings:

- `kilocodeCliLauncher.cliCommand`: command line used when the toolbar button is clicked. Default: `kilo`.
- `kilocodeCliLauncher.terminalName`: terminal label shown in VS Code. Default: `Kilo CLI`.

The default interactive command is `kilo`. If your binary is not on PATH, set the command to something like `npx kilo` or another launch command that works in your environment.

You can open extension settings quickly from the Command Palette:

- `Launcher for Kilo CLI: Open Extension Settings`

## Examples

Default setup:

```json
"kilocodeCliLauncher.cliCommand": "kilo"
```

Launch through `npx`:

```json
"kilocodeCliLauncher.cliCommand": "npx kilo"
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

- **Message: "Kilo CLI is not installed..."**
  Install it with:

  ```bash
  npm install -g @kilocode/cli
  ```

- **Nothing happens on click**
  Check `kilocodeCliLauncher.cliCommand` and verify that the same command works in a normal terminal.

- **Using a custom executable path on Windows**
  Quote the executable path when it contains spaces.

- **Using a custom launch command**
  Commands like `npx kilo` are supported. The extension only performs the explicit install check when the executable is the plain `kilo` command.

## For Maintainers

Local verification and packaging:

```bash
npm install
npm run check
npm run package
```

The package step creates the `.vsix` file in the workspace root.

## Privacy

This extension does not collect telemetry, analytics, or personal data.

## Project Links

- GitHub: https://github.com/TheStreamCode/vscode-kilo-cli-launcher
- Issues: https://github.com/TheStreamCode/vscode-kilo-cli-launcher/issues

## License

Released under the MIT License. See `LICENSE` for details.

## Credits

Michael Gasperini, Mikesoft: https://mikesoft.it
