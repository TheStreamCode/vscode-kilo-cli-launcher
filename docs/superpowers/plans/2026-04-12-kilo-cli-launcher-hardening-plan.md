# Kilo CLI Launcher Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the launcher's command parsing, align public branding, and add regression tests without expanding the extension's feature scope.

**Architecture:** Keep the extension small by extracting a single pure helper module for command parsing and terminal naming, while `src/extension.ts` remains a thin integration layer over the VS Code APIs. Use Node's built-in test runner with plain JavaScript test files that execute against compiled output so the project gains automation without introducing a new test framework.

**Tech Stack:** TypeScript, VS Code Extension API, Node.js built-in test runner, VSCE

---

## File Map

- `src/command-utils.ts` - pure helper functions for trimming commands, extracting executables, resolving terminal labels, and deciding when the `kilo` binary check should run.
- `src/extension.ts` - VS Code command registration and terminal launch orchestration using the helper module.
- `test/command-utils.test.js` - regression tests for command parsing and terminal naming behavior.
- `test/metadata.test.js` - regression tests for user-facing branding, package scripts, and ignore rules.
- `package.json` - extension metadata plus local `compile`, `test`, and `check` scripts.
- `README.md` - public usage docs, Windows quoting guidance, and command palette naming.
- `.gitignore` - local repository ignore rules for workspace-only artifacts.
- `.vscodeignore` - published VSIX exclude rules.
- `CHANGELOG.md` - unreleased notes for the hardening pass.

## Task 1: Extract and test launcher command helpers

**Files:**
- Create: `src/command-utils.ts`
- Create: `test/command-utils.test.js`
- Modify: `src/extension.ts`

- [ ] **Step 1: Write the failing helper test file**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_TERMINAL_NAME,
  buildTerminalLabel,
  extractExecutable,
  resolveCliCommand,
  resolveTerminalName,
  shouldCheckKiloBinary,
} = require('../out/command-utils.js');

/** Verifies that configured commands are trimmed before the launcher uses them. */
test('resolveCliCommand trims surrounding whitespace', () => {
  assert.equal(resolveCliCommand('  kilo --help  '), 'kilo --help');
  assert.equal(resolveCliCommand('   '), '');
});

/** Verifies that the executable token is extracted from unquoted commands. */
test('extractExecutable parses unquoted commands', () => {
  assert.equal(extractExecutable('kilo --help'), 'kilo');
  assert.equal(extractExecutable('npx kilo'), 'npx');
});

/** Verifies that quoted Windows executable paths are kept intact. */
test('extractExecutable parses quoted Windows paths', () => {
  assert.equal(
    extractExecutable('"C:\\Program Files\\Kilo CLI\\kilo.exe" --profile default'),
    'C:\\Program Files\\Kilo CLI\\kilo.exe',
  );
});

/** Verifies that terminal naming falls back to the default label and suffixes extra terminals. */
test('terminal naming uses the configured label with predictable suffixes', () => {
  assert.equal(resolveTerminalName('   '), DEFAULT_TERMINAL_NAME);
  assert.equal(buildTerminalLabel('Kilo CLI', 1), 'Kilo CLI');
  assert.equal(buildTerminalLabel('Kilo CLI', 3), 'Kilo CLI 3');
});

/** Verifies that the install check only runs for the bare kilo executable. */
test('shouldCheckKiloBinary only matches the bare kilo executable', () => {
  assert.equal(shouldCheckKiloBinary('kilo'), true);
  assert.equal(shouldCheckKiloBinary('npx'), false);
  assert.equal(shouldCheckKiloBinary('C:\\Program Files\\Kilo CLI\\kilo.exe'), false);
});
```

- [ ] **Step 2: Run the helper test to verify it fails**

Run:

```bash
node --test test/command-utils.test.js
```

Expected: FAIL with a module resolution error for `../out/command-utils.js` because the helper module does not exist yet.

- [ ] **Step 3: Write the helper module**

```ts
const QUOTED_EXECUTABLE_PATTERN = /^\s*(?:"([^"]+)"|'([^']+)'|([^\s]+))/;

export const DEFAULT_TERMINAL_NAME = 'Kilo CLI';

/** Returns the trimmed launcher command or an empty string when the setting is blank. */
export function resolveCliCommand(rawValue: string | undefined): string {
  return rawValue?.trim() ?? '';
}

