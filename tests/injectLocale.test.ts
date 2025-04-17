import { describe, expect, it } from 'vitest';

import { injectLocale } from '../src/middlewares/injectLocale';

describe('injectLocale', () => {
  it('adds locale meta tag', () => {
    const head = { meta: [] };
    const result = injectLocale(head, 'fr');
    expect(result.meta).toContainEqual({ name: 'language', content: 'fr' });
  });
});
