import { spawn } from 'child_process';
import { createLaunchCommand } from '../domain/TyporaLaunchCommand';

/**
 * 启动 Typora 打开指定文件。spawn 用数组参数,不经 shell,天然处理空格/中文。
 */
export function launchTypora(typoraPath: string, filePath: string): void {
  const cmd = createLaunchCommand(typoraPath, filePath);
  const child = spawn(cmd.command, cmd.args as string[], {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  child.on('error', () => {
    // 错误由调用方在 createLaunchCommand 之前已校验路径,这里静默
  });
  // 分离进程,让 Typora 独立运行,不受 VSCode 生命周期影响
  child.unref();
}