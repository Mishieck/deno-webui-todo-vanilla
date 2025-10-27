import { exit } from "./main.ts";

type AppFunction = () => Promise<void>;

const getApp = async () => {
  const { run } = await import("./main.ts");
  return { run };
};

const watchApp = (run: AppFunction) => async () => {
  const watchableFiles = [
    "./main.ts",
    "./watch.ts",
    "./index.html",
    "./database.ts",
  ];

  const watcher = Deno.watchFs(watchableFiles);

  // Loop over the events
  for await (const event of watcher) {
    const paths = event.paths.filter((path) => /\.(html|css|js)$/.test(path));
    console.log({ paths });

    if (paths.length && event.kind === "modify") {
      try {
        await new Promise((r) => setTimeout(r, 10));
        exit();
        await run();
      } catch (error) {
        console.log({ error });
      }
    }
  }
};

const { run } = await getApp();
watchApp(run)();
await run();
