/**
 * Minimal ESLint Rule types to avoid a hard dependency on `@types/eslint`.
 * Compatible with ESLint v8 and v9 flat config.
 */

export interface RuleContext {
  report(descriptor: {
    node: never;
    messageId: string;
    data?: Record<string, string>;
  }): void;
}

export interface RuleMeta {
  type: "problem" | "suggestion" | "layout";
  docs?: {
    description?: string;
    recommended?: boolean;
    url?: string;
  };
  schema: unknown[];
  messages: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Rule<TListeners = Record<string, (node: any) => void>> {
  meta: RuleMeta;
  create(context: RuleContext): TListeners;
}

export interface RuleModule {
  meta: RuleMeta;
  create: Rule["create"];
}
