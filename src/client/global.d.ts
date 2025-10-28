import { Callbacks } from "../shared/callbacks.ts";
import type { WebuiBridge } from "./webui.ts";

declare global {
  export const webui: WebuiBridge<{ callbacks: Callbacks }>;
}
