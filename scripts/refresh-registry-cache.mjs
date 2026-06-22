import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AIRTABLE_FIELDS, buildRegistryCache } from "../src/airtable-registry.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const defaultBaseId = "app0SleLSUfJ1ME03";
const defaultTableId = "tblKG69LIBl6DIj3S";

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function loadEnvFile(filePath) {
  if (!filePath) return;
  const text = await readFile(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

function buildAirtableUrl(baseId, tableId, offset) {
  const params = new URLSearchParams({
    returnFieldsByFieldId: "true",
    pageSize: "100",
  });

  for (const fieldId of Object.values(AIRTABLE_FIELDS)) {
    params.append("fields[]", fieldId);
  }

  if (offset) params.set("offset", offset);
  return `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`;
}

async function fetchAirtableRecords() {
  const token = process.env.AIRTABLE_PAT;
  if (!token) throw new Error("AIRTABLE_PAT is required to refresh the registry cache.");

  const baseId = process.env.AIRTABLE_BASE_ID ?? defaultBaseId;
  const tableId = process.env.AIRTABLE_TABLE_ID ?? defaultTableId;
  const records = [];
  let offset = null;

  do {
    const response = await fetch(buildAirtableUrl(baseId, tableId, offset), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Airtable read failed: ${response.status} ${response.statusText}`);
    }
    const payload = await response.json();
    records.push(...payload.records);
    offset = payload.offset ?? null;
  } while (offset);

  return records;
}

await loadEnvFile(getArgValue("--env"));
const records = await fetchAirtableRecords();
const cache = buildRegistryCache(records);
const expectedCount = Number(process.env.EXPECTED_RECORD_COUNT ?? 250);

if (cache.records.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} verified records, got ${cache.records.length}.`);
}

const outputPath = join(root, "public", "requirements.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
console.log(`Wrote ${cache.records.length} public registry records to ${outputPath}`);
