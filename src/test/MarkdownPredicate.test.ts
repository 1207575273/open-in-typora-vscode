import { describe, it, expect } from 'vitest';
import { isMarkdown } from '../domain/MarkdownPredicate';

describe('isMarkdown', () => {
  describe('recognizes markdown extensions', () => {
    for (const f of ['readme.md', 'README.md', 'notes.markdown', 'wiki.mdx', 'doc.mdown', 'post.mkd', 'index.mkdn', 'a.MD', 'b.MarkDown', 'c.MARKDOWN']) {
      it(`${f} -> true`, () => {
        expect(isMarkdown(f)).toBe(true);
      });
    }
  });

  describe('rejects non-markdown', () => {
    for (const f of ['file.txt', 'image.png', 'script.js', 'Main.java', 'data.json']) {
      it(`${f} -> false`, () => {
        expect(isMarkdown(f)).toBe(false);
      });
    }
  });

  describe('edge cases', () => {
    it('null -> false', () => expect(isMarkdown(null)).toBe(false));
    it('empty -> false', () => expect(isMarkdown('')).toBe(false));
    it('no extension -> false', () => expect(isMarkdown('Makefile')).toBe(false));
    it('.md -> true', () => expect(isMarkdown('.md')).toBe(true));
    it('trailing dot -> false', () => expect(isMarkdown('notes.')).toBe(false));
  });
});