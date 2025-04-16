"use client";

import { useEffect } from 'react';

export const useHelmetMiddleware = (middleware: (head: any) => any, deps: any[]) => {
  useEffect(() => {
    middleware?.({});
  }, deps);
};