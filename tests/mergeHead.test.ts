import { describe, expect, it } from 'vitest';

import { mergeHelmet } from '../src/utils/mergeHelmet';

describe('mergeHead', () => {
  it('merges two head objects', () => {
    const a = { title: 'Title A', meta: [{ name: 'a', content: 'A' }] };
    const b = { meta: [{ name: 'b', content: 'B' }] };
    const result = mergeHelmet(a, b);

    expect(result.title).toBe('Title A');
    expect(result.meta).toEqual([{ name: 'b', content: 'B' }]);
  });
});
