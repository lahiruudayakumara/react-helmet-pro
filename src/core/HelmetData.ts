import { HelmetDispatcher } from "./HelmetDispatcher";
import { getCanUseDOM } from "./runtime";

import type { HelmetServerContext, HelmetState } from "../types";

export class HelmetData {
  context: HelmetServerContext;
  dispatcher: HelmetDispatcher;

  constructor(context: HelmetServerContext = {}) {
    this.context = context;
    this.dispatcher = new HelmetDispatcher({
      context,
      manageDom: getCanUseDOM(),
    });
  }

  getState(): HelmetState {
    return this.dispatcher.getState();
  }
}
