import { BindCallback, WebUI } from "@webui/deno-webui";
import { DatabaseTodoList } from "./src/server/database.ts";
import { Todo } from "./src/shared/todo.ts";
import { Callbacks } from "./src/shared/callbacks.ts";

let todoList: DatabaseTodoList;

export const run = async () => {
  todoList = new DatabaseTodoList();
  const win = new WebUI();

  bindAll(win, {
    addTodo: addTodo,
    getTodoList: getTodoList,
    updateTodo: updateTodo,
    deleteTodo: deleteTodo,
    exit: exit,
  });

  win.setRootFolder("./dist/");
  await todoList.init();
  await win.show("./index.html");
  await WebUI.wait();
};

const bindAll = (
  win: WebUI,
  callbacks: Record<keyof Callbacks, BindCallback<string | void>>,
) => {
  for (const [key, value] of Object.entries(callbacks)) win.bind(key, value);
};

const addTodo: BindCallback<string> = async (
  { arg }: WebUI.Event,
) => {
  const todoItem = Todo.fromContent(arg.string(0));
  return JSON.stringify(await todoList.add(todoItem.toJSON()));
};

const getTodoList = async () => JSON.stringify(await todoList.getAll());

const updateTodo: BindCallback<string> = async ({ arg }: WebUI.Event) => {
  return JSON.stringify(await todoList.update(arg.string(0)));
};

const deleteTodo: BindCallback<string> = async ({ arg }: WebUI.Event) => {
  return JSON.stringify(await todoList.remove(arg.string(0)));
};

export const exit = () => {
  todoList.close();
  WebUI.exit();
};

if (import.meta.main) run();
