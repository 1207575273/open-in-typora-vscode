# Open in Typora for VSCode

在 VSCode 里通过右键菜单用 Typora 打开 Markdown 文件。

## 功能

- 右键任意 `.md` / `.markdown` 文件 → **Open in Typora**
- 在三处菜单生效:资源管理器文件树、编辑器右键、标签页右键
- 在设置里配置 Typora 安装路径

## 前置要求

本机已安装 [Typora](https://typora.io/)

## 安装

### 从 VSIX 安装

1. 在 VSCode 打开扩展视图(`Ctrl+Shift+X`)
2. 点右上 `...` 菜单 → **从 VSIX 安装...**
3. 选择 `open-in-typora-1.0.0.vsix`
4. 重新加载 VSCode

## 配置

设置 → 扩展 → Open in Typora,或直接搜索 `openInTypora`:

- `openInTypora.executablePath`:Typora 可执行文件路径
  - Windows:`D:\Program Files\Typora\Typora.exe`
  - macOS:`/Applications/Typora.app/Contents/MacOS/Typora`
  - Linux:`/usr/bin/typora`

## 架构

分层设计,领域层为纯 TypeScript、零 `vscode` 依赖,由 vitest 单测完整覆盖:

```
src/
├── commands/   适配层(依赖 vscode API)
├── process/    基础设施层(child_process.spawn 封装)
├── domain/     领域层(文件判断 / 命令对象 / 路径校验,纯 TS)
├── test/       vitest 单元测试
└── extension.ts 激活入口
```

右键菜单的显示由 `package.json` 的声明式 `when: "resourceLangId == 'markdown'"` 控制,
VSCode 内置 `markdown` 语言标识,无需自行判断后缀。

## 构建

```bash
pnpm install          # 安装依赖
pnpm test             # 运行单测
pnpm run package      # esbuild 打包 -> dist/extension.js
pnpm dlx @vscode/vsce package  # 产出 .vsix
```

## 许可证

MIT