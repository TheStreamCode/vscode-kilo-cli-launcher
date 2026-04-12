const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeCliCommand,
  buildTerminalName,
  extractExecutable,
  shouldCheckKiloBinary,
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

test('extractExecutable returns the first token for simple commands', () => {
  assert.equal(extractExecutable('kilo --help'), 'kilo');
});

test('extractExecutable preserves quoted Windows paths with spaces', () => {
  assert.equal(
    extractExecutable('"C:\\Program Files\\Kilo CLI\\kilo.cmd" --workspace "C:\\Temp Folder"'),
    'C:\\Program Files\\Kilo CLI\\kilo.cmd',
  );
});

test('extractExecutable handles quoted commands with leading whitespace', () => {
  assert.equal(extractExecutable('   "C:\\Tools\\kilo.exe" --version'), 'C:\\Tools\\kilo.exe');
});

test('shouldCheckKiloBinary only checks the plain kilo executable', () => {
  assert.equal(shouldCheckKiloBinary('kilo --help'), true);
  assert.equal(shouldCheckKiloBinary('npx kilo'), false);
  assert.equal(shouldCheckKiloBinary('"C:\\Program Files\\Kilo CLI\\kilo.cmd"'), false);
});
