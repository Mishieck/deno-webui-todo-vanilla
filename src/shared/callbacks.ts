export type Callbacks = {
  addTodo: { args: [id: string]; output: string };
  getTodoList: { args: []; output: string };
  updateTodo: { args: [id: string]; output: string };
  deleteTodo: { args: [id: string]; output: string };
  exit: { args: []; output: void };
};
