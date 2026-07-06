/**
 * Markdown 文件判断。纯 TS,零 vscode 依赖。
 */
const MARKDOWN_EXTENSIONS = ['md', 'markdown', 'mdx', 'mdown', 'mkd', 'mkdn'];

export function isMarkdown(fileName: string | null | undefined): boolean {
  if (!fileName || fileName.length === 0) {
    return false;
  }
  if (fileName.endsWith('.')) {
    return false;
  }
  const dot = fileName.lastIndexOf('.');
  if (dot < 0) {
    return false;
  }
  const ext = fileName.slice(dot + 1).toLowerCase();
  return MARKDOWN_EXTENSIONS.includes(ext);
}