/** Extracts the executable token while preserving quoted paths that contain spaces. */
export function extractExecutable(command: string): string {
  const match = command.match(QUOTED_EXECUTABLE_PATTERN);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

/** Returns the configured terminal name or the extension default when the setting is blank. */
export function resolveTerminalName(rawValue: string | undefined): string {
  const normalized = rawValue?.trim() ?? '';
  return normalized || DEFAULT_TERMINAL_NAME;
}

/** Builds the visible terminal label and adds a numeric suffix after the first terminal. */
export function buildTerminalLabel(terminalName: string, sequence: number): string {
  const suffix = sequence === 1 ? '' : ` ${sequence}`;
  return `${terminalName}${suffix}`;
}

/** Returns true only when the launcher should check for a globally installed `kilo` binary. */
export function shouldCheckKiloBinary(executable: string): boolean {
  return executable === 'kilo';
}
```

- [ ] **Step 4: Refactor the extension entrypoint to use the helper module**

```ts
import * as vscode from 'vscode';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import {
  buildTerminalLabel,
  extractExecutable,
  resolveCliCommand,
  resolveTerminalName,
  shouldCheckKiloBinary,
} from './command-utils';

const MISSING_KILO_MESSAGE = 'Kilo CLI is not installed. Install it with the official command: npm install -g @kilocode/cli';
const EMPTY_COMMAND_MESSAGE = 'Set "kilocodeCliLauncher.cliCommand" to the command that starts Kilo CLI.';
const execAsync = promisify(exec);

let terminalSequence = 1;

/** Checks whether the global `kilo` executable is available on the current platform. */
async function isKiloCliInstalled(): Promise<boolean> {
  const checkCommand = process.platform === 'win32' ? 'where kilo' : 'command -v kilo';

  try {
    await execAsync(checkCommand);
    return true;
  } catch {
    return false;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const openCliCommand = vscode.commands.registerCommand('kilocodeCliLauncher.openCli', async () => {
    const configuration = vscode.workspace.getConfiguration('kilocodeCliLauncher');
    const cliCommand = resolveCliCommand(configuration.get<string>('cliCommand', 'kilo'));
    const terminalName = resolveTerminalName(configuration.get<string>('terminalName'));
    const executable = extractExecutable(cliCommand);

    if (!cliCommand) {
      void vscode.window.showErrorMessage(EMPTY_COMMAND_MESSAGE);
      return;
    }

    if (shouldCheckKiloBinary(executable) && !(await isKiloCliInstalled())) {
      void vscode.window.showErrorMessage(MISSING_KILO_MESSAGE);
      return;
    }

    const terminal = vscode.window.createTerminal({
      name: buildTerminalLabel(terminalName, terminalSequence),
      location: { viewColumn: vscode.ViewColumn.Beside },
    });
    terminalSequence += 1;

    terminal.show();
    terminal.sendText(cliCommand, true);
    void vscode.window.setStatusBarMessage(`Started ${terminalName}`, 2500);
  });

  const openSettingsCommand = vscode.commands.registerCommand('kilocodeCliLauncher.openSettings', async () => {
    await vscode.commands.executeCommand(
      'workbench.action.openSettings',
      '@ext:mikesoft.vscode-kilo-cli-launcher Kilo CLI Launcher',
    );
  });

  context.subscriptions.push(openCliCommand, openSettingsCommand);
}

export function deactivate(): void {}
```

- [ ] **Step 5: Run compile and helper tests to verify they pass**

Run:

```bash
node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/command-utils.test.js
```

Expected: PASS with all helper tests green and no TypeScript compile errors.

- [ ] **Step 6: Commit the helper extraction**

```bash
git add src/command-utils.ts src/extension.ts test/command-utils.test.js
git commit -m "fix: harden launcher command parsing"
```

## Task 2: Add metadata regression tests and align branding, docs, and packaging

**Files:**
- Create: `test/metadata.test.js`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `.gitignore`
- Modify: `.vscodeignore`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Write the failing metadata test file**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
const gitIgnore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
const vscodeIgnore = fs.readFileSync(path.join(rootDir, '.vscodeignore'), 'utf8');
const changelog = fs.readFileSync(path.join(rootDir, 'CHANGELOG.md'), 'utf8');

/** Verifies that user-facing package metadata uses the public launcher brand. */
test('package metadata uses Kilo CLI Launcher branding', () => {
  assert.equal(packageJson.contributes.commands[0].category, 'Kilo CLI Launcher');
  assert.equal(packageJson.contributes.commands[1].category, 'Kilo CLI Launcher');
  assert.equal(packageJson.contributes.configuration.title, 'Kilo CLI Launcher');
});

/** Verifies that local verification scripts are available from package.json. */
test('package scripts expose compile, test, and check commands', () => {
  assert.equal(packageJson.scripts.compile, 'node ./node_modules/typescript/bin/tsc -p . --pretty false');
  assert.equal(packageJson.scripts.test, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js');
  assert.equal(packageJson.scripts.check, 'node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js');
});

/** Verifies that the README explains the stable setting IDs and Windows path quoting. */
test('README documents branding and quoted Windows paths', () => {
  assert.match(readme, /`kilocodeCliLauncher` setting IDs for backward compatibility/i);
  assert.match(readme, /"C:\\\\Program Files\\\\Kilo CLI\\\\kilo\.exe"/);
});

/** Verifies that local tooling and planning artifacts stay out of git and the VSIX package. */
test('ignore files exclude local tooling and non-runtime artifacts', () => {
  assert.match(gitIgnore, /^\.kilo\/$/m);
  assert.match(vscodeIgnore, /^test\/\*\*$/m);
  assert.match(vscodeIgnore, /^docs\/\*\*$/m);
  assert.match(vscodeIgnore, /^\.gitignore$/m);
  assert.match(vscodeIgnore, /^out\/\*\*\/\*\.map$/m);
  assert.match(vscodeIgnore, /^tsconfig\.tsbuildinfo$/m);
});

/** Verifies that the unreleased changelog notes describe the hardening pass. */
test('CHANGELOG documents the hardening pass under Unreleased', () => {
  assert.match(changelog, /## Unreleased[\s\S]*Improved command parsing for quoted Windows paths/i);
  assert.match(changelog, /## Unreleased[\s\S]*Added unit tests for launcher parsing and metadata checks/i);
});
```

- [ ] **Step 2: Run the metadata test to verify it fails**

Run:

```bash
node --test test/metadata.test.js
```

Expected: FAIL on the branding, scripts, ignore-rule, and changelog assertions because the metadata cleanup has not been applied yet.

- [ ] **Step 3: Update package metadata, docs, and ignore rules**

Preserve the existing working-tree wording change in `CHANGELOG.md` under `0.0.8` (`Stability improvements.`) while adding the unreleased hardening notes.

`package.json`

```json
{
  "contributes": {
    "commands": [
      {
        "command": "kilocodeCliLauncher.openCli",
        "title": "Open Kilo CLI in Side Terminal",
        "category": "Kilo CLI Launcher",
        "icon": {
          "light": "./media/kilo-mark.svg",
          "dark": "./media/kilo-mark.svg"
        }
      },
      {
        "command": "kilocodeCliLauncher.openSettings",
        "title": "Open Launcher Settings",
        "category": "Kilo CLI Launcher"
      }
    ],
    "configuration": {
      "title": "Kilo CLI Launcher",
      "properties": {
        "kilocodeCliLauncher.cliCommand": {
          "type": "string",
          "default": "kilo",
          "markdownDescription": "Command line used to launch Kilo CLI. The extension keeps the existing `kilocodeCliLauncher` setting IDs for backward compatibility. If your executable path contains spaces on Windows, quote it, for example `\"C:\\Program Files\\Kilo CLI\\kilo.exe\"`."
        },
        "kilocodeCliLauncher.terminalName": {
          "type": "string",
          "default": "Kilo CLI",
          "description": "Name of the terminal used by the launcher."
        }
      }
    }
  },
  "scripts": {
    "compile": "node ./node_modules/typescript/bin/tsc -p . --pretty false",
    "watch": "node ./node_modules/typescript/bin/tsc -watch -p .",
    "test": "node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js",
    "vscode:prepublish": "node ./node_modules/typescript/bin/tsc -p . --pretty false",
    "package": "node ./node_modules/@vscode/vsce/vsce package",
    "check": "node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js"
  }
}
```

`README.md`

```md
## Configuration

- `kilocodeCliLauncher.cliCommand`: command line used to run when the toolbar button is clicked. The default is `kilo`.
- `kilocodeCliLauncher.terminalName`: terminal label shown in VS Code.

The extension keeps the `kilocodeCliLauncher` setting IDs for backward compatibility with existing installations. Only the user-facing labels are branded as `Kilo CLI Launcher`.

If your executable path contains spaces on Windows, quote it:

```powershell
"C:\Program Files\Kilo CLI\kilo.exe"
```

You can open extension settings quickly from Command Palette:

- `Kilo CLI Launcher: Open Launcher Settings`

## Troubleshooting

- **Message: "Kilo CLI is not installed..."**
  Install it with:

  ```bash
  npm install -g @kilocode/cli
  ```

- **Custom executable path on Windows**
  Quote the executable path if it contains spaces, for example:

  ```powershell
  "C:\Program Files\Kilo CLI\kilo.exe" --profile default
  ```

## Build, test, and package

```bash
npm install
npm run test
npm run package
```
```

`.gitignore`

```gitignore
node_modules/
out/
.kilo/
*.vsix
*.tgz
.vscode-test/
*.tsbuildinfo
.DS_Store
Thumbs.db
Screenshot_*.jpeg
```

`.vscodeignore`

```gitignore
src/**
scripts/**
test/**
docs/**
node_modules/**
.git/**
.github/**
.kilo/**
.vscode/**
*.vsix
Screenshot_*.jpeg
tsconfig.json
tsconfig.tsbuildinfo
package-lock.json
.gitignore
out/**/*.map
```

`CHANGELOG.md`

```md
## Unreleased

