// validate.ts with the sample drop-in, from local files: an entry that is correct passes, and one whose declares do
// not match what the module installs fails; a theme passes only Pi Pocket's theme check. It needs Pi Pocket:
// POCKET_DIR, or a checkout in pi-pocket/.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const repo = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(repo, "test", "fixtures");
const pocket = process.env.POCKET_DIR ?? join(repo, "pi-pocket");

async function validate(entries: string, local = join(fixtures, "acme-clock")) {
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

test("a theme entry passes the theme check, and one whose CSS loads the app's own address fails", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pi-pocket-extensions-"));

    try {
        const run = async (css: string) => {
            const files = {
                "acme-paper/theme.json": '{ "themeApi": 1, "name": "Paper" }\n',
                "acme-paper/theme.css": css,
                "acme-paper/colors-light.toml": 'background = "#fafafa"\nforeground = "#222222"\n',
            };

            for (const [name, text] of Object.entries(files)) {
                await mkdir(join(dir, "local", "acme-paper"), { recursive: true });
                await writeFile(join(dir, "local", name), text);
            }

            await mkdir(join(dir, "entries"), { recursive: true });
            await writeFile(
                join(dir, "entries", "acme-paper.json"),
                JSON.stringify({
                    kind: "theme",
                    name: "acme-paper",
                    title: "Paper",
                    description: "A warm accent.",
                    tags: ["warm"],
                    author: { name: "Ada Lovelace" },
                    version: "1.0.0",
                    source: { repo: "ada/pocket-paper", commit: "0".repeat(40) },
                    files: Object.entries(files).map(([name, text]) => ({
                        name,
                        sha256: createHash("sha256").update(text).digest("hex"),
                        size: Buffer.byteLength(text),
                    })),
                    themeApi: 1,
                    minPocket: "0.14.0",
                }),
            );

            return validate(join(dir, "entries"), join(dir, "local"));
        };

        const good = await run(":root { --accent: #c2410c; }\n");

        assert.equal(good.code, 0, good.stdout);
        assert.match(good.stdout, /the files and the theme check/);

        const leaky = await run(':root { --wallpaper: url("/api/state"); }\n');

        assert.equal(leaky.code, 1, leaky.stdout);
        assert.match(leaky.stdout, /theme check refuses it: theme\.css line 1/);
    } finally {
        await rm(dir, { recursive: true });
    }
});
