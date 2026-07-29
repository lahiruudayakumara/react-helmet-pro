import { useContext } from "react";

import { HelmetContext } from "../context/HelmetContext";
import type { HelmetSeoDefaults } from "../types/defaults";

export const useSeoDefaults = (): HelmetSeoDefaults | undefined => {
  const context = useContext(HelmetContext);
  return context?.defaults;
};
