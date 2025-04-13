import { useEffect } from 'react';

export const useHeadMiddleware = (middleware: (head: any) => any, deps: any[]) => {
  useEffect(() => {
    middleware?.({});
  }, deps);
};