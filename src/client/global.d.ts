import { Callbacks } from "../shared/callbacks.ts";
import type { WithExtensions } from "./bridge/webui.ts";

declare global {
  export const webui: WithExtensions<{ callbacks: Callbacks }>;
}
