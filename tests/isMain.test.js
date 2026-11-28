// @ts-check
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isMain } from '../tools/shared/isMain.mjs';

describe('isMain (the tools\u2019 started-directly guard, final review 2026-11-27)', () => {
  it('knows a tool started on Windows, where process.argv[1] is a C:\\ path', () => {
    const argv1 = 'C:\\Users\\cja86\\Desktop\\AllenCode\\tools\\media\\record-immersive.mjs';
    // The URL Node gives that module as import.meta.url on Windows.
    const url = 'file:///C:/Users/cja86/Desktop/AllenCode/tools/media/record-immersive.mjs';
    expect(isMain(url, argv1, { windows: true })).toBe(true);
    expect(isMain('file:///C:/Users/cja86/Desktop/AllenCode/tools/media/make-loops.mjs', argv1, { windows: true })).toBe(false);
  });

  it('knows a tool started on Windows from a folder with a space in its name', () => {
    const argv1 = 'C:\\Users\\cja86\\My Projects\\AllenCode\\tools\\previews\\build.mjs';
    expect(isMain('file:///C:/Users/cja86/My%20Projects/AllenCode/tools/previews/build.mjs', argv1, { windows: true })).toBe(true);
  });

  it('knows a tool started on Linux or macOS', () => {
    const argv1 = '/home/claude/allencode/tools/media/make-loops.mjs';
    expect(isMain('file:///home/claude/allencode/tools/media/make-loops.mjs', argv1, { windows: false })).toBe(true);
    expect(isMain('file:///home/claude/allencode/tools/media/capture-products.mjs', argv1, { windows: false })).toBe(false);
  });

  it('is false when there is no started script (a REPL or an import)', () => {
    expect(isMain('file:///home/claude/allencode/tools/media/make-loops.mjs', undefined)).toBe(false);
  });

  it('matches what Node itself gives this test file on the platform it runs on', () => {
    expect(isMain(import.meta.url, fileURLToPath(import.meta.url))).toBe(true);
  });

  it('the old guard failed on Windows: new URL(C:\\\u2026, "file:") is not a file URL', () => {
    const argv1 = 'C:\\Users\\cja86\\Desktop\\AllenCode\\tools\\media\\record-immersive.mjs';
    expect(new URL(argv1, 'file:').href).not.toBe('file:///C:/Users/cja86/Desktop/AllenCode/tools/media/record-immersive.mjs');
  });
});
