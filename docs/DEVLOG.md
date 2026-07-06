# 开发日志 (DEVLOG)

## 环境
- Node v22.22.3、pnpm 10.33.0、Windows 11
- VSCode 扩展,目标平台 VSCode 1.85+

## 技术决策
- **pnpm** 全程使用(磁盘高效,符合规范)
- **TypeScript + esbuild** 官方扩展标准
- **vitest** 领域层单测,领域层零 vscode 依赖
- **child_process.spawn** 启动 Typora,数组参数不经 shell,天然处理空格/中文

## 与 IDEA 版的关键对比
- VSCode 菜单是**声明式**的:`when: "resourceLangId == 'markdown'"` 让菜单只显示在 Markdown 文件上,
  VSCode 内置 markdown language id,不需要自己判断后缀。IDEA 版曾因 update() 动态判断踩坑(菜单不显示),
  VSCode 版完全规避了这个问题。
- 配置走 VSCode 原生 Settings(contributes.configuration),比 IDEA 的 PersistentStateComponent 简单得多。
- 启动进程用 Node 的 spawn,和 Java 的 ProcessBuilder 一样用数组参数,空格/中文路径零问题。

## TDD 成果
领域层(domain,纯 TS,零依赖):
- MarkdownPredicate:isMarkdown() 识别 .md/.markdown/.mdx/.mdown/.mkd/.mkdn
- TyporaLaunchCommand:createLaunchCommand() 返回 {command, args},空值/空白校验
- TyporaPathValidator:validatePath() 校验存在性、是否文件

32 个测试全绿,覆盖:大小写后缀、空格路径、中文路径、null/空串、不可变性、
NPE 契约、路径不存在、指向目录等。

## 构建
- `pnpm run package`:esbuild 打包,dist/extension.js(2.2KB)
- `pnpm dlx @vscode/vsce package`:产 open-in-typora-1.0.0.vsix(30.9KB)
- vsce 打包前自动跑 vscode:prepublish -> esbuild production

## 无踩坑
相比 IDEA 版,本版全程顺畅,核心得益于:
1. 声明式菜单(when 子句)消除了最大风险点
2. TS/vitest 生态成熟,无中文路径导致测试加载失败的问题
3. esbuild 编译秒级,vsce 打包 36 秒(含 dlx 下载 vsce)