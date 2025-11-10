import { runBuild } from "./dev.ts";
import { exit, run } from "./main.ts";

type AppFunction = () => Promise<void>;

const watch = (run: AppFunction) => async () => {
  const watchableFiles = [
    "./src/",
    "./main.ts",
    "./build.ts",
    "./dev.ts",
    "./watch.ts",
  ];

  const watcher = Deno.watchFs(watchableFiles);

  // Loop over the events
  for await (const event of watcher) {
    const paths = event.paths.filter((path) =>
      /\.(html|css|js|ts|tsx)$/.test(path)
    );

    console.log({ paths });

    if (event.kind === "modify" && paths.length) {
      try {
        await new Promise((r) => setTimeout(r, 10));
        exit();
        await runBuild();
        await run();
      } catch (error) {
        console.error(error);
        exit();
      }
    }
  }
};

watch(run)();
await run();
