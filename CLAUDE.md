# @iamclaudia/screenshot

CLI and library that renders an HTML file to PNG/JPEG with Playwright's Chromium headless shell.

- `src/index.ts`: `generateScreenshot`, `SIZE_PRESETS`, `browserInstallCommand`
- `src/cli.ts`: argument parsing and help text (keep it in sync with the README's Options block)
- `test/`: bun tests that render `test/fixtures/page.html` and check image dimensions
- `assets/social-preview.html` → `assets/social-preview.jpg`: the README banner, rendered with the tool

## Checks

`bun run check` = biome lint, `tsc` (src + test), `bun test`, build. The tests need the headless
shell: `bunx playwright install --only-shell chromium` (uses the repo's pinned Playwright).

`tsconfig.json` typechecks only; `tsconfig.build.json` emits `dist/` from `src/`.

## Which browser

`launchBrowser` tries Playwright's headless shell first (the build that Playwright version was
tested with), then the installed Google Chrome (`channel: "chrome"`), then fails with
`browserInstallCommand()`, which names the bundled Playwright version. Because Chrome covers most
machines, `playwright` uses a caret range: a newer minor that wants a different headless shell just
falls through to Chrome. A test hides the headless shell with an empty `PLAYWRIGHT_BROWSERS_PATH`
to cover the fallback (GitHub's Ubuntu runners have Chrome installed).

## Regenerating the banner

```bash
bun run build
node dist/cli.js assets/social-preview.html social-preview.jpg --outdir assets --size github --format jpg
```

## Release process

Published to npm as `@iamclaudia/screenshot` by the `iamclaudia-ai` account.

1. Bump `version` in `package.json`, commit (`chore(release): vX.Y.Z`) on `main`.
2. Tag and push: `git tag -a vX.Y.Z -m "Release vX.Y.Z — summary" && git push && git push origin vX.Y.Z`.
3. The tag runs `publish.yml`: checks, verifies the tag matches `package.json`, builds `dist/`,
   and publishes with npm trusted publishing (OIDC, no token). Watch it with `gh run watch`, then
   confirm with `npm view @iamclaudia/screenshot version --prefer-online`. npm can take a minute
   or two to show it; wait rather than re-publishing.

The trusted publisher on npmjs.com names the repo (`iamclaudia-ai/screenshot`) and the workflow
file, so renaming `publish.yml` breaks publishing until that setting is updated.
