# Open in Typora for VSCode — 项目计划

## 1. 目标

给 VSCode 里的 Markdown 文件增加右键菜单「Open in Typora」,点击后用本机已安装的 Typora 打开。Typora 安装路径在 VSCode Settings 里配置一次。

- **配置态**: Settings → Extensions → Open in Typora,填写 Typora 可执行文件路径。
- **运行态**: 在 `.md` 文件上右键(资源管理器、编辑器、标签页)→ Open in Typora → 启动 Typora 打开该文件。

## 2. 与 IDEA 版的核心差异

| 维度 | IntelliJ 插件 | VSCode 扩展(本项目) |
|---|---|---|
| 语言 | Java | TypeScript |
| 构建打包 | Gradle + intellij-platform 插件 | pnpm + esbuild + vsce |
| 产物 | `.zip` | `.vsix` |
| 菜单声明 | `plugin.xml` 的 `<actions>` + `update()` 动态判断 | `package.json` 的 `contributes.menus` + `when` 子句声明式过滤 |
| 配置持久化 | `PersistentStateComponent` | VSCode 原生 Settings(`contributes.configuration`) |
| 启动外部进程 | `ProcessBuilder` | Node.js `child_process.spawn` |
| 文件类型判断 | 自己写 predicate + update() | 声明式 `when: resourceLangId == markdown` |

关键优势: VSCode 的右键菜单是**声明式**的,通过 `when` 子句直接限定 `resourceLangId == 'markdown'`,不需要像 IDEA 那样写 `update()` 动态判断。这让"只在 md 上显示菜单"这件事几乎不可能出错——这也是 IDEA 版踩过坑的地方。

## 3. 三个明确边界

1. 菜单只在 Markdown 文件上出现(`when: resourceLangId == 'markdown'`),非 Markdown 不显示。
2. 路径未配置或配置无效时,点击给清晰的错误提示(`vscode.window.showErrorMessage`),而不是静默失败或抛未捕获异常。
3. 路径带空格 / 文件名带空格 / 中文路径都必须正确启动(`spawn` 用数组参数,不经过 shell,天然安全)。

## 4. 分层架构(依赖方向:外层依赖内层,内层不依赖 vscode API)

```text
┌─────────────────────────────────────────────┐
│ commands    openInTypora     (命令处理)       │  ← 扩展适配层
│             extension.ts     (激活入口)       │     依赖 vscode API
├─────────────────────────────────────────────┤
│ process     typoraLauncher    (启动进程)      │  ← 基础设施层
│                              (child_process)  │     依赖 Node.js
├─────────────────────────────────────────────┤
│ domain     MarkdownPredicate  (文件判断)       │  ← 纯 TS,零依赖
│            TyporaLaunchCommand(命令对象)       │     ← vitest 100% 可测
│            TyporaPathValidator(路径校验)       │
└─────────────────────────────────────────────┘
```

领域层零 `vscode` 依赖,可被纯 vitest 单测。这和 IDEA 版保持一致的分层哲学。

## 5. 技术选型(官方标准)

| 项 | 选择 | 理由 |
|---|---|---|
| 语言 | TypeScript 5.x | 官方推荐,类型安全 |
| 包管理器 | pnpm | 项目标准,磁盘高效 |
| 打包器 | esbuild | 官方模板默认,构建快,产出单文件 |
| 测试 | vitest(领域层)+ @vscode/test-electron(可选集成) | 领域层快,集成测试按需 |
| 扩展打包 | @vscode/vsce | 官方工具,产 `.vsix` |
| 进程启动 | child_process.spawn | Node.js 内置,数组参数无需手动引号转义 |
| 代码规范 | ESLint + Prettier | 官方扩展模板标配 |

## 6. package.json contributes 设计(核心)

这是 VSCode 扩展的灵魂,声明式注册一切:

