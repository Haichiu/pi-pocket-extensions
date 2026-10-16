# Add an extension

You add an extension with a pull request. The pull request adds one file: `entries/<name>.json`. The code stays in your own repository.

## 1. Put the files in a public GitHub repository

- Use a public repository on GitHub.
- Put the files of the drop-in at the top level, or in one folder. That folder is `source.path` in the entry.
- Use the same file names as in the drop-in folder (`~/.pi-pocket/extensions/`):
    - `<name>.ts`: the module. This file is necessary.
    - `<name>.js` or `<name>.mjs`: a browser module beside it (optional).
    - `<name>/…`: other files in a folder with the name of the module (optional). Four folders deep at most. No hidden files and no `node_modules`. A name must not end with a dot, and must not be a Windows device name (`con`, `nul`, `com1`, and the rest). A file must not have the name of a folder that holds other files.
- Push the files. Write down the full commit ID (40 characters). Short IDs are not permitted.

For how to write a drop-in, read [Writing extensions](https://github.com/TannerMidd/pi-pocket/blob/main/docs/extensions.md) in Pi Pocket.

## 2. Get the entry

**The easy way:** open Pi Pocket. Go to **Menu → Extensions**, tap your drop-in, and tap **Share…**. Pi Pocket makes the entry with the sizes and hashes of the files. Then it opens the GitHub page for a new file in this repository.

**By hand:** copy the example in the [README](README.md#an-entry). Get the size and the hash of each file:

```sh
wc -c acme-clock.ts
sha256sum acme-clock.ts
```

## 3. Complete the entry

Make sure that these fields are correct:

- `source.repo`: your repository, as `owner/name`.
- `source.commit`: the full commit ID from step 1.
- `source.path`: the folder of the files, or `""` for the top level.
- `tags`: up to 10 short words, such as `time` or `git`.
- `author.github`: your GitHub user name.

The README tells about [each field](README.md#an-entry).

## 4. Open a pull request

1. Add the file `entries/<name>.json`. The file name must be the `name` in the entry.
2. Open a pull request. In the description, tell what the extension does and why it needs each tool, hook, and route.
3. Do not edit `index.json`. CI makes it after the merge.

## What CI checks

- The entry agrees with the JSON Schema in `schema/`.
- Pi Pocket's own reader accepts the entry.
- The file name is `<name>.json`.
- No other entry has the same module, extension, or tool name.
- The files at the pinned commit have the sizes and SHA-256 hashes in the entry.
- The module loads in a test Pi Pocket, without errors.
- `declares` is the same as what the module installs.

For a pull request, CI downloads and loads only the entries that the pull request changes. It checks the format of all entries.

CI does not do a security review.

## What maintainers check

A maintainer reads all the code at the pinned commit before a merge. The maintainer looks for these:

- The code does only what the description says.
- The code does not send data to other places, unless the description says so and the owner can control it.
- The code does not read secrets or other sessions without a good reason.
- The code does not download and run more code.
- The tool names and descriptions are clear, and `readOnlyHint` is true only for tools that change nothing.
- The code follows the rules in [Writing extensions](https://github.com/TannerMidd/pi-pocket/blob/main/docs/extensions.md#rules-that-are-easy-to-break).

A maintainer can close a pull request without a reason.

## Update an extension

1. Push the new code to your repository.
2. Change `source.commit` to the new commit ID.
3. Change `size` and `sha256` of each file that changed. Add and remove files in `files` if necessary. **Share…** in Pi Pocket makes all of this for you.
4. Change `version`, and `declares` if the module installs different things.
5. Open a pull request.

A maintainer reads the changes before the merge. Pi Pocket does not install updates automatically: each owner sees the diff and chooses.

## Names

Give each extension and each tool a name of its own, with a prefix, such as `acme-clock` and `acme_clock`.

You cannot use these names:

- A module `name` that starts with `pocket-`.
- The name of a built-in module: `prompt`, `artifacts`, `browser`, `subagents`, `schedules`, `goals`, `plan`, `guard`, `codemode`, `memory`, `pip`, `triggers`, and `gallery`.
- The extension name `coding-tools`, or an extension name that starts with `pocket-`.
- A built-in tool name: `read`, `write`, `edit`, `bash`, `artifact`, `browser`, `subagent`, `schedule`, `codemode`, `memory`, `sessions`, `session_read`, `session_start`, `session_send`, `session_follow`, `session_stop`, `session_archive`, `session_schedule`, `approvals`, `watch_pr`, `repo_watch`, and `session_watch_pr`.
- A module, extension, or tool name that an entry in the index has now. The first entry keeps the name.

A module `name` has 2 to 64 characters: `a-z`, `0-9`, `-`, and `_`. The first character is a letter or a digit.

## Limits

- 50 files for each extension.
- 512 KiB for each file.
- 2 MiB for all the files of an extension.
- Text fields are one line, with the lengths in the [README](README.md#an-entry).
