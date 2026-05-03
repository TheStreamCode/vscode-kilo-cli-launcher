import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  FALLBACK_TERMINAL_NAME,
  buildExtensionSettingsQuery,
  buildKiloInstallPromptCommand,
  buildKiloInstallPromptScript,
  buildTerminalName,
  extractExecutable,
  normalizeCliCommand,
  normalizeTerminalName,
  resolveTerminalCwd,
  shouldPromptToInstallKilo,
} from './command-utils.js';

let terminalSequence = 1;

function writeKiloInstallPromptScript(): string {
  const scriptPath = path.join(os.tmpdir(), 'kilo-cli-install-prompt.js');
  fs.writeFileSync(scriptPath, buildKiloInstallPromptScript(), 'utf8');

  return scriptPath;
}

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

      terminal.sendText(buildKiloInstallPromptCommand(writeKiloInstallPromptScript()), true);
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
