# Silent Orb Website

Static corporate site built with [Tome](https://github.com/silentorb/tome) (`tome-static-site` + Astro). Output: `dist/`.

## Content

- **Pages:** `content/data/{id}.md` with `url_alias` frontmatter (legacy URL paths preserved).
- **Model:** `content/model/workspace.json` — `staticSite.homeNodeId` points at the site home node.
- **Cache:** `data/tome.sqlite` (gitignored).

## Development

### silentorb-workbench (recommended)

Clone as a sibling of [silentorb-workbench](https://github.com/silentorb/silentorb-workbench):

```
parent/
  silentorb-workbench/
  silentorb-web/
```

From the workbench root:

```bash
bash scripts/build-silentorb-web.sh   # → repos/silentorb-web/dist/
bash scripts/serve-silentorb-web.sh   # http://127.0.0.1:8080/
```

VS Code tasks: **Silentorb Web: build** / **Silentorb Web: serve**.

From this repo:

```bash
bash scripts/build-static-site.sh
bash scripts/serve-static-site.sh
```

### Legacy reference

A full copy of the pre-migration Handlebars generator lives in `_legacy-src/` (gitignored). Recreate from git history if missing. Run `bun scripts/migrate-legacy-content.ts` to regenerate Tome content from that archive.

## CI

AWS CodeBuild (`buildspec.yaml`) runs the Tome static site build and publishes `dist/**` to S3.
