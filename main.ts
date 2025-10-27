import { BindCallback, WebUI } from "@webui/deno-webui";
import * as database from "./src/server/database.ts";

const addTodo: BindCallback<string> = async (
  { arg }: WebUI.Event,
) => {
  return JSON.stringify(await database.add(arg.string(0)));
};

const getTodoList = async () => JSON.stringify(await database.getAll());

const updateTodo: BindCallback<string> = async ({ arg }: WebUI.Event) => {
  return JSON.stringify(await database.update(arg.string(0), arg.boolean(1)));
};

const deleteTodo: BindCallback<string> = async ({ arg }: WebUI.Event) => {
  return JSON.stringify(await database.deleteTodo(arg.string(0)));
};

export const run = async () => {
  const win = new WebUI();

  win.bind("addTodo", addTodo);
  win.bind("getTodoList", getTodoList);
  win.bind("updateTodo", updateTodo);
  win.bind("deleteTodo", deleteTodo);
  win.bind("exit", exit);

  win.setRootFolder("./src/client/");
  await win.show("./index.html");
  await WebUI.wait();
};

export const exit = WebUI.exit.bind(WebUI);

if (import.meta.main) run();
