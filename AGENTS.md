# Repository Guidelines

## Purpose And Safety Model

This repository contains a small unofficial VS Code extension that sends a user-configured Kilo CLI command to a visible integrated terminal. Preserve that narrow scope.

The repository is public and MIT-licensed, and the extension ships to the Visual Studio Marketplace and Open VSX under the `mikesoft` publisher. Everything committed here is public: assume any file, comment, or test fixture will be read by users and mirrored into the packaged extension unless `.vscodeignore` excludes it.

- Never execute the configured command in the extension host, a child process, a hidden shell, or a background task.
- Keep the Workspace Trust gate in place before terminal creation or command execution.
- Resolve `kilocodeCliLauncher.cliCommand` from user-level configuration only. Never allow workspace or workspace-folder settings to select an executable command.
- Keep every existing `kilocodeCliLauncher` command and setting ID stable for backward compatibility.
- Do not add installers, downloaded scripts, telemetry, analytics, persistent storage, or network calls without explicit product approval and corresponding security, privacy, metadata, and documentation updates.

## Repository Map

- `src/extension.ts`: VS Code activation, commands, settings access, trust checks, terminal creation, and user feedback.
- `src/command-utils.ts`: pure helpers for command normalization, terminal names, settings queries, and workspace-aware cwd resolution.
- `test/command-utils.test.js`: focused pure-helper regressions using `node:test`.
- `test/metadata.test.js`: package metadata, documentation, governance, ignore, CI, and package-surface assertions.
- `test/integration/`: VS Code extension-host smoke tests using `@vscode/test-electron`.
- `media/`: published Marketplace and toolbar assets. Preserve design, format, dimensions, proportions, transparency, and visual quality.
- `docs/`: engineering plans, specifications, and dated reviews. Keep end-user instructions in the root `README.md`.
- `.github/`: issue and pull-request templates plus CI and dependency-security automation.
- `out/`, `.vscode-test/`, `*.vsix`, and `*.tsbuildinfo`: generated or local-only output; never edit or commit it.
- There is no `scripts/` directory. The `scripts/**` line in `.vscodeignore` is a deliberate guard so any future tooling stays out of the VSIX.

## Toolchain And Commands

Use Node.js 22 and npm. Install from the committed lockfile with `npm ci`; use `npm install` only when intentionally changing dependency metadata or the lockfile.

- `npm run compile`: emit CommonJS extension output to `out/`.
- `npm run typecheck`: run strict TypeScript checks without emitting files.
- `npm run watch`: compile in watch mode.
- `npm run test:command-utils`: compile and run focused helper tests.
- `npm run test:metadata`: validate repository and package-visible metadata.
- `npm run test:integration`: compile and run extension-host smoke tests. Set `VSCODE_VERSION` to override the default minimum version (`1.103.0`).
- `npm test`: compile, run Node tests, and run integration tests.
- `npm run audit`: fail on high-severity npm advisories.
- `npm run check`: required local gate; type-checks, tests, runs extension-host integration, and inspects VSIX contents.
- `npm run package`: build a local ignored `.vsix` package.

There is no supported ESLint configuration while the installed TypeScript major is outside `typescript-eslint`'s supported range. Do not add an incompatible linter merely to create a `lint` script; rely on strict TypeScript checks and revisit when the toolchain officially supports the compiler version.

## Coding And Architecture Rules

- Use TypeScript strict mode and NodeNext modules; compiled output is CommonJS because the package has no ESM `type` declaration.
- Follow existing style: two-space indentation, single quotes in TypeScript, semicolons, LF endings, and concise comments only for non-obvious behavior.
- Prefer small pure helpers in `src/command-utils.ts` whenever logic can be tested without the VS Code API.
- Keep `src/extension.ts` as thin orchestration. Do not add abstraction layers, services, dependency injection, or state containers without a demonstrated need.
- Use VS Code APIs for settings, trust, terminals, and UI. Do not import filesystem, process-spawning, shell-execution, or temporary-file APIs into runtime source.
- Preserve the current terminal behavior: one fresh side terminal per launch, active-editor workspace cwd when available, then first-workspace fallback.
- Treat command strings as user-authored terminal input. Do not parse, rewrite, escape, probe, pre-run, log, or transmit them.
- Do not edit `out/` manually. Source changes must compile to regenerate it locally, while generated files remain untracked.

