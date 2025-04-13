import { mergeHead } from '../src/utils/mergeHead';

describe('mergeHead', () => {
  it('merges two head objects', () => {
    const a = { title: 'Title A', meta: [{ name: 'a', content: 'A' }] };
    const b = { meta: [{ name: 'b', content: 'B' }] };
    const result = mergeHead(a, b);

    expect(result.title).toBe('Title A');
    expect(result.meta).toEqual([{ name: 'b', content: 'B' }]);
  });
});
