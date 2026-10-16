// validate.ts with the sample drop-in, from local files: an entry that is correct passes, and one whose declares do
// not match what the module installs fails. It needs Pi Pocket: POCKET_DIR, or a checkout in pi-pocket/.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const repo = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(repo, "test", "fixtures");
const pocket = process.env.POCKET_DIR ?? join(repo, "pi-pocket");

async function validate(entries: string) {
    const local = join(fixtures, "acme-clock");
    const args = [
        "scripts/validate.ts",
        "--pocket",
        pocket,
        "--entries",
        entries,
        "--local",
        local,
    ];

    try {
        const { stdout } = await promisify(execFile)(process.execPath, args, { cwd: repo });

        return { code: 0, stdout };
    } catch (error) {
        const failure = error as { code: number; stdout: string; stderr: string };

        return { code: failure.code, stdout: failure.stdout + failure.stderr };
    }
}

test("a correct entry passes", async () => {
    const result = await validate(join(fixtures, "entries"));

    assert.equal(result.code, 0, result.stdout);
});

test("an entry whose declares do not match the module fails, and says what differs", async () => {
    const entries = await mkdtemp(join(tmpdir(), "pi-pocket-extensions-"));

    try {
        const file = join(fixtures, "entries", "acme-clock.json");
        const entry = JSON.parse(await readFile(file, "utf8"));

        entry.declares.readOnlyTools = [];
        await writeFile(join(entries, "acme-clock.json"), JSON.stringify(entry));
        const result = await validate(entries);

        assert.equal(result.code, 1, result.stdout);
        assert.match(result.stdout, /declares\.readOnlyTools does not have "acme_clock"/);
    } finally {
        await rm(entries, { recursive: true });
    }
});
