# Kilo CLI Launcher

A VS Code extension for launching a configurable terminal command from the editor title bar.

This project is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode.

This extension adds an editor title button in the top-right toolbar that opens a terminal beside the current editor and runs your configured command.

Clicking the button again creates another terminal instead of reusing the one already open.

## Requirements

- VS Code `^1.86.0`
- Kilo CLI installed and available on PATH.

Official install command:

```bash
npm install -g @kilocode/cli
```

If Kilo CLI is missing and the launcher is configured to use `kilo`, the extension shows a blocking system message with the official install command.

## Configuration

- `kilocodeCliLauncher.cliCommand`: command line used to run when the toolbar button is clicked. The default is `kilo`.
- `kilocodeCliLauncher.terminalName`: terminal label shown in VS Code.

The official docs start the interactive TUI with `kilo`. If your binary is not on PATH, set the command to something like `npx kilo` or another launch command that works in your environment.

The extension keeps the `kilocodeCliLauncher` setting IDs for backward compatibility with existing installs. Only the user-facing labels are branded as `Kilo CLI Launcher`.

On Windows, quote executable paths that contain spaces. Example `settings.json` value:

```json
"kilocodeCliLauncher.cliCommand": "\"C:\\Program Files\\Kilo CLI\\kilo.cmd\""
```

If you need to pass arguments as well, keep the executable path quoted:

```json
"kilocodeCliLauncher.cliCommand": "\"C:\\Program Files\\Kilo CLI\\kilo.cmd\" --workspace \"C:\\Workspaces\\Sample Project\""
```

You can open extension settings quickly from Command Palette:

- `Kilo CLI Launcher: Open Kilo CLI Launcher Settings`

## Troubleshooting

- **Message: "Kilo CLI is not installed..."**
  Install it with:

  ```bash
  npm install -g @kilocode/cli
  ```

- **Nothing happens on click**
  Check `kilocodeCliLauncher.cliCommand` and verify the command runs correctly in a normal terminal.

- **Custom executable path on Windows**
  Quote the executable path when it contains spaces, for example:

  ```json
  "kilocodeCliLauncher.cliCommand": "\"C:\\Program Files\\Kilo CLI\\kilo.cmd\" --workspace \"C:\\Workspaces\\Sample Project\""
  ```

## Repository

- GitHub: https://github.com/TheStreamCode/vscode-kilo-cli-launcher
- Issues: https://github.com/TheStreamCode/vscode-kilo-cli-launcher/issues
- Site: https://mikesoft.it

## Details

Credits: Michael Gasperini, Mikesoft: https://mikesoft.it

## Build and package

```bash
pnpm install
pnpm run check
pnpm run package
```

The package step creates the `.vsix` file in the workspace root.
