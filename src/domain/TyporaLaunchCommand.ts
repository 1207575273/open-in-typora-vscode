/**
 * 启动 Typora 打开文件的命令对象。纯 TS,零 vscode 依赖。
 * 用数组形式传递参数,spawn 天然处理空格与引号,比 exec 拼字符串安全。
 */
export interface LaunchCommand {
  readonly command: string;
  readonly args: readonly string[];
}

export function createLaunchCommand(typoraPath: string, filePath: string): LaunchCommand {
  const exe = requireNonNull(typoraPath, 'typoraPath').trim();
  const file = requireNonNull(filePath, 'filePath').trim();
  if (exe.length === 0) {
    throw new Error('typoraPath must not be empty');
  }
  if (file.length === 0) {
    throw new Error('filePath must not be empty');
  }
  return { command: exe, args: [file] };
}

function requireNonNull<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new Error(`${name} must not be null`);
  }
  return value;
}