### Added

- Added unit tests for launcher parsing and metadata checks.

### Changed

- Aligned user-facing commands and settings labels with the Kilo CLI Launcher brand while keeping existing setting IDs stable.

### Fixed

- Improved command parsing for quoted Windows paths and commands that contain spaces.
```

- [ ] **Step 4: Run the full compile and test suite**

Run:

```bash
node ./node_modules/typescript/bin/tsc -p . --pretty false && node --test test/*.test.js
```

Expected: PASS with all helper and metadata tests green.

- [ ] **Step 5: Inspect the package file list**

Run:

```bash
node ./node_modules/@vscode/vsce/vsce ls
```

Expected: The output still includes only runtime and Marketplace files such as `README.md`, `CHANGELOG.md`, `SUPPORT.md`, `LICENSE`, `package.json`, `out/*.js`, and `media/*`, and it no longer includes `test/`, `docs/`, `.gitignore`, or `out/*.map`.

- [ ] **Step 6: Commit the metadata and packaging cleanup**

```bash
git add package.json README.md .gitignore .vscodeignore CHANGELOG.md test/metadata.test.js
git commit -m "chore: align launcher branding and packaging"
```

## Task 3: Run final verification and confirm release readiness

**Files:**
- Verify only: `src/command-utils.ts`
- Verify only: `src/extension.ts`
- Verify only: `test/command-utils.test.js`
- Verify only: `test/metadata.test.js`
- Verify only: `package.json`
- Verify only: `README.md`
- Verify only: `.gitignore`
- Verify only: `.vscodeignore`
- Verify only: `CHANGELOG.md`

- [ ] **Step 1: Run the TypeScript compile check**

Run:

```bash
node ./node_modules/typescript/bin/tsc -p . --pretty false
```

Expected: EXIT 0 with no TypeScript errors.

- [ ] **Step 2: Run the full automated test suite**

Run:

```bash
node --test test/*.test.js
```

Expected: PASS with all helper and metadata tests green.

- [ ] **Step 3: Verify the published package contents one more time**

Run:

```bash
node ./node_modules/@vscode/vsce/vsce ls
```

Expected: Only shipping files remain in the VSIX file list, with no planning docs, tests, ignore files, or source maps.

- [ ] **Step 4: Confirm the branch is clean after the task commits**

Run:

```bash
git status --short
```

Expected: no output.

- [ ] **Step 5: Capture the verification summary in the handoff note**

```md
- Compile: passed
- Tests: passed
- VSIX contents: verified
- Branding/docs: verified
```

Expected: A concise release-readiness note that can be pasted into a PR description or release checklist.
