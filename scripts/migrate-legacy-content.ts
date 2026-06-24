#!/usr/bin/env bun
/**
 * One-shot migration: legacy _legacy-src/content markdown → Tome content/data/*.md
 * Run from silentorb-web root: bun scripts/migrate-legacy-content.ts
 */
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { stringify as stringifyYaml } from "yaml";

const REPO_ROOT = resolve(import.meta.dir, "..");
const LEGACY_CONTENT = (() => {
  const archived = join(REPO_ROOT, "_legacy-src", "content");
  if (statSync(archived, { throwIfNoEntry: false })?.isDirectory()) return archived;
  const tracked = join(REPO_ROOT, "src", "content");
  if (statSync(tracked, { throwIfNoEntry: false })?.isDirectory()) return tracked;
  throw new Error("No legacy content found at _legacy-src/content or src/content");
})();

const CONTENT_ROOT = join(REPO_ROOT, "content");
const DATA_DIR = join(CONTENT_ROOT, "data");
const MODEL_DIR = join(CONTENT_ROOT, "model");

const INDEX_PATTERN = /\/index$/;
const MD_LINK_PATTERN = /\[([^\]]*)\]\(([^)]+)\)/g;
const MD_HREF_PATTERN = /(\/index)?\.md$/;

function nodeIdForLegacyPath(legacyPath: string): string {
  return createHash("sha256").update(`silentorb:${legacyPath}`).digest("hex").slice(0, 32);
}

const HOME_NODE_ID = nodeIdForLegacyPath("home");
const ARCHIVE_NODE_ID = nodeIdForLegacyPath("archive");

function normalizeSlashes(text: string): string {
  return text.replace(/\\/g, "/");
}

function getPathWithoutExtension(file: string): string {
  const match = file.match(/^(.*)\.[^.]+$/);
  return match ? match[1]! : file;
}

function legacyRouteKey(relativePath: string): string {
  let key = getPathWithoutExtension(relativePath);
  key = key.replace(INDEX_PATTERN, "");
  return key;
}

function walkMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkMarkdownFiles(full));
    } else if (entry.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function absoluteRelativePath(directory: string, file: string): string {
  const absolute = join(directory, file);
  return normalizeSlashes(absolute);
}

function parseGrayMatter(raw: string): { data: Record<string, unknown>; content: string } {
  if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) {
    return { data: {}, content: raw };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, content: raw };
  const yamlBlock = raw.slice(4, end);
  const content = raw.slice(end + 5);
  const data: Record<string, unknown> = {};
  for (const line of yamlBlock.split("\n")) {
    const m = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (m) {
      const [, key, value] = m;
      if (key === "title") data.title = value!.replace(/^['"]|['"]$/g, "");
    }
  }
  return { data, content };
}

function titleFromContent(content: string, data: Record<string, unknown>): string {
  if (typeof data.title === "string" && data.title.trim()) return data.title.trim();
  const match = /^#\s+(.+)$/m.exec(content);
  if (match) return match[1]!.trim();
  return "Untitled";
}

function rewriteLinks(content: string, parentPath: string, pathToAlias: Map<string, string>): string {
  return content.replace(MD_LINK_PATTERN, (full, text: string, href: string) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return full;
    if (!MD_HREF_PATTERN.test(href)) return full;
    const targetPath = absoluteRelativePath(parentPath, href.replace(MD_HREF_PATTERN, ""));
    const alias = pathToAlias.get(targetPath);
    if (!alias) return full;
    return `[${text}](/${alias}/)`;
  });
}

const PARTIALS_DIR = join(REPO_ROOT, "_legacy-src", "partials");
const PARTIAL_PATTERN = /\{\{>\s*([a-z0-9.-]+)\s*\}\}/gi;

function loadPartial(name: string): string | null {
  const path = join(PARTIALS_DIR, `${name}.handlebars`);
  if (!statSync(path, { throwIfNoEntry: false })?.isFile()) return null;
  return readFileSync(path, "utf-8").trim();
}

function inlinePartials(content: string): string {
  return content.replace(PARTIAL_PATTERN, (_match, name: string) => loadPartial(name) ?? "");
}

function buildChildIndex(parentKey: string, articles: Map<string, string>): string {
  const parentPath = `${parentKey}/`;
  const links = [...articles.entries()]
    .filter(([key]) => key.startsWith(parentPath) && key.length > parentPath.length)
    .filter(([key]) => !key.slice(parentPath.length).includes("/"))
    .map(([key, title]) => `- [${title}](/${key}/)`)
    .join("\n");
  return links ? `\n${links}\n` : "";
}

function serializeNode(properties: Record<string, unknown>, body: string): string {
  const yamlBlock = stringifyYaml(properties, { lineWidth: 0 }).trimEnd();
  const normalizedBody = body.replace(/\r\n/g, "\n").replace(/^\n+/, "");
  return `---\n${yamlBlock}\n---\n${normalizedBody}`;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

function main(): void {
  const files = walkMarkdownFiles(LEGACY_CONTENT);
  const articles = new Map<string, { title: string; body: string; file: string }>();
  const pathToAlias = new Map<string, string>();

  for (const file of files) {
    const rel = relative(LEGACY_CONTENT, file);
    const key = legacyRouteKey(rel);
    pathToAlias.set(key, key);
    const raw = readFileSync(file, "utf-8");
    const { data, content } = parseGrayMatter(raw);
    const title = titleFromContent(content, data);
    articles.set(key, { title, body: content, file });
  }

  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(MODEL_DIR, { recursive: true });

  for (const [key, article] of articles) {
    const parentPath = dirname(key);
    let body = rewriteLinks(article.body, parentPath === "." ? key : parentPath, pathToAlias);
    if (body.includes("{{childIndex}}")) {
      body = body.replace("{{childIndex}}", buildChildIndex(key, new Map([...articles].map(([k, v]) => [k, v.title]))));
    }
    body = inlinePartials(body);
    body = body.replace(/^#\s+.+\n+/, "");

    const id = nodeIdForLegacyPath(key);
    const properties: Record<string, unknown> = {
      title: article.title,
      url_alias: key,
    };
    writeFileSync(join(DATA_DIR, `${id}.md`), serializeNode(properties, body.trim()), "utf-8");
  }

  const homeBody = `![Silent Orb](/images/silentorb-dark.png)

<img src="/images/weird-thing.jpg" alt="" style="margin-left: -18px; max-width: 400px; margin-top: 20px; margin-bottom: 30px;" />

- [Tech Company Business Strategy](/business/tech-company-business-strategy/)
- [Marloth Book](/marloth/books/)
- [Marloth Game](/marloth/games/)
- [Music](/music/)
- [GitHub](https://github.com/silentorb)
`;

  writeFileSync(
    join(DATA_DIR, `${HOME_NODE_ID}.md`),
    serializeNode({ title: "Silent Orb" }, homeBody.trim()),
    "utf-8",
  );

  writeFileSync(
    join(DATA_DIR, `${ARCHIVE_NODE_ID}.md`),
    serializeNode({ title: "Archive" }, ""),
    "utf-8",
  );

  writeJson(join(DATA_DIR, "relationships.json"), { version: 2, relationships: [] });
  writeJson(join(MODEL_DIR, "schema.json"), { version: 1, relationshipRules: [], enums: {} });
  writeJson(join(MODEL_DIR, "relationship-types.json"), { version: 1, types: {} });
  writeJson(join(MODEL_DIR, "dynamic-fields.json"), { version: 1, fields: [], columnSets: [] });
  writeJson(join(MODEL_DIR, "views.json"), { version: 1, nodes: {} });
  writeJson(join(MODEL_DIR, "table-schemas.json"), { version: 1, tables: {} });
  writeJson(join(MODEL_DIR, "extensions.json"), { version: 1, extensions: [], components: [] });
  writeJson(join(MODEL_DIR, "ordered-associations.json"), { version: 1, configs: [] });

  writeJson(join(MODEL_DIR, "workspace.json"), {
    version: 1,
    homeNodeId: HOME_NODE_ID,
    archiveNodeId: ARCHIVE_NODE_ID,
    protectedNodeIds: [HOME_NODE_ID, ARCHIVE_NODE_ID],
    graphExplorer: { defaultAnchorNodeId: HOME_NODE_ID },
    staticSite: { homeNodeId: HOME_NODE_ID },
    sidebar: { links: [] },
    branding: { staticSiteHeader: "Silent Orb", appTitle: "Silent Orb" },
  });

  console.log(`Migrated ${articles.size} content pages + home + archive`);
  console.log(`  content: ${CONTENT_ROOT}`);
  console.log(`  home node: ${HOME_NODE_ID}`);
}

main();