## Testing Expectations

- Add command normalization, naming, settings-resolution, and cwd regressions to `test/command-utils.test.js`.
- Add package, README, governance, ignore, workflow, and VSIX-surface assertions to `test/metadata.test.js`.
- Integration tests must not require Kilo CLI, network credentials, publisher tokens, or a user workspace. Use a stable command such as `node --version`.
- When mutating VS Code settings in integration tests, capture and restore the exact configuration target that was changed. Do not persist resolved default or workspace values into global settings.
- Test the minimum declared VS Code version when changing API usage. CI also exercises the current stable version.
- Run the narrowest relevant test during iteration, then `npm run check` before handoff.

## Dependencies, Configuration, And Secrets

- This extension has no production npm dependencies and requires no runtime environment variables.
- Keep `@types/vscode` pinned to the minimum version declared in `engines.vscode` so compilation cannot accidentally use newer APIs.
- Avoid new dependencies for behavior that can be implemented clearly with the standard library or VS Code API.
- For dependency changes, update `package.json` and `package-lock.json` together, run `npm audit`, and document material changes in `CHANGELOG.md`.
- Never commit local `.env` files, tokens, Marketplace/Open VSX credentials, logs, generated packages, or machine-specific paths. A sanitized `.env.example` is allowed only if environment variables are introduced later and documented.
- Keep Dependabot security updates and alerts enabled. Do not re-enable scheduled version updates without maintainer approval; routine version-update PRs remain disabled.

## Documentation, Assets, And Releases

- Keep `README.md` accurate for requirements, installation, configuration, usage, troubleshooting, privacy, development, build, and release steps.
- Keep `package.json`, `package-lock.json`, `CITATION.cff`, and the release entry in `CHANGELOG.md` version-aligned; `CITATION.cff` and `CHANGELOG.md` must also share the real release date.
- Preserve public naming and the unofficial/trademark disclaimer.
- Do not modify icons or assets unless explicitly requested or a lossless size optimization is demonstrably worthwhile. Validate dimensions, transparency, format, visual equivalence, and package paths after any permitted optimization.
- `media/icon.png` and `media/launcher-mark.svg` are the artwork already published on the Marketplace and Open VSX. Never add a script, task, or workflow that renders over them: an earlier `scripts/generate-icon.ps1` did exactly that and was removed. `test/metadata.test.js` fails if any file under `scripts/`, `src/`, or `.github/`, or any npm script, references those asset paths.
- The two `media/` assets are about 80% of the packaged VSIX (`media/launcher-mark.svg` ~31 KB compressed, `media/icon.png` ~26 KB of a ~70 KB package). The SVG is a raster image wrapped in SVG markup rather than a true vector mark, so it does not follow VS Code's monochrome `currentColor` toolbar guidance. Treat replacing it as a design decision for the maintainer, never an incidental cleanup.
- Keep engineering-only files excluded from the VSIX through `.vscodeignore` and verify the final package surface with `npm run package:contents` or `npm run check`.
- Publishing is not automated. Never publish, tag, push, or create a release unless the user explicitly authorizes that external action.

## Git And Pull Requests

- Inspect `git status` before editing and preserve unrelated user changes.
- `main` is protected: no direct pushes, no force pushes, linear history only. Work on a branch, open a pull request, and let the maintainer approve it — protection requires one approving review and the stable `Required CI` check. Never self-approve and never use an admin bypass.
- Make surgical changes; never rewrite, stage, discard, or commit unrelated files.
- Use concise imperative commit subjects, with a scoped prefix when useful, for example `fix: preserve global test settings`.
- Pull requests should describe user-visible behavior, linked issues, security implications, documentation changes, and exact verification output.
- Run `npm run check` before requesting review. Do not claim pushed, published, deployed, or production-verified status without direct evidence.
