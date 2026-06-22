import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const publicRoot = join(dist, "server", "public");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
]);

const sourceFiles = [
  "index.html",
  "src/app.mjs",
  "src/airtable-registry.mjs",
  "src/ce-finder.mjs",
  "src/data.mjs",
  "src/styles.css",
  "assets/educare-logo.png",
  "public/requirements.json",
  "public/screenshot.jpeg",
];

async function buildFileMap() {
  const entries = [];
  for (const relativePath of sourceFiles) {
    const buffer = await readFile(join(root, relativePath));
    entries.push([
      `/${relativePath}`,
      {
        contentType: contentTypes.get(extname(relativePath)) ?? "application/octet-stream",
        body: buffer.toString("base64"),
      },
    ]);
  }
  return entries;
}

function buildWorker(entries) {
  return `const files = new Map(${JSON.stringify(entries)});\n\n` +
    `function decodeBase64(value) {\n` +
    `  const binary = atob(value);\n` +
    `  const bytes = new Uint8Array(binary.length);\n` +
    `  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);\n` +
    `  return bytes;\n` +
    `}\n\n` +
    `function resolvePath(pathname) {\n` +
    `  if (pathname === "/") return "/index.html";\n` +
    `  if (pathname === "/api/requirements") return "/public/requirements.json";\n` +
    `  return pathname;\n` +
    `}\n\n` +
    `export default {\n` +
    `  async fetch(request) {\n` +
    `    const url = new URL(request.url);\n` +
    `    const entry = files.get(resolvePath(url.pathname));\n` +
    `    if (!entry) return new Response("Not found", { status: 404 });\n` +
    `    const headers = { "content-type": entry.contentType };\n` +
    `    if (url.pathname === "/api/requirements") headers["cache-control"] = "public, max-age=300";\n` +
    `    return new Response(decodeBase64(entry.body), { headers });\n` +
    `  }\n` +
    `};\n`;
}

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "server"), { recursive: true });
await cp(join(root, "public"), publicRoot, { recursive: true });
await mkdir(join(dist, ".openai"), { recursive: true });
await cp(join(root, ".openai", "hosting.json"), join(dist, ".openai", "hosting.json"));
await writeFile(join(dist, "server", "index.js"), buildWorker(await buildFileMap()), "utf8");
console.log(`Built deployable site output at ${dist}`);
