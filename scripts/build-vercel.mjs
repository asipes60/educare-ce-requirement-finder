import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "vercel-static");

const copies = [
  ["index.html", "index.html"],
  ["src", "src"],
  ["assets", "assets"],
  ["public/requirements.json", "api/requirements"],
  ["public/requirements.json", "requirements.json"],
  ["public/screenshot.jpeg", "screenshot.jpeg"],
];

await rm(output, { recursive: true, force: true });

for (const [from, to] of copies) {
  const target = join(output, to);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, from), target, { recursive: true });
}

console.log(`Built Vercel static output at ${output}`);
