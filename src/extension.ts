import * as vscode from 'vscode';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import {
  FALLBACK_TERMINAL_NAME,
  buildTerminalName,
  normalizeCliCommand,
  normalizeTerminalName,
  shouldCheckKiloBinary,
} from './command-utils.js';

const MISSING_KILO_MESSAGE = 'Kilo CLI is not installed. Install it with the official command: npm install -g @kilocode/cli';
const execAsync = promisify(exec);

let terminalSequence = 1;

async function isKiloCliInstalled(): Promise<boolean> {
  const checkCommand = process.platform === 'win32' ? 'where kilo' : 'command -v kilo';

  try {
    await execAsync(checkCommand);
    return true;
  } catch {
    return false;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const openCliCommand = vscode.commands.registerCommand('kilocodeCliLauncher.openCli', async () => {
      const configuration = vscode.workspace.getConfiguration('kilocodeCliLauncher');
      const cliCommand = normalizeCliCommand(configuration.get<string>('cliCommand', 'kilo'));
      const configuredTerminalName = configuration.get<string>('terminalName', FALLBACK_TERMINAL_NAME);
      const terminalBaseName = normalizeTerminalName(configuredTerminalName, FALLBACK_TERMINAL_NAME);
      const terminalName = buildTerminalName(configuredTerminalName, terminalSequence, FALLBACK_TERMINAL_NAME);

      if (!cliCommand) {
        void vscode.window.showErrorMessage('Set "kilocodeCliLauncher.cliCommand" to the command that starts Kilo CLI.');
        return;
      }

      if (shouldCheckKiloBinary(cliCommand) && !(await isKiloCliInstalled())) {
        void vscode.window.showErrorMessage(MISSING_KILO_MESSAGE);
        return;
      }

      terminalSequence += 1;

      const terminal = vscode.window.createTerminal({
        name: terminalName,
        location: { viewColumn: vscode.ViewColumn.Beside },
      });
      terminal.show();
      terminal.sendText(cliCommand, true);
      void vscode.window.setStatusBarMessage(`Started ${terminalBaseName}`, 2500);
    });

  const openSettingsCommand = vscode.commands.registerCommand('kilocodeCliLauncher.openSettings', async () => {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:mikesoft.vscode-kilo-cli-launcher kilocodeCliLauncher');
  });

  context.subscriptions.push(openCliCommand, openSettingsCommand);
}

export function deactivate(): void {
}
