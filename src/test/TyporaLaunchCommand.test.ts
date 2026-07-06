import { describe, it, expect } from 'vitest';
import { createLaunchCommand } from '../domain/TyporaLaunchCommand';

describe('createLaunchCommand', () => {
  it('builds correct command', () => {
    const cmd = createLaunchCommand('C:\\Program Files\\Typora\\Typora.exe', 'D:\\docs\\readme.md');
    expect(cmd.command).toBe('C:\\Program Files\\Typora\\Typora.exe');
    expect(cmd.args).toEqual(['D:\\docs\\readme.md']);
  });

  it('preserves paths with spaces', () => {
    const cmd = createLaunchCommand('C:\\Program Files\\Typora\\Typora.exe', 'E:\\我的 文档\\带 空格\\readme.md');
    expect(cmd.args).toEqual(['E:\\我的 文档\\带 空格\\readme.md']);
  });

  it('preserves chinese path', () => {
    const cmd = createLaunchCommand('C:\\Typora\\Typora.exe', 'D:\\项目\\说明文档.md');
    expect(cmd.args[0]).toBe('D:\\项目\\说明文档.md');
  });

  it('throws on null typoraPath', () => {
    expect(() => createLaunchCommand(null as unknown as string, 'a.md')).toThrow();
  });

  it('throws on null filePath', () => {
    expect(() => createLaunchCommand('C:\\Typora.exe', null as unknown as string)).toThrow();
  });

  it('throws on blank typoraPath', () => {
    expect(() => createLaunchCommand('   ', 'a.md')).toThrow();
  });

  it('throws on blank filePath', () => {
    expect(() => createLaunchCommand('C:\\Typora.exe', '')).toThrow();
  });
});