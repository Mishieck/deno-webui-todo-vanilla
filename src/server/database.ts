import { DatabaseError, Result } from "../shared/result.ts";
import { Todo, TodoData } from "../shared/todo.ts";

export class TodoList {
  #data: Array<TodoData>;

  constructor(data: Array<TodoData>) {
    this.#data = data;
  }

  async add(item: TodoData): Promise<Result<TodoData, "OPERATION_FAILED">> {
    this.#data.push(item);
    return Promise.resolve(item);
  }

  async getOne(id: string): Promise<Result<TodoData, "NOT_FOUND">> {
    return (
      this.#data.find((todo) => todo.id === id) ??
        new DatabaseError("NOT_FOUND", `Todo "${id}" not found.`)
    );
  }

  async getAll(): Promise<Result<Array<TodoData>, "OPERATION_FAILED">> {
    return this.#data;
  }

  async update(id: TodoData["id"]): Promise<Result<TodoData, "NOT_FOUND">> {
    const data = this.#data.find((item) => item.id === id);

    if (!data) {
      return new DatabaseError(
        "NOT_FOUND",
        `Todo item with id '${id}' was not found.`,
      );
    }

    const todo = new Todo(data);
    todo.update();
    return todo.toJSON();
  }

  async remove(id: string): Promise<Result<TodoData, "NOT_FOUND">> {
    const index = this.#data.findIndex((item) => item.id === id);

    if (index !== -1) {
      const [item] = this.#data.splice(index, 1);
      return item;
    }

    return new DatabaseError(
      "NOT_FOUND",
      `Todo item with id '${id}' was not found.`,
    );
  }
}
