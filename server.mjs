import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPublicRequirements } from "./src/ce-finder.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 4173);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=300",
  });
  response.end(JSON.stringify(payload));
}

function resolveStaticPath(urlPath, siteRoot = root) {
  const requestPath = urlPath === "/" ? "/index.html" : urlPath;
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  return join(siteRoot, normalizedPath);
}

export async function readRequirementPayload(siteRoot = root) {
  try {
    const cache = await readFile(join(siteRoot, "public", "requirements.json"), "utf8");
    return JSON.parse(cache);
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      records: getPublicRequirements(),
    };
  }
}

export function createRequestHandler(siteRoot = root) {
  return async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/requirements") {
    sendJson(response, 200, await readRequirementPayload(siteRoot));
    return;
  }

  const filePath = resolveStaticPath(requestUrl.pathname, siteRoot);

  try {
    await readFile(filePath);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes.get(extname(filePath)) ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServer(createRequestHandler(root));
  server.listen(port, () => {
    console.log(`EduCare CE Requirement Finder running at http://localhost:${port}`);
  });
}
