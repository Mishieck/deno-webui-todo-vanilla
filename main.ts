// Same as hello_world.ts but using a local file

import { WebUI } from './deps.ts';
import { DenoPath } from './deps.ts';
import * as database from './database.ts';

const getJsFunction =
  (window: WebUI) =>
  <Args extends Array<unknown>>(name: string) =>
  (...args: Args) => {
    try {
      return window.script(`${name}(${args.join(',')})`);
    } catch (error) {
      console.error(error);
      return new Error(`Filed to get JS function ${name}.`);
    }
  };

const addTodo = async ({ window, data }: WebUI.Event) => {
  console.log('Adding to do.');
  console.log({ data });
  const result = await database.add(data as string, new Date().toISOString());
  if (result instanceof database.DatabaseError) return result.type;
  return result;
};

const deleteTodo = async ({ window, data }: WebUI.Event) => {
  console.log('deleting todo', data);
  const result = await database.deleteTodo(data as string);
  if (result instanceof database.DatabaseError) return result.type;
  return result;
};

let exit: () => Promise<void>;
let appWindow: WebUI;

export const run = async () => {
  if (exit) await exit();

  if (!appWindow) {
    appWindow = new WebUI();
    appWindow.bind('add-todo', addTodo);
    appWindow.bind('delete-todo', deleteTodo);
  }

  const html = await Deno.readTextFile('./index.html');
  appWindow.show(html);
  exit = () => Promise.resolve(appWindow.close());
  await WebUI.wait();
};
