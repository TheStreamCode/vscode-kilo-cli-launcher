const FALLBACK_CLI_COMMAND = 'kilo';
const FALLBACK_TERMINAL_NAME = 'Kilo CLI';
const KILO_INSTALL_COMMAND = 'npm install -g @kilocode/cli';
const COMMAND_NOT_FOUND_PATTERNS = [
  /is not recognized as a name of a cmdlet/i,
  /(?:^|\s)kilo:\s+command not found/i,
  /(?:^|\s)kilo: not found/i,
  /command not found:\s*kilo/i,
  /'kilo' is not recognized as an internal or external command/i,
  /\bkilo\b.*not found/i,
  /no such file or directory:\s*kilo(?:\s|$)/i,
  /cannot find the file:\s*kilo(?:\s|$)/i,
];

type WorkspaceFolderLike<T> = { uri: T };
type WorkspaceLike<T> = {
  workspaceFolders?: readonly WorkspaceFolderLike<T>[];
  getWorkspaceFolder(uri: T): WorkspaceFolderLike<T> | undefined;
};
type ActiveEditorLike<T> = { document: { uri: T } };

function quoteJavaScriptString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function quoteShellPath(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

/** Returns a trimmed CLI command with a safe fallback. */
export function normalizeCliCommand(value: string | undefined, fallback = FALLBACK_CLI_COMMAND): string {
  return (value ?? fallback).trim();
}

/** Returns the configured terminal base name without any numeric suffix. */
export function normalizeTerminalName(value: string | undefined, fallback = FALLBACK_TERMINAL_NAME): string {
  return (value ?? fallback).trim() || fallback;
}

/** Returns the terminal label with the numeric suffix used by the extension. */
export function buildTerminalName(value: string | undefined, sequence: number, fallback = FALLBACK_TERMINAL_NAME): string {
  const baseName = normalizeTerminalName(value, fallback);
  const suffix = sequence <= 1 ? '' : ` ${sequence}`;

  return `${baseName}${suffix}`;
}

/** Returns the settings search query for the current extension id. */
export function buildExtensionSettingsQuery(extensionId: string): string {
  return `@ext:${extensionId}`;
}

/** Returns the terminal-facing missing CLI message. */
export function buildKiloInstallPromptMessage(): string {
  return 'Cannot find Kilo CLI';
}

/** Returns the Node prompt script that installs Kilo CLI only after confirmation. */
export function buildKiloInstallPromptScript(
  installCommand = KILO_INSTALL_COMMAND,
): string {
  const message = quoteJavaScriptString(buildKiloInstallPromptMessage());
  const prompt = quoteJavaScriptString('Install Kilo CLI? (y/N): ');
  const command = quoteJavaScriptString(installCommand);
  return [
    "process.stdout.write('\\u001b[1A\\u001b[2K')",
    "const readline = require('node:readline')",
    "const cp = require('node:child_process')",
    'const rl = readline.createInterface({ input: process.stdin, output: process.stdout })',
    `console.log(${message})`,
    `rl.question(${prompt}, (answer) => {`,
    '  rl.close()',
    '  const normalized = answer.trim().toLowerCase()',
    "  if (normalized === 'y' || normalized === 'yes') {",
    `    const child = cp.spawn(${command}, [], { stdio: 'inherit', shell: true })`,
    '    child.on(\'exit\', (code) => process.exit(code === null ? 1 : code))',
    '    child.on(\'error\', () => process.exit(1))',
    '  } else {',
    '    process.exit(0)',
    '  }',
    '})',
    '',
  ].join('\n');
}

/** Returns the short terminal command that runs the generated prompt script. */
export function buildKiloInstallPromptCommand(scriptPath: string): string {
  return `node ${quoteShellPath(scriptPath)}`;
}

/** Extracts the executable token while preserving quoted Windows paths with spaces. */
export function extractExecutable(command: string): string {
  const normalized = command.trim();

  if (!normalized) {
    return '';
  }

  const firstCharacter = normalized[0];
  if (firstCharacter === '"' || firstCharacter === "'") {
    const closingQuoteIndex = normalized.indexOf(firstCharacter, 1);
    if (closingQuoteIndex > 0) {
      return normalized.slice(1, closingQuoteIndex);
    }
  }

  const whitespaceIndex = normalized.search(/\s/);
  return whitespaceIndex === -1 ? normalized : normalized.slice(0, whitespaceIndex);
}

/** Returns whether a terminal failure likely means the default kilo command is missing. */
export function shouldPromptToInstallKilo(command: string, exitCode: number | undefined, output: string): boolean {
  if (extractExecutable(command) !== FALLBACK_CLI_COMMAND) {
    return false;
  }

  if (exitCode === 127) {
    return true;
  }

  if (exitCode !== undefined && exitCode !== 1) {
    return false;
  }

  return COMMAND_NOT_FOUND_PATTERNS.some((pattern) => pattern.test(output));
}

/** Resolves the terminal cwd from the active editor or the first workspace folder. */
export function resolveTerminalCwd<T>(
  activeEditor: ActiveEditorLike<T> | undefined,
  workspace: WorkspaceLike<T>,
): T | undefined {
  const activeWorkspaceFolder = activeEditor ? workspace.getWorkspaceFolder(activeEditor.document.uri) : undefined;
  return activeWorkspaceFolder?.uri ?? workspace.workspaceFolders?.[0]?.uri;
}

export { FALLBACK_CLI_COMMAND, FALLBACK_TERMINAL_NAME, KILO_INSTALL_COMMAND };
