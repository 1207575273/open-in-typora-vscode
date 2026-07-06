import * as fs from 'fs';

export interface ValidationResult {
  readonly valid: boolean;
  readonly message: string;
}

/**
 * 校验 Typora 安装路径。依赖 Node fs,但不依赖 vscode,可被 vitest 测试。
 */
export function validatePath(path: string | null | undefined): ValidationResult {
  if (!path || path.trim().length === 0) {
    return { valid: false, message: 'Please set the Typora executable path in Settings.' };
  }
  const trimmed = path.trim();
  if (!fs.existsSync(trimmed)) {
    return { valid: false, message: `Path does not exist: ${trimmed}` };
  }
  const stat = fs.statSync(trimmed);
  if (stat.isDirectory()) {
    return { valid: false, message: 'Path is a directory; please select the Typora executable file.' };
  }
  return { valid: true, message: 'OK' };
}