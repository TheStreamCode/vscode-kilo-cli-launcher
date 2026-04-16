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

test('package metadata uses Kilo CLI launcher branding while keeping compatibility IDs', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.displayName, 'Kilo CLI launcher');
  assert.equal(packageJson.description, 'Unofficial VS Code extension that opens Kilo CLI in a side terminal.');
  assert.equal(packageJson.version, '0.1.3');
  assert.equal(packageJson.contributes.configuration.title, 'Kilo CLI launcher');

  const [openCliCommand, openSettingsCommand] = packageJson.contributes.commands;
  assert.equal(openCliCommand.command, 'kilocodeCliLauncher.openCli');
  assert.equal(openCliCommand.title, 'Open Kilo CLI in Side Terminal');
  assert.equal(openCliCommand.category, 'Kilo CLI launcher');
  assert.equal(openSettingsCommand.command, 'kilocodeCliLauncher.openSettings');
  assert.equal(openSettingsCommand.category, 'Kilo CLI launcher');
  assert.equal(openSettingsCommand.title, 'Open Settings');
});

test('package scripts use deterministic local tooling entry points', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.scripts.compile, 'node ./node_modules/typescript/bin/tsc -p . --pretty false');
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js');
  assert.equal(packageJson.scripts.check, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./node_modules/@vscode/vsce/vsce ls');
  assert.equal(packageJson.scripts.package, 'node ./node_modules/@vscode/vsce/vsce package');
});

test('README is organized around user-facing setup, configuration, and troubleshooting', () => {
  const readme = readText('README.md');

  assert.match(readme, /^# Kilo CLI launcher$/m);
  assert.match(readme, /opens Kilo CLI in a new side terminal/i);
  assert.match(readme, /Works on Windows, macOS, and Linux\./);
  assert.match(readme, /This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode\./);
  assert.match(readme, /## Features/);
  assert.match(readme, /## Configuration/);
  assert.match(readme, /## Troubleshooting/);
  assert.match(readme, /Kilo CLI launcher: Open Settings/);
  assert.match(readme, /keeps the `kilocodeCliLauncher` setting IDs for backward compatibility/i);
  assert.match(readme, /\\"C:\\\\Program Files\\\\Kilo CLI\\\\kilo\.cmd\\"/);
  assert.match(readme, /pnpm add -g @kilocode\/cli/);
  assert.match(readme, /pnpm run check/);
  assert.match(readme, /does not collect telemetry, analytics, or personal data/i);
  assert.doesNotMatch(readme, /^## Credits$/m);
  assert.doesNotMatch(readme, /^## Project Links$/m);
});

test('SUPPORT explains when to use issues and when to contact the maintainer directly', () => {
  const support = readText('SUPPORT.md');

  assert.match(support, /^# Support$/m);
  assert.match(support, /GitHub Issues/);
  assert.match(support, /VS Code version/);
  assert.match(support, /info@mikesoft\.it/);
  assert.match(support, /https:\/\/mikesoft\.it/);
});

test('docs directory includes an index for engineering documents', () => {
  const docsReadme = readText('docs/README.md');

  assert.match(docsReadme, /^# Documentation$/m);
  assert.match(docsReadme, /root `README\.md`/);
  assert.match(docsReadme, /`specs\/`/);
  assert.match(docsReadme, /`plans\/`/);
});

test('README uses pnpm-based examples and keeps privacy guidance visible', () => {
  const readme = readText('README.md');

  assert.match(readme, /does not collect telemetry, analytics, or personal data\./i);
  assert.doesNotMatch(readme, /npm install -g @kilocode\/cli/);
  assert.match(readme, /pnpm add -g @kilocode\/cli/);
  assert.match(readme, /pnpm run package/);
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

test('changelog documents the 0.1.3 documentation refresh and keeps historical release notes', () => {
  const changelog = readText('CHANGELOG.md');

  assert.match(changelog, /## 0\.1\.3[\s\S]*### Changed/s);
  assert.match(changelog, /## 0\.1\.3[\s\S]*Reorganized repository documentation, support guidance, and engineering notes\./s);
  assert.match(changelog, /## 0\.1\.3[\s\S]*Standardized public naming as `Kilo CLI launcher` across metadata and documentation\./s);
  assert.match(changelog, /## 0\.1\.0[\s\S]*Updated public-facing project details and documentation\./);
  assert.match(changelog, /## 0\.0\.9[\s\S]*Improved overall reliability and packaging consistency\./);
  assert.match(changelog, /## 0\.0\.8\s+### Fixed\s+- General stability improvements\./s);
});
