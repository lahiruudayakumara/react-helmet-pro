import { describe, expect, it, vi } from 'vitest';

import { HelmetProvider } from '../src/context/HelmetProvider';
import { render, renderHook, waitFor } from '@testing-library/react';
import { useHelmet } from '../src/hooks/useHelmet';
import { useHelmetMiddleware } from '../src/hooks/useHelmetMiddleware';

describe('useHelmet', () => {
  it('provides context', () => {
    const wrapper = ({ children }: any) => <HelmetProvider>{children}</HelmetProvider>;
    const { result } = renderHook(() => useHelmet(), { wrapper });
    expect(result.current).toHaveProperty('setHead');
  });

  it('does not feed middleware output back into the next middleware run', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const MiddlewareConsumer = () => {
      useHelmetMiddleware((head) => ({
        ...head,
        title: `${head.title ?? ''}!`,
      }));

      return null;
    };

    render(
      <HelmetProvider>
        <MiddlewareConsumer />
      </HelmetProvider>,
    );

    await waitFor(() => expect(document.title).toBe('!'));
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('Maximum update depth exceeded'),
    );

    consoleError.mockRestore();
  });
});
