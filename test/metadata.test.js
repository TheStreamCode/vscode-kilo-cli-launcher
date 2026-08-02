const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const PNG_SIGNATURE_SIZE = 8;
const ASSET_WRITER_DIRECTORIES = ['scripts', 'src', '.github'];
const TEXT_FILE_EXTENSIONS = new Set(['.ps1', '.sh', '.js', '.mjs', '.cjs', '.ts', '.yml', '.yaml']);

/** Returns UTF-8 file contents from the repository root. */
function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

/** Returns repository-relative text files under a directory, recursively. */
function collectTextFiles(relativeDirectory) {
  const absoluteDirectory = path.join(rootDir, relativeDirectory);

  if (!fs.existsSync(absoluteDirectory)) {
    return [];
  }

  return fs
    .readdirSync(absoluteDirectory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && TEXT_FILE_EXTENSIONS.has(path.extname(entry.name)))
    .map((entry) => path.relative(rootDir, path.join(entry.parentPath, entry.name)));
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

/** Reads PNG dimensions directly from the IHDR chunk. */
function readPngSize(relativePath) {
  const fileBuffer = fs.readFileSync(path.join(rootDir, relativePath));
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  assert.deepEqual(fileBuffer.subarray(0, PNG_SIGNATURE_SIZE), pngSignature);

  return {
    width: fileBuffer.readUInt32BE(16),
    height: fileBuffer.readUInt32BE(20),
  };
}

test('package metadata uses Kilo CLI launcher branding while keeping compatibility IDs', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.displayName, 'Kilo CLI Launcher — Run Kilo Code in a Side Terminal');
  assert.equal(packageJson.description, 'Launch the Kilo Code AI coding agent CLI in a side terminal from your editor toolbar — one click, fresh terminal. Unofficial; works in VS Code, Cursor & Windsurf on Windows, macOS & Linux.');
  assert.match(packageJson.version, /^\d+\.\d+\.\d+$/);
  assert.equal(JSON.parse(readText('package-lock.json')).version, packageJson.version);
  assert.equal(packageJson.packageManager, undefined);
  assert.equal(packageJson.icon, 'media/icon.png');
  assert.equal(packageJson.contributes.configuration.title, 'Kilo CLI launcher');

  const [openCliCommand, openSettingsCommand] = packageJson.contributes.commands;
  assert.equal(openCliCommand.command, 'kilocodeCliLauncher.openCli');
  assert.equal(openCliCommand.title, 'Open Kilo CLI in Side Terminal');
  assert.equal(openCliCommand.category, 'Kilo CLI launcher');
  assert.deepEqual(openCliCommand.icon, {
    light: './media/launcher-mark.svg',
    dark: './media/launcher-mark.svg',
  });
  assert.equal(openSettingsCommand.command, 'kilocodeCliLauncher.openSettings');
  assert.equal(openSettingsCommand.category, 'Kilo CLI launcher');
  assert.equal(openSettingsCommand.title, 'Open Settings');
});

test('launcher has no automatic install, temporary script, or shell execution pipeline', () => {
  const extensionSource = readText('src/extension.ts');
  const commandUtilsSource = readText('src/command-utils.ts');

  assert.match(extensionSource, /terminal\.sendText\(cliCommand, true\)/);
  assert.doesNotMatch(extensionSource, /node:(?:fs|os|path)/);
  assert.doesNotMatch(extensionSource, /shellIntegration|TerminalShellExecution|executeCommand\(cliCommand\)/i);
  assert.doesNotMatch(extensionSource, /installPrompt|writeFileSync|tmpdir/i);
  assert.doesNotMatch(commandUtilsSource, /npm install|child_process|shell:\s*true|installPrompt/i);
});

test('extension assets keep Marketplace and command icons packaged on the expected paths', () => {
  const marketplaceIcon = readPngSize('media/icon.png');
  const commandIcon = readText('media/launcher-mark.svg');

  assert.ok(marketplaceIcon.width >= 256);
  assert.ok(marketplaceIcon.height >= 256);
  assert.match(commandIcon, /<svg/i);
  assert.ok(commandIcon.length > 0);
});

// `scripts/generate-icon.ps1` used to render a placeholder icon straight over
// media/icon.png. It stopped matching the published artwork at 0.1.8 and was
// removed, so nothing in the repository may overwrite a shipped asset again.
test('no repository script can regenerate the published Marketplace icon', () => {
  const packageJson = readPackageJson();

  assert.equal(fs.existsSync(path.join(rootDir, 'scripts', 'generate-icon.ps1')), false);
  assert.doesNotMatch(Object.values(packageJson.scripts).join('\n'), /icon/i);

  for (const relativePath of ASSET_WRITER_DIRECTORIES.flatMap(collectTextFiles)) {
    assert.doesNotMatch(
      readText(relativePath),
      /media[\\/](?:icon\.png|launcher-mark\.svg)/i,
      `${relativePath} must not write a published media asset`,
    );
  }
});

