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

test('package metadata keeps compatibility IDs while using Kilo CLI Launcher branding', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.displayName, 'Kilo CLI Launcher');
  assert.equal(packageJson.version, '0.0.9');
  assert.equal(packageJson.contributes.configuration.title, 'Kilo CLI Launcher');

  const [openCliCommand, openSettingsCommand] = packageJson.contributes.commands;
  assert.equal(openCliCommand.command, 'kilocodeCliLauncher.openCli');
  assert.equal(openCliCommand.category, 'Kilo CLI Launcher');
  assert.equal(openSettingsCommand.command, 'kilocodeCliLauncher.openSettings');
  assert.equal(openSettingsCommand.category, 'Kilo CLI Launcher');
});

test('package scripts use deterministic local tooling entry points', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.scripts.compile, 'node ./node_modules/typescript/bin/tsc -p . --pretty false');
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js');
  assert.equal(packageJson.scripts.check, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./node_modules/@vscode/vsce/vsce ls');
  assert.equal(packageJson.scripts.package, 'node ./node_modules/@vscode/vsce/vsce package');
});

test('README documents the launcher branding and quoted Windows command paths', () => {
  const readme = readText('README.md');

  assert.match(readme, /^# Kilo CLI Launcher/m);
  assert.match(readme, /Kilo CLI Launcher: Open Kilo CLI Launcher Settings/);
  assert.match(readme, /keeps the `kilocodeCliLauncher` setting IDs for backward compatibility/i);
  assert.match(readme, /\\"C:\\\\Program Files\\\\Kilo CLI\\\\kilo\.cmd\\"/);
  assert.match(readme, /pnpm install/);
  assert.match(readme, /pnpm run check/);
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

test('changelog keeps the 0.0.8 stability note and adds unreleased release notes', () => {
  const changelog = readText('CHANGELOG.md');

  assert.match(changelog, /## Unreleased\s+## 0\.0\.9\s+### Added\s+- Added metadata regression tests for extension packaging and branding\./s);
  assert.match(changelog, /## 0\.0\.9[\s\S]*### Changed\s+- Updated user-facing branding to Kilo CLI Launcher while keeping `kilocodeCliLauncher` setting IDs for compatibility\./);
  assert.match(changelog, /## 0\.0\.9[\s\S]*### Fixed\s+- Tightened ignore and packaging rules so tests, docs, source maps, `.gitignore`, and local tooling artifacts stay out of VSIX or local-only git noise as appropriate\./);
  assert.match(changelog, /## 0\.0\.8\s+### Fixed\s+- Stability improvements\./s);
});
