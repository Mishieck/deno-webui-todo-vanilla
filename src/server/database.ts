import { DatabaseError, Result } from "../shared/result.ts";
import { Todo, TodoData } from "../shared/todo.ts";

const PREFIX = "todo-list";
let store: Deno.Kv;
const createKey = (id: string) => [PREFIX, id];

export class TodoList {
  async init() {
    store = await Deno.openKv();
  }

  async add(item: TodoData): Promise<Result<TodoData, "OPERATION_FAILED">> {
    await store.set(createKey(item.id), item);
    return Promise.resolve(item);
  }

  async getOne(id: string): Promise<Result<TodoData, "NOT_FOUND">> {
    const result = await store.get<TodoData>([id]);

    return (
      result.value ??
        new DatabaseError("NOT_FOUND", `Todo "${id}" not found.`)
    );
  }

  async getAll(): Promise<Result<Array<TodoData>, "OPERATION_FAILED">> {
    const items: Array<TodoData> = [];
    let entry: Deno.KvEntry<TodoData> | undefined = undefined;
    const list = store.list<TodoData>({ prefix: [PREFIX] });
    while ((entry = (await list.next()).value)) items.push(entry.value);
    return items;
  }

  async update(id: TodoData["id"]): Promise<Result<TodoData, "NOT_FOUND">> {
    const key = createKey(id);
    const data = (await store.get<TodoData>(key)).value;

    if (!data) {
      return new DatabaseError(
        "NOT_FOUND",
        `Todo item with id '${id}' was not found.`,
      );
    }

    const todo = new Todo(data);
    todo.update();
    const newData = todo.toJSON();
    await store.set(key, newData);
    return newData;
  }

  async remove(id: string): Promise<Result<TodoData, "NOT_FOUND">> {
    const key = createKey(id);
    const item = (await store.get<TodoData>(key)).value;

    if (item) {
      store.delete(key);
      return item;
    }

    return new DatabaseError(
      "NOT_FOUND",
      `Todo item with id '${id}' was not found.`,
    );
  }

  close() {
    store.close();
  }
}
