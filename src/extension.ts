import * as vscode from 'vscode';
import {
  FALLBACK_TERMINAL_NAME,
  buildExtensionSettingsQuery,
  buildTerminalName,
  extractExecutable,
  normalizeCliCommand,
  normalizeTerminalName,
  resolveTerminalCwd,
  shouldPromptToInstallKilo,
} from './command-utils.js';

let terminalSequence = 1;
const INSTALL_KILO_COMMAND = 'npm install -g @kilocode/cli';

function collectShellExecutionOutput(execution: vscode.TerminalShellExecution): Promise<string> {
  return (async () => {
    let output = '';

    try {
      for await (const chunk of execution.read()) {
        output += chunk;
      }
    } catch {
      return output;
    }

    return output;
  })();
}

function watchForMissingKilo(terminal: vscode.Terminal, cliCommand: string, context: vscode.ExtensionContext): void {
  const executable = extractExecutable(cliCommand);
  if (executable !== 'kilo') {
    return;
  }

  let executionStarted = false;

  const startExecution = (shellIntegration: vscode.TerminalShellIntegration) => {
    if (executionStarted) {
      return;
    }

    executionStarted = true;
    shellIntegrationListener.dispose();
    clearTimeout(fallbackHandle);

    const execution = shellIntegration.executeCommand(cliCommand);
    const outputPromise = collectShellExecutionOutput(execution);

    const executionListener = vscode.window.onDidEndTerminalShellExecution(async (endEvent) => {
      if (endEvent.terminal !== terminal || endEvent.execution !== execution) {
        return;
      }

      executionListener.dispose();

      const output = await outputPromise;
      if (!shouldPromptToInstallKilo(cliCommand, endEvent.exitCode, output)) {
        return;
      }

      const selection = await vscode.window.showWarningMessage(
        `Kilo CLI does not seem to be installed in this terminal environment. Install it with ${INSTALL_KILO_COMMAND}.`,
        'Install',
        'Open Settings',
      );

      if (selection === 'Install') {
        const installTerminal = vscode.window.createTerminal({
          name: 'Install Kilo CLI',
          location: { viewColumn: vscode.ViewColumn.Beside },
        });
        installTerminal.show();
        installTerminal.sendText(INSTALL_KILO_COMMAND);
      } else if (selection === 'Open Settings') {
        await vscode.commands.executeCommand('kilocodeCliLauncher.openSettings');
      }
    });

    context.subscriptions.push(executionListener);
  };

  const shellIntegrationListener = vscode.window.onDidChangeTerminalShellIntegration(async (event) => {
    if (event.terminal !== terminal) {
      return;
    }

    startExecution(event.shellIntegration);
  });

  const fallbackHandle = setTimeout(() => {
    if (terminal.shellIntegration) {
      startExecution(terminal.shellIntegration);
      return;
    }

    executionStarted = true;
    shellIntegrationListener.dispose();
    terminal.sendText(cliCommand, true);
  }, 3000);

  if (terminal.shellIntegration) {
    startExecution(terminal.shellIntegration);
    return;
  }

  context.subscriptions.push(
    shellIntegrationListener,
    { dispose: () => clearTimeout(fallbackHandle) },
  );
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

      terminalSequence += 1;
      const cwd = resolveTerminalCwd(vscode.window.activeTextEditor, vscode.workspace);

      const terminal = vscode.window.createTerminal({
        name: terminalName,
        location: { viewColumn: vscode.ViewColumn.Beside },
        cwd,
      });
      terminal.show();
      watchForMissingKilo(terminal, cliCommand, context);
      void vscode.window.setStatusBarMessage(`Started ${terminalBaseName}`, 2500);
    });

  const openSettingsCommand = vscode.commands.registerCommand('kilocodeCliLauncher.openSettings', async () => {
    await vscode.commands.executeCommand('workbench.action.openSettings', buildExtensionSettingsQuery(context.extension.id));
  });

  context.subscriptions.push(openCliCommand, openSettingsCommand);
}

export function deactivate(): void {
}
