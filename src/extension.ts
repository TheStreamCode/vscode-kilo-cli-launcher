import * as vscode from 'vscode';

const DEFAULT_TERMINAL_NAME = 'Kilo CLI';

let terminalSequence = 1;

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('kilocodeCliLauncher.openCli', () => {
      const configuration = vscode.workspace.getConfiguration('kilocodeCliLauncher');
      const cliCommand = configuration.get<string>('cliCommand', 'kilo').trim();
      const terminalName = configuration.get<string>('terminalName', DEFAULT_TERMINAL_NAME).trim() || DEFAULT_TERMINAL_NAME;

      if (!cliCommand) {
        void vscode.window.showErrorMessage('Set "kilocodeCliLauncher.cliCommand" to the command that starts Kilo CLI.');
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
    })
  );
}

export function deactivate(): void {
}