# Silent Orb Website

Legacy TypeScript static-site generator (Handlebars + markdown). Output: `dist/`.

## Development

### Standalone

Open this repository in VS Code / Cursor and **Reopen in Container** (`.devcontainer/`). Then run the **Silentorb Web: dev** or **Silentorb Web: build** task, or:

```bash
yarn install
yarn dev    # watch + http://127.0.0.1:8080/
yarn build  # → dist/
```

### silentorb-workbench

Clone as a sibling of [silentorb-workbench](https://github.com/silentorb/silentorb-workbench):

```
parent/
  silentorb-workbench/
  silentorb-web/    # git@github.com:silentorb/silentorb-web.git
```

Enable the `silentorb-web` Compose profile in workbench `devcontainer.json`, rebuild, and use workbench tasks **Silentorb Web: dev** / **build**.

## Migration

A planned follow-up will port this site to the Tome stack (Bun + Astro). The current setup is the reference baseline for that migration.
