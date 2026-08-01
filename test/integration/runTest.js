const path = require('node:path');
const { runTests } = require('@vscode/test-electron');

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
  const extensionTestsPath = path.resolve(__dirname, 'suite');
  const version = process.env.VSCODE_VERSION || '1.103.0';

  await runTests({
    version,
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: ['--disable-extensions'],
  });
}

// Fail explicitly instead of relying on Node's unhandled-rejection default, which
// callers can change with --unhandled-rejections and which hides the exit code.
main().catch((error) => {
  console.error('VS Code integration tests failed.');
  console.error(error);
  process.exitCode = 1;
});
