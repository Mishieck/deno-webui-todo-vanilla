export type Todo = {
  id: string;
  content: string;
  done: boolean;
  timeAdded: number;
};

export const ERROR_CODES = {
  NOT_FOUND: "not-found",
  OPERATION_FAILED: "operation-failed",
} as const;

export type ErrorCodes = typeof ERROR_CODES;

export class DatabaseError<Code extends keyof ErrorCodes> extends Error {
  constructor(cause: Code, message: string) {
    super(message, { cause: ERROR_CODES[cause] });
  }

  toJSON() {
    const { cause, message } = this;
    return { cause: cause as string, message };
  }
}

let todoList: Array<Todo> = [];

export const add = async (
  content: string,
): Promise<Todo | DatabaseError<"OPERATION_FAILED">> => {
  const todo: Todo = {
    id: crypto.randomUUID(),
    content,
    done: false,
    timeAdded: Date.now(),
  };

  todoList.push(todo);
  return todo;
};

export const getOne = async (
  id: string,
): Promise<Todo | DatabaseError<"NOT_FOUND">> => {
  return (
    todoList.find((todo) => todo.id === id) ??
      new DatabaseError("NOT_FOUND", `Todo "${id}" not found.`)
  );
};

export const getAll = async (): Promise<Array<Todo>> => {
  return todoList;
};

export const update = async (
  id: string,
  done: boolean,
): Promise<
  | Todo
  | DatabaseError<
    "NOT_FOUND" | "OPERATION_FAILED"
  >
> => {
  const todoItem = await getOne(id);
  if (todoItem instanceof DatabaseError) return todoItem;
  todoItem.done = done;
  return todoItem;
};

export const deleteTodo = async (
  id: string,
): Promise<
  | Todo
  | DatabaseError<
    "NOT_FOUND" | "OPERATION_FAILED"
  >
> => {
  const todo = todoList.find((item) => item.id === id);

  if (!todo) {
    return new DatabaseError("NOT_FOUND", `Todo "${id}" not found.`);
  }

  todoList = todoList.filter((item) => item.id !== id);
  return todo;
};
