import { build, log, shell } from "./build.ts";

export const runBuild = async () => {
  await build(false);
  const output = await shell`run -A main.ts`;
  log(output.stdout);
  log(output.stderr);
};

if (import.meta.main) runBuild();
