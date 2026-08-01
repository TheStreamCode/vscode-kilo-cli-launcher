# Contributing

Thanks for your interest in improving Kilo CLI Launcher.

## Development

Use Node.js 22 and install the lockfile exactly:

```bash
npm ci
npm run typecheck
npm run check
```

Keep changes focused and covered by tests. Do not add official Kilo Code logos, marks, screenshots, or branding assets unless you have permission to use them.

## Pull Requests

- Keep user-facing behavior documented in `README.md`.
- Add or update tests for launcher behavior, pure helpers, package metadata, and packaging rules.
- Keep `kilocodeCliLauncher` command and setting IDs stable.
- Never commit secrets, local `.env` files, generated `out/` files, or `.vsix` packages. A sanitized `.env.example` is allowed only for documented variables.
- Run `npm run check` before submitting changes.
