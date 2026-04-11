# Kilo CLI Launcher

A VS Code extension by Mikesoft for launching a configurable terminal command from the editor title bar.

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

You can open extension settings quickly from Command Palette:

- `KiloCode: Open Kilo CLI Launcher Settings`

## Troubleshooting

- **Message: "Kilo CLI is not installed..."**
  Install it with:

  ```bash
  npm install -g @kilocode/cli
  ```

- **Nothing happens on click**
  Check `kilocodeCliLauncher.cliCommand` and verify the command runs correctly in a normal terminal.

## Repository

- GitHub: https://github.com/TheStreamCode/vscode-kilo-cli-launcher
- Issues: https://github.com/TheStreamCode/vscode-kilo-cli-launcher/issues
- Site: https://mikesoft.it

## Details

Created by Michael Gasperini, Mikesoft: https://mikesoft.it

## Build and package

```bash
npm install
npm run compile
npm run package
```

The package step creates the `.vsix` file in the workspace root.