```jsonc
{
  "contributes": {
    "commands": [
      { "command": "openInTypora.open", "title": "Open in Typora", "category": "Typora" }
    ],
    "menus": {
      // 资源管理器右键(文件树)
      "explorer/context": [
        { "command": "openInTypora.open", "when": "resourceLangId == 'markdown'", "group": "navigation@9" }
      ],
      // 编辑器右键
      "editor/context": [
        { "command": "openInTypora.open", "when": "resourceLangId == 'markdown'", "group": "navigation@9" }
      ],
      // 编辑器标签页右键
      "editor/title/context": [
        { "command": "openInTypora.open", "when": "resourceLangId == 'markdown'", "group": "navigation@9" }
      ]
    },
    "configuration": {
      "title": "Open in Typora",
      "properties": {
        "openInTypora.executablePath": {
          "type": "string",
          "default": "",
          "markdownDescription": "Path to the Typora executable. Example (Windows): `D:\\Program Files\\Typora\\Typora.exe`"
        }
      }
    }
  }
}
```

`when: "resourceLangId == 'markdown'"` 让菜单只在 Markdown 上出现,VSCode 内置了 `markdown` 这个 language id,无需自己判断后缀。这是比 IDEA 版更优雅的地方。

## 7. TDD 策略

领域层(纯 TS)用 vitest 完整覆盖:

- `MarkdownPredicate.isMarkdown(fileName)`:识别 `.md`/`.markdown`/`.mdx` 等(虽然菜单已用 when 过滤,领域层仍保留判断能力供命令内二次校验)
- `TyporaLaunchCommand.create(typoraPath, filePath)`:返回 `{ command, args }`,空值/空白校验,路径完整性
- `TyporaPathValidator.validate(path)`:返回 `{ valid, message }`,存在性、是否文件(用 `fs.existsSync` / `fs.statSync`)

适配层(extension/commands)逻辑薄:读配置 → 校验 → 调 launcher。因为菜单显示已由 `when` 子句保证,命令里只需处理"路径配置"这一可变状态。

## 8. 任务分解(执行顺序)

### A. 工程骨架
1. `package.json`(含 contributes、scripts、依赖)
2. `tsconfig.json`
3. `esbuild.js`(打包配置)
4. `.vscodeignore` / `.gitignore`
5. ESLint + Prettier 配置
6. `.vscode/launch.json` + `tasks.json`(F5 调试)

### B. 领域层 + 测试(TDD)
7. 写 `MarkdownPredicate` 测试 → 实现
8. 写 `TyporaLaunchCommand` 测试 → 实现
9. 写 `TyporaPathValidator` 测试 → 实现

### C. 扩展适配层
10. `typoraLauncher.ts`(spawn 封装)
11. `openInTypora.ts`(命令:读配置→校验→启动)
12. `extension.ts`(activate/deactivate,注册命令)

### D. 测试 & 验收
13. `pnpm test` 领域层单测全绿
14. `pnpm run lint` 代码规范通过
15. `pnpm dlx @vscode/vsce package` 产 `.vsix`
16. README 安装与使用说明
17. git 初始化并 push(同 IDEA 版流程)

## 9. 验收标准(Definition of Done)

- [ ] 领域层 vitest 单测全绿,覆盖空值/空格/中文/路径校验
- [ ] `pnpm dlx @vscode/vsce package` 成功产出 `.vsix`
- [ ] 装入 VSCode 后,`.md` 文件右键出现「Open in Typora」(资源管理器/编辑器/标签页三处)
- [ ] 未配置路径时点击给出友好错误提示
- [ ] 配置路径后,点击能用 Typora 打开目标文件
- [ ] 非 Markdown 文件不显示该菜单项(`when` 子句保证)
- [ ] README 完整,含安装、配置、使用、架构说明

## 10. 交付物清单

```text
open-in-typora-vscode/
├── .vscode/          launch.json, tasks.json(F5 调试 / 构建任务)
├── src/
│   ├── domain/       纯 TS 领域层(predicate / command / validator)
│   ├── process/      child_process 封装
│   ├── commands/     命令处理
│   ├── test/         vitest 单测
│   └── extension.ts  激活入口
├── docs/             PLAN.md, DEVLOG.md
├── package.json      扩展清单(pnpm + contributes)
├── tsconfig.json
├── esbuild.js
├── .gitignore
├── .vscodeignore
├── README.md
└── CHANGELOG.md
```