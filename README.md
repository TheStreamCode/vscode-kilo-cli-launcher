# Kilo CLI Launcher

A VS Code extension by Mikesoft for launching a configurable terminal command from the editor title bar.

This project is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode.

This extension adds an editor title button in the top-right toolbar that opens a terminal beside the current editor and runs your configured command.

Clicking the button again creates another terminal instead of reusing the one already open.

## Configuration

- `kilocodeCliLauncher.cliCommand`: command line used to run when the toolbar button is clicked. The default is `kilo`.
- `kilocodeCliLauncher.terminalName`: terminal label shown in VS Code.

The official docs start the interactive TUI with `kilo`. If your binary is not on PATH, set the command to something like `npx kilo` or another launch command that works in your environment.

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