test('package scripts use deterministic local tooling entry points', () => {
  const packageJson = readPackageJson();

  assert.equal(packageJson.scripts.compile, 'node ./node_modules/typescript/bin/tsc -p . --pretty false');
  assert.equal(packageJson.scripts.typecheck, 'node ./node_modules/typescript/bin/tsc -p . --noEmit --pretty false');
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js && node ./test/integration/runTest.js');
  assert.equal(packageJson.scripts['test:integration'], 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node ./test/integration/runTest.js');
  assert.equal(packageJson.scripts.audit, 'npm audit --audit-level=high --omit=optional');
  assert.equal(packageJson.scripts.check, 'npm run typecheck && npm test && npm run package:contents');
  assert.equal(packageJson.scripts.package, 'node ./node_modules/@vscode/vsce/vsce package');
});

test('README is organized around user-facing setup, configuration, and troubleshooting', () => {
  const readme = readText('README.md');

  assert.match(readme, /^# Kilo CLI launcher$/m);
  assert.match(readme, /opens Kilo CLI in a new side terminal/i);
  assert.match(readme, /Works on Windows, macOS, and Linux\./);
  assert.match(readme, /This extension is unofficial and is not affiliated with, endorsed by, or sponsored by Kilo or KiloCode/);
  assert.match(readme, /## Features/);
  assert.match(readme, /## Architecture/);
  assert.match(readme, /official Kilo CLI documentation/i);
  assert.match(readme, /## Configuration/);
  assert.match(readme, /## Environment Variables/);
  assert.match(readme, /## Troubleshooting/);
  assert.match(readme, /Kilo CLI launcher: Open Settings/);
  assert.match(readme, /\\"C:\\\\Program Files\\\\Kilo CLI\\\\kilo\.cmd\\"/);
  assert.match(readme, /npm run check/);
  assert.match(readme, /npm run typecheck/);
  assert.match(readme, /npm ci/);
  assert.match(readme, /uses the active editor workspace when available/i);
  assert.match(readme, /https:\/\/kilocode\.ai\/docs\/code-with-ai\/platforms\/cli/);
  assert.match(readme, /does not install Kilo CLI/i);
  assert.doesNotMatch(readme, /Guided Installation|Install Kilo CLI\? \(y\/N\):/i);
  assert.match(readme, /does not collect telemetry, analytics, or personal data/i);
  assert.doesNotMatch(readme, /launcher-mark\.svg/i);
  assert.doesNotMatch(readme, /media\/icon\.png/i);
  assert.doesNotMatch(readme, /backward compatibility/i);
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
  assert.match(docsReadme, /`security-review-2026-08-01\.md`/);
  assert.equal(fs.existsSync(path.join(rootDir, 'docs', 'security-review-2026-08-01.md')), true);
  assert.doesNotMatch(docsReadme, /interactive terminal install prompt/i);
});

test('README uses official installation guidance and keeps privacy guidance visible', () => {
  const readme = readText('README.md');

  assert.match(readme, /does not collect telemetry, analytics, or personal data\./i);
  assert.match(readme, /https:\/\/kilocode\.ai\/docs\/code-with-ai\/platforms\/cli/);
  assert.match(readme, /npm run package/);
  assert.match(readme, /npx --yes @kilocode\/cli/);
});

test('ignore rules keep tests docs source maps and local tooling out of artifacts', () => {
  const gitignoreEntries = readIgnoreEntries('.gitignore');
  const vscodeignoreEntries = readIgnoreEntries('.vscodeignore');

  assert.ok(gitignoreEntries.includes('.vsce/'));
  assert.ok(gitignoreEntries.includes('coverage/'));
  assert.ok(gitignoreEntries.includes('*.log'));
  assert.ok(gitignoreEntries.includes('.env'));
  assert.ok(gitignoreEntries.includes('.env.*'));
  assert.ok(gitignoreEntries.includes('!.env.example'));
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
  assert.ok(vscodeignoreEntries.includes('AGENTS.md'));
  assert.ok(vscodeignoreEntries.includes('CITATION.cff'));
  assert.ok(!vscodeignoreEntries.includes('pnpm-lock.yaml'));
  assert.ok(!vscodeignoreEntries.includes('.pnpm-store/**'));
});

test('release metadata and changelog stay aligned with package.json', () => {
  const packageJson = readPackageJson();
  const changelog = readText('CHANGELOG.md');
  const citation = readText('CITATION.cff');
  const releaseDate = '2026-08-02';

  assert.match(changelog, /^## Unreleased$/m);
  assert.match(changelog, new RegExp(`^## ${packageJson.version.replaceAll('.', '\\.')}$$`, 'm'));
  assert.match(changelog, new RegExp(`^Released ${releaseDate}\\.`, 'm'));
  assert.match(citation, new RegExp(`^version: "${packageJson.version.replaceAll('.', '\\.')}"$$`, 'm'));
  assert.match(citation, new RegExp(`^date-released: "${releaseDate}"$$`, 'm'));
});

test('CI workflow uses least privilege and validates supported VS Code versions', () => {
  const workflow = readText('.github/workflows/ci.yml');

  assert.match(workflow, /^name: CI$/m);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /ubuntu-latest/);
  assert.match(workflow, /vscode-version: '1\.103\.0'/);
  assert.match(workflow, /vscode-version: stable/);
  assert.match(workflow, /permissions:\s+contents: read/s);
  assert.match(workflow, /actions\/checkout@[a-f0-9]{40} # v7/);
  assert.match(workflow, /actions\/setup-node@[a-f0-9]{40} # v6/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /cache: npm/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run audit/);
  assert.match(workflow, /npm run check/);
});
