import { describe, expect, it } from 'vitest';

import { HelmetProvider } from '../src/context/HelmetProvider';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { useHead } from '../src/hooks/useHead';

describe('useHead', () => {
  it('provides context', () => {
    const wrapper = ({ children }: any) => <HelmetProvider>{children}</HelmetProvider>;
    const { result } = renderHook(() => useHead(), { wrapper });
    expect(result.current).toHaveProperty('setHead');
  });
});
