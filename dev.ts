import { paths } from 'https://deno.land/x/ramda@v0.27.2/mod.ts';

type AppFunction = () => Promise<void>;

const args = Deno.args;

const getApp = async () => {
  const { run } = await import('./main.ts');
  return { run };
};

const watchApp = (run: AppFunction) => async () => {
  const watchableFiles = [
    './main.ts',
    './dev.ts',
    './index.html',
    './database.ts'
  ];

  const watcher = Deno.watchFs(watchableFiles);

  // Loop over the events
  for await (const event of watcher) {
    const paths = event.paths.filter(path => /\.(html|css)$/.test(path));
    console.log({ paths });

    if (paths.length && event.kind === 'modify') {
      try {
        await new Promise(r => setTimeout(r, 10));
        await run();
      } catch (error) {
        console.log({ error });
      }
    }
  }
};

const runDev = async () => {
  console.log({ args });
  const { run } = await getApp();
  if (args.includes('--watch')) watchApp(run)();
  await run();
};

runDev();
