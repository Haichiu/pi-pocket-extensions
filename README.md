# Pi Pocket extensions

This repository is the index of extensions for [Pi Pocket](https://github.com/TannerMidd/pi-pocket). Each extension is a drop-in: a module that runs in the Pi Pocket server.

The index does not keep the code of the extensions. Each entry points to files in the author's GitHub repository, at one commit. The entry also gives the SHA-256 hash of each file. Thus the code that you install is the code that a maintainer read.

To add an extension, read [CONTRIBUTING.md](CONTRIBUTING.md).

## How Pi Pocket uses the index

1. Open **Menu → Extensions → Find extensions**. You can also open the launcher (Ctrl+K or ⌘K) and choose **Find extensions**.
2. Find an extension, and install it. Pi Pocket downloads the files at the pinned commit and checks each hash. If a hash is not correct, Pi Pocket does not install the extension.
3. The extension arrives **off**. Read its source. You can also tap **Ask Pi to review** and Pi reads the code for you.
4. Turn the extension on when you trust it.

Updates are never automatic. When an entry points to a new commit, Pi Pocket shows the update and a diff of the code. You choose if you install it.

When a maintainer revokes a version, Pi Pocket shows a warning where that version is installed.

## Trust

A drop-in runs in the server with all the rights of the owner. It can read the owner's settings, tokens, and sessions. Lancet Guard does not see what its code does.

- The checks in CI are not a security review. They make sure that the entry is valid, the hashes are correct, the module loads, and the entry tells the truth about what the module installs.
- Before a merge, a maintainer reads all the code at the pinned commit.
- The pinned commit cannot change. A new version needs a new commit and a new review.
- Read the code before you turn on an extension. The index makes this easier, but it does not do it for you.

## The files

| Path                       | What it is                                                                   |
| -------------------------- | ---------------------------------------------------------------------------- |
| `entries/<name>.json`      | One entry for each extension.                                                |
| `index.json`               | The index that Pi Pocket reads. CI makes it from `entries/`. Do not edit it. |
| `schema/entry.schema.json` | The JSON Schema of an entry.                                                 |
| `schema/index.schema.json` | The JSON Schema of `index.json`.                                             |
| `scripts/build-index.ts`   | Makes `index.json` from `entries/`.                                          |
| `scripts/validate.ts`      | The full check of the entries. It needs a Pi Pocket checkout.                |

## An entry

```json
{
    "name": "acme-clock",
    "title": "Clock",
    "description": "A clock tool: the date and time now, in any time zone.",
    "tags": ["time", "tool"],
    "author": { "name": "Ada Lovelace", "github": "ada" },
    "version": "1.0.0",
    "source": {
        "repo": "ada/pocket-clock",
        "commit": "0123456789abcdef0123456789abcdef01234567",
        "path": ""
    },
    "files": [{ "name": "acme-clock.ts", "sha256": "<64 hex characters>", "size": 1234 }],
    "pocketApi": 1,
    "minPocket": "0.14.0",
    "declares": {
        "extensions": ["acme-clock"],
        "tools": ["acme_clock"],
        "readOnlyTools": ["acme_clock"],
        "hooks": [],
        "sections": [],
        "wraps": [],
        "routes": [],
        "client": null,
        "access": "owner"
    },
    "revoked": []
}
```

All fields are necessary, except `author.github`, `source.path`, and `revoked`. Other fields are not permitted. Text fields are one line: no spaces at the start or end, and no control, invisible, or direction characters.

| Field           | What it is                                                                                                                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | The name of the module. Its file is `<name>.ts`. 2 to 64 characters: `a-z`, `0-9`, `-`, and `_`, and the first is a letter or digit. The entry file is `entries/<name>.json`. See [CONTRIBUTING.md](CONTRIBUTING.md#names) for the names you cannot use. |
| `title`         | The name that people see. 60 characters at most.                                                                                                                                                                                                         |
| `description`   | What the extension does. 600 characters at most.                                                                                                                                                                                                         |
| `tags`          | 10 tags at most. Each tag has 1 to 24 characters: `a-z`, `0-9`, and `-`.                                                                                                                                                                                 |
| `author`        | `name` (60 characters at most), and `github`, the GitHub user name of the author (optional).                                                                                                                                                             |
| `version`       | The version of the author, for people. Pi Pocket uses the commit, not this version. 32 characters at most: letters, digits, `.`, `+`, and `-`.                                                                                                           |
| `source.repo`   | The public GitHub repository with the files, as `owner/name`.                                                                                                                                                                                            |
| `source.commit` | The full commit ID (40 hex characters) that the files are pinned to.                                                                                                                                                                                     |
| `source.path`   | The folder in the repository with the files. `""` (or no field) is the top level. Four folders deep at most.                                                                                                                                             |
| `files`         | Each file of the drop-in: `name` (its path in the drop-in folder), `sha256` (64 lowercase hex characters), and `size` (in bytes). Pi Pocket downloads `https://raw.githubusercontent.com/<repo>/<commit>/<path>/<name>`.                                 |
| `pocketApi`     | The version of the extension API that the module needs. Now this is `1`.                                                                                                                                                                                 |
| `minPocket`     | The oldest Pi Pocket that the extension works with, such as `0.14.0`.                                                                                                                                                                                    |
| `declares`      | What the module installs. CI loads the module and compares. See below.                                                                                                                                                                                   |
| `revoked`       | Commits of this extension that people must not use, each with a `reason`. 50 at most.                                                                                                                                                                    |

### `declares`

Pi Pocket shows these to the owner before an install. CI loads the module and makes sure that each list is correct. The order of items is not important.

| Field           | What it is                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `extensions`    | The names of the extensions that the module returns.                                                                         |
| `tools`         | The names of all the tools of these extensions.                                                                              |
| `readOnlyTools` | The tools that have `annotations: { readOnlyHint: true }`. Plan mode lets these tools run. Each one must also be in `tools`. |
| `hooks`         | The hook handlers, such as `beforeTool` or `onYield`.                                                                        |
| `sections`      | The keys of the system prompt sections.                                                                                      |
| `wraps`         | The tools and sections that the module wraps, such as `tool bash` or `section memory`.                                       |
| `routes`        | The routes that the module adds to the app, such as `GET status`.                                                            |
| `client`        | Who loads the browser module: `"owner"`, `"steer"`, or `"view"`. `null` when there is no browser module.                     |
| `access`        | The widest access of the routes and the browser module. `"owner"` when the module adds nothing to the app.                   |

## Limits

- 50 files for each extension, 512 KiB for each file, and 2 MiB for all the files of an extension.
- 2000 entries in the index, and 4 MiB for `index.json`.

## Revoke a version

Do this when a pinned commit has a security problem or a bad bug.

1. Open `entries/<name>.json`.
2. Add the commit to `revoked`, with a short reason:

    ```json
    "revoked": [
        { "commit": "0123456789abcdef0123456789abcdef01234567", "reason": "It sends the owner's token to a remote server." }
    ]
    ```

3. If `source.commit` is that commit, change `source` and `files` to a good commit. If there is no good commit, remove the entry. Note: when the entry is gone, Pi Pocket cannot warn about its revoked commits.
4. Open a pull request. A maintainer merges it, and CI makes the new `index.json`.

The check fails when `source.commit` is in `revoked`. Pi Pocket warns each owner who has a revoked commit installed.

## Run the scripts

The scripts use Node 22.18 or newer (Node 24 is best). They need no npm packages.

```sh
# Make index.json from entries/. This needs no Pi Pocket.
npm run build

# The full check. It needs a Pi Pocket checkout with its packages installed.
git clone https://github.com/TannerMidd/pi-pocket pi-pocket
(cd pi-pocket && npm ci)
node scripts/validate.ts --pocket pi-pocket

# Check one entry, with the files from a local folder (no download).
node scripts/validate.ts --pocket pi-pocket --only acme-clock --local ../pocket-clock

# Test the scripts.
POCKET_DIR=pi-pocket npm test
```

**Warning:** the full check loads the code of each extension that it tests. Read the code before you run the check on your computer.

## License

MIT. See [LICENSE](LICENSE). Each extension has the license of its own repository.
