// @ts-check
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import CodeLines from '../src/field/CodeLines.jsx';

const code = "import a from 'a';\n\nexport default a;";

/** @param {number} [visible] */
const text = (visible) => render(<pre><CodeLines code={code} visible={visible} /></pre>).container.textContent;

describe('CodeLines', () => {
  it('renders the code verbatim by default', () => {
    expect(text()).toBe(code);
  });

  it('shows only the first characters while typing', () => {
    expect(text(6)).toBe('import');
  });

  it('types across line breaks, including empty lines', () => {
    expect(text(20)).toBe("import a from 'a';\n\n");
    expect(text(21)).toBe("import a from 'a';\n\ne");
  });

  it('shows nothing at zero and everything past the end', () => {
    expect(text(0)).toBe('');
    expect(text(999)).toBe(code);
  });
});
