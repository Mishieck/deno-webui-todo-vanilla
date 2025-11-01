import { Callback } from "../client/webui.ts";

export type Callbacks = {
  addTodo: Callback<[id: string], string>;
  getTodoList: Callback<[], string>;
  updateTodo: Callback<[id: string], string>;
  deleteTodo: Callback<[id: string], string>;
  exit: Callback<[], void>;
};
