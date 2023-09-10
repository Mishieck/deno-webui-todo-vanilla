import { R } from './deps.ts';
import getUuid from './uuid.ts';

export type Todo = {
  id: string;
  content: string;
  done: boolean;
  timeAdded: string;
};

export const errors = {
  NOT_FOUND: 'not-found',
  OPERATION_FAILED: 'operation-failed'
};

export class DatabaseError<Type> extends Error {
  constructor(public type: Type, public message: string) {
    super();
  }
}

const todoList: Array<Todo> = [];

export const add = async (
  content: string,
  timeAdded: string
): Promise<Todo | DatabaseError<typeof errors.OPERATION_FAILED>> => {
  console.log({ content, timeAdded });
  const todo: Todo = {
    id: getUuid(),
    content,
    done: false,
    timeAdded
  };

  todoList.push(todo);
  console.log({ todo });
  return todo;
};

export const get = async (
  id: string
): Promise<Todo | DatabaseError<typeof errors.NOT_FOUND>> => {
  return (
    todoList.find(todo => todo.id === id) ??
    new DatabaseError(errors.NOT_FOUND, `Todo "${id}" not found.`)
  );
};

export const update = async (
  id: string,
  done: boolean
): Promise<
  Todo | DatabaseError<typeof errors.NOT_FOUND | typeof errors.OPERATION_FAILED>
> => {
  const todoIndex = R.findIndex(R.propEq('id', id))(todoList);
  const notFoundError = new DatabaseError(
    errors.NOT_FOUND,
    `Todo "${id}" not found.`
  );
  if (todoIndex === -1) return notFoundError;
  const maybeTodo = get(id);
  if (!maybeTodo) return notFoundError;
  const newTodo: Todo = R.mergeRight(maybeTodo, { done });
  todoList.splice(todoIndex, 1, newTodo);
  return newTodo;
};

export const deleteTodo = async (
  id: string
): Promise<
  Todo | DatabaseError<typeof errors.NOT_FOUND | typeof errors.OPERATION_FAILED>
> => {
  const todoIndex = R.findIndex(R.propEq('id', id));
  if (todoIndex === -1)
    return new DatabaseError(errors.NOT_FOUND, `Todo "${id}" not found.`);
  const todo = todoList[todoIndex];
  todoList.splice(todoIndex, 1);
  return todo;
};
