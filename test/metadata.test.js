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
  assert.equal(packageJson.version, '0.1.6');
  assert.equal(packageJson.packageManager, undefined);
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
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./test/integration/runTest.js');
  assert.equal(packageJson.scripts['test:integration'], 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node ./test/integration/runTest.js');
  assert.equal(packageJson.scripts.check, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./test/integration/runTest.js && node ./node_modules/@vscode/vsce/vsce ls');
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
  assert.match(readme, /npm install -g @kilocode\/cli/);
  assert.match(readme, /npm run check/);
  assert.match(readme, /uses the active editor workspace when available/i);
  assert.match(readme, /the launcher does not block startup with a local PATH pre-check/i);
  assert.match(readme, /shows an install hint when the default `kilo` command fails because it is missing/i);
  assert.match(readme, /shows a VS Code warning after this failure so the error is easier to understand/i);
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

test('README uses npm-based examples and keeps privacy guidance visible', () => {
  const readme = readText('README.md');

  assert.match(readme, /does not collect telemetry, analytics, or personal data\./i);
  assert.match(readme, /npm install -g @kilocode\/cli/);
  assert.match(readme, /npm run package/);
  assert.match(readme, /npx --yes @kilocode\/cli/);
});

test('ignore rules keep tests docs source maps and local tooling out of artifacts', () => {
  const gitignoreEntries = readIgnoreEntries('.gitignore');
  const vscodeignoreEntries = readIgnoreEntries('.vscodeignore');

  assert.ok(gitignoreEntries.includes('.vsce/'));
  assert.ok(gitignoreEntries.includes('coverage/'));
  assert.ok(gitignoreEntries.includes('*.log'));
  assert.ok(gitignoreEntries.includes('.kilo/'));
  assert.ok(gitignoreEntries.includes('out/**/*.map'));
  assert.ok(gitignoreEntries.includes('package-lock.json') === false);
  assert.ok(gitignoreEntries.includes('.pnpm-store/') === false);

  assert.ok(vscodeignoreEntries.includes('test/**'));
  assert.ok(vscodeignoreEntries.includes('docs/**'));
  assert.ok(vscodeignoreEntries.includes('.gitignore'));
  assert.ok(vscodeignoreEntries.includes('out/**/*.map'));
  assert.ok(vscodeignoreEntries.includes('*.tsbuildinfo'));
  assert.ok(vscodeignoreEntries.includes('.vsce/**'));
  assert.ok(vscodeignoreEntries.includes('package-lock.json'));
  assert.ok(!vscodeignoreEntries.includes('pnpm-lock.yaml'));
  assert.ok(!vscodeignoreEntries.includes('.pnpm-store/**'));
});

test('changelog documents the 0.1.6 asset refresh and keeps historical release notes', () => {
  const changelog = readText('CHANGELOG.md');

  assert.match(changelog, /## 0\.1\.6[\s\S]*### Changed/s);
  assert.match(changelog, /## 0\.1\.6[\s\S]*Refreshed the extension logos and Marketplace icon assets\./s);
  assert.match(changelog, /## 0\.1\.5[\s\S]*### Changed/s);
  assert.match(changelog, /## 0\.1\.5[\s\S]*Added a guided install warning when shell integration confirms that the default `kilo` command is missing from the terminal environment\./s);
  assert.match(changelog, /## 0\.1\.5[\s\S]*Kept the non-blocking launch flow while avoiding false positives for custom commands and unrelated terminal failures\./s);
  assert.match(changelog, /## 0\.1\.5[\s\S]*Updated end-user documentation for the new missing-install feedback path\./s);
  assert.match(changelog, /## 0\.1\.0[\s\S]*Updated public-facing project details and documentation\./);
  assert.match(changelog, /## 0\.0\.9[\s\S]*Improved overall reliability and packaging consistency\./);
  assert.match(changelog, /## 0\.0\.8\s+### Fixed\s+- General stability improvements\./s);
});

test('CI workflow validates the extension with npm on Windows and Linux', () => {
  const workflow = readText('.github/workflows/ci.yml');

  assert.match(workflow, /^name: CI$/m);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /ubuntu-latest/);
  assert.match(workflow, /cache: npm/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run check/);
});
