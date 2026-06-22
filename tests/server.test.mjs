import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { readRequirementPayload } from "../server.mjs";

describe("requirements API payload", () => {
  it("serves the generated registry cache when present", async () => {
    const root = await mkdtemp(join(tmpdir(), "ce-finder-"));
    await mkdir(join(root, "public"));
    await writeFile(
      join(root, "public", "requirements.json"),
      JSON.stringify({
        generatedAt: "2026-06-22T00:00:00.000Z",
        records: [{ id: "OK-psychologist", status: "verified" }],
      }),
      "utf8"
    );

    const payload = await readRequirementPayload(root);

    assert.equal(payload.generatedAt, "2026-06-22T00:00:00.000Z");
    assert.deepEqual(payload.records, [{ id: "OK-psychologist", status: "verified" }]);
  });
});
