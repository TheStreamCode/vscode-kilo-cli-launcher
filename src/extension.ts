import * as vscode from 'vscode';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const DEFAULT_TERMINAL_NAME = 'Kilo CLI';
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
      const cliCommand = configuration.get<string>('cliCommand', 'kilo').trim();
      const terminalName = configuration.get<string>('terminalName', DEFAULT_TERMINAL_NAME).trim() || DEFAULT_TERMINAL_NAME;

      if (!cliCommand) {
        void vscode.window.showErrorMessage('Set "kilocodeCliLauncher.cliCommand" to the command that starts Kilo CLI.');
        return;
      }

      const executable = cliCommand.split(/\s+/)[0];
      if (executable === 'kilo' && !(await isKiloCliInstalled())) {
        void vscode.window.showErrorMessage(MISSING_KILO_MESSAGE);
        return;
      }

      const suffix = terminalSequence === 1 ? '' : ` ${terminalSequence}`;
      terminalSequence += 1;

      const terminal = vscode.window.createTerminal({
        name: `${terminalName}${suffix}`,
        location: { viewColumn: vscode.ViewColumn.Beside },
      });
      terminal.show();
      terminal.sendText(cliCommand, true);
      void vscode.window.setStatusBarMessage(`Started ${terminalName}`, 2500);
    });

  const openSettingsCommand = vscode.commands.registerCommand('kilocodeCliLauncher.openSettings', async () => {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:mikesoft.vscode-kilo-cli-launcher kilocodeCliLauncher');
  });

  context.subscriptions.push(openCliCommand, openSettingsCommand);
}

export function deactivate(): void {
}
