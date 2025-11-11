import { CallbackAttributes } from "../client/bridge/webui.ts";

export type Callbacks = {
  addTodo: CallbackAttributes<[id: string], string>;
  getTodoList: CallbackAttributes<[], string>;
  updateTodo: CallbackAttributes<[id: string], string>;
  deleteTodo: CallbackAttributes<[id: string], string>;
  exit: CallbackAttributes<[], void>;
};
