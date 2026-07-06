import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { validatePath } from '../domain/TyporaPathValidator';

describe('validatePath', () => {
  it('valid existing file', () => {
    const tmp = path.join(os.tmpdir(), `typora-test-${Date.now()}.exe`);
    fs.writeFileSync(tmp, '');
    try {
      const r = validatePath(tmp);
      expect(r.valid).toBe(true);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('null -> invalid', () => {
    const r = validatePath(null);
    expect(r.valid).toBe(false);
    expect(r.message.length).toBeGreaterThan(0);
  });

  it('blank -> invalid', () => {
    const r = validatePath('   ');
    expect(r.valid).toBe(false);
  });

  it('nonexistent -> invalid', () => {
    const r = validatePath('C:\\Definitely\\Does\\Not\\Exist\\Typora.exe');
    expect(r.valid).toBe(false);
  });

  it('directory -> invalid', () => {
    const r = validatePath(os.tmpdir());
    expect(r.valid).toBe(false);
  });
});