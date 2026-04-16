const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCliCommand,
  buildTerminalName,
  buildExtensionSettingsQuery,
  extractExecutable,
  resolveTerminalCwd,
  shouldPromptToInstallKilo,
} = require('../out/command-utils.js');

test('normalizeCliCommand trims configured values', () => {
  assert.equal(normalizeCliCommand('  kilo --help  '), 'kilo --help');
});

test('normalizeCliCommand falls back when value is undefined', () => {
  assert.equal(normalizeCliCommand(undefined), 'kilo');
});

test('normalizeCliCommand preserves the blank command path for validation', () => {
  assert.equal(normalizeCliCommand('   '), '');
});

test('buildTerminalName uses the base name for the first terminal', () => {
  assert.equal(buildTerminalName('  Kilo CLI  ', 1), 'Kilo CLI');
});

test('buildTerminalName appends the sequence after the first terminal', () => {
  assert.equal(buildTerminalName('Kilo CLI', 3), 'Kilo CLI 3');
});

test('buildTerminalName falls back when the configured name is blank', () => {
  assert.equal(buildTerminalName('   ', 2), 'Kilo CLI 2');
});

test('buildExtensionSettingsQuery targets the current extension id', () => {
  assert.equal(buildExtensionSettingsQuery('mikesoft.vscode-kilo-cli-launcher'), '@ext:mikesoft.vscode-kilo-cli-launcher');
});

test('extractExecutable returns the first token for simple commands', () => {
  assert.equal(extractExecutable('kilo --help'), 'kilo');
});

test('extractExecutable preserves quoted Windows paths with spaces', () => {
  assert.equal(
    extractExecutable('"C:\\Program Files\\Kilo CLI\\kilo.cmd" --workspace "C:\\Temp Folder"'),
    'C:\\Program Files\\Kilo CLI\\kilo.cmd',
  );
});

test('shouldPromptToInstallKilo detects PowerShell command-not-found output', () => {
  const output = "kilo: The term 'kilo' is not recognized as a name of a cmdlet, function, script file, or executable program.";

  assert.equal(shouldPromptToInstallKilo('kilo', 1, output), true);
});

test('shouldPromptToInstallKilo detects POSIX command-not-found exit codes', () => {
  assert.equal(shouldPromptToInstallKilo('kilo', 127, ''), true);
});

test('shouldPromptToInstallKilo ignores custom commands', () => {
  assert.equal(shouldPromptToInstallKilo('npx --yes @kilocode/cli', 1, 'command not found'), false);
});

test('shouldPromptToInstallKilo ignores unrelated runtime failures', () => {
  assert.equal(shouldPromptToInstallKilo('kilo', 1, 'Error: authentication failed'), false);
});

test('shouldPromptToInstallKilo ignores generic not-found messages unrelated to the executable', () => {
  assert.equal(shouldPromptToInstallKilo('kilo', 1, 'Error: model not found'), false);
});

test('resolveTerminalCwd uses the active editor workspace when available', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder(uri) {
      return uri === 'file-b' ? { uri: 'workspace-b' } : undefined;
    },
  };

  const activeEditor = {
    document: {
      uri: 'file-b',
    },
  };

  assert.equal(resolveTerminalCwd(activeEditor, workspace), 'workspace-b');
});

test('resolveTerminalCwd falls back to the first workspace when the active editor is outside the workspace', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder() {
      return undefined;
    },
  };

  const activeEditor = {
    document: {
      uri: 'external-file',
    },
  };

  assert.equal(resolveTerminalCwd(activeEditor, workspace), 'workspace-a');
});

test('resolveTerminalCwd falls back to the first workspace when there is no active editor', () => {
  const workspace = {
    workspaceFolders: [
      { uri: 'workspace-a' },
      { uri: 'workspace-b' },
    ],
    getWorkspaceFolder() {
      return undefined;
    },
  };

  assert.equal(resolveTerminalCwd(undefined, workspace), 'workspace-a');
});

test('resolveTerminalCwd returns undefined when no workspace is open', () => {
  const workspace = {
    workspaceFolders: undefined,
    getWorkspaceFolder() {
      return undefined;
    },
  };

  assert.equal(resolveTerminalCwd(undefined, workspace), undefined);
});
