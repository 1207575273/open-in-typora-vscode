# Open in Typora for VSCode

Open Markdown files in Typora via right-click menu.

## Features

- Right-click any `.md` / `.markdown` file → **Open in Typora**
- Works in Explorer, Editor, and Editor Title (tab) context menus
- Configure the Typora executable path in Settings

## Requirements

- [Typora](https://typora.io/) installed on your machine

## Installation

### From VSIX

1. In VSCode, open the Extensions view (`Ctrl+Shift+X`)
2. Click the `...` menu → **Install from VSIX...**
3. Select `open-in-typora-1.0.0.vsix`
4. Reload VSCode

## Configuration

Settings → Extensions → Open in Typora:

- `openInTypora.executablePath`: Path to the Typora executable.
  - Windows: `D:\Program Files\Typora\Typora.exe`
  - macOS: `/Applications/Typora.app/Contents/MacOS/Typora`
  - Linux: `/usr/bin/typora`

## Architecture

Layered design — the domain layer is pure TypeScript with zero `vscode` dependency,
fully covered by vitest unit tests:

```
commands/   adapter layer (depends on vscode API)
process/    child_process.spawn wrapper
domain/     pure TS (predicate, launch command, path validator)
```

## License

MIT