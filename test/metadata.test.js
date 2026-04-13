const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

/** Returns UTF-8 file contents from the repository root. */
function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

/** Parses package.json for deterministic metadata assertions. */
function readPackageJson() {
  return JSON.parse(readText('package.json'));
}

/** Returns non-empty ignore entries for line-based assertions. */
function readIgnoreEntries(relativePath) {
  return readText(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

test('package metadata keeps compatibility IDs while using Launcher for Kilo CLI branding', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.displayName, 'Launcher for Kilo CLI');
  assert.equal(packageJson.description, 'Unofficial VS Code extension to quickly launch and manage Kilo CLI.');
  assert.equal(packageJson.version, '0.1.1');
  assert.equal(packageJson.contributes.configuration.title, 'Launcher for Kilo CLI');

  const [openCliCommand, openSettingsCommand] = packageJson.contributes.commands;
  assert.equal(openCliCommand.command, 'kilocodeCliLauncher.openCli');
  assert.equal(openCliCommand.category, 'Launcher for Kilo CLI');
  assert.equal(openSettingsCommand.command, 'kilocodeCliLauncher.openSettings');
  assert.equal(openSettingsCommand.category, 'Launcher for Kilo CLI');
  assert.equal(openSettingsCommand.title, 'Open Extension Settings');
});

test('package scripts use deterministic local tooling entry points', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.scripts.compile, 'node ./node_modules/typescript/bin/tsc -p . --pretty false');
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js');
  assert.equal(packageJson.scripts.check, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./node_modules/@vscode/vsce/vsce ls');
  assert.equal(packageJson.scripts.package, 'node ./node_modules/@vscode/vsce/vsce package');
});

test('README documents the launcher branding, disclaimer, and quoted Windows command paths', () => {
  const readme = readText('README.md');

  assert.match(readme, /^# Launcher for Kilo CLI/m);
  assert.match(readme, /Launcher for Kilo CLI is an unofficial VS Code extension that helps you launch Kilo CLI from within the editor\./);
  assert.match(readme, /This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode\./);
  assert.match(readme, /Launcher for Kilo CLI: Open Extension Settings/);
  assert.match(readme, /keeps the `kilocodeCliLauncher` setting IDs for backward compatibility/i);
  assert.match(readme, /\\"C:\\\\Program Files\\\\Kilo CLI\\\\kilo\.cmd\\"/);
  assert.match(readme, /This extension does not collect telemetry, analytics, or personal data\./);
  assert.match(readme, /npm install/);
  assert.match(readme, /npm run check/);
  assert.match(readme, /npm install -g @kilocode\/cli/);
});

test('ignore rules keep tests docs source maps and local tooling out of artifacts', () => {
  const gitignoreEntries = readIgnoreEntries('.gitignore');
  const vscodeignoreEntries = readIgnoreEntries('.vscodeignore');

  assert.ok(gitignoreEntries.includes('.pnpm-store/'));
  assert.ok(gitignoreEntries.includes('.vsce/'));
  assert.ok(gitignoreEntries.includes('coverage/'));
  assert.ok(gitignoreEntries.includes('*.log'));
  assert.ok(gitignoreEntries.includes('.kilo/'));
  assert.ok(gitignoreEntries.includes('out/**/*.map'));

  assert.ok(vscodeignoreEntries.includes('test/**'));
  assert.ok(vscodeignoreEntries.includes('docs/**'));
  assert.ok(vscodeignoreEntries.includes('.gitignore'));
  assert.ok(vscodeignoreEntries.includes('out/**/*.map'));
  assert.ok(vscodeignoreEntries.includes('*.tsbuildinfo'));
  assert.ok(vscodeignoreEntries.includes('.pnpm-store/**'));
  assert.ok(vscodeignoreEntries.includes('.vsce/**'));
});

test('changelog keeps concise release notes for current and previous versions', () => {
  const changelog = readText('CHANGELOG.md');

  assert.doesNotMatch(changelog, /## Unreleased\s+###/s);
  assert.match(changelog, /## 0\.1\.0[\s\S]*Updated public-facing project details and documentation\./);
  assert.match(changelog, /## 0\.0\.9[\s\S]*Improved overall reliability and packaging consistency\./);
  assert.match(changelog, /## 0\.0\.8\s+### Fixed\s+- General stability improvements\./s);
});
