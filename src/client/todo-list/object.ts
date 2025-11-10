import {
  AddResult,
  DeleteResult,
  GetAllResult,
  UpdateResult,
} from "../../shared/database.ts";
import { TodoData } from "../../shared/todo.ts";

export type Events = {
  initialize: Array<TodoData>;
  empty: boolean;
  add: TodoData;
  update: TodoData;
  delete: TodoData;
};

export type EventName = keyof Events;

export type Event<Name extends EventName> = {
  name: Name;
  detail: Events[Name];
};

export type Observer<Name extends EventName = EventName> = (
  event: Event<Name>,
) => void;

export class ClientTodoList {
  #observers = new Map<EventName, Set<Observer<EventName>>>();
  #count = 0;

  async initialize() {
    const result = JSON.parse(await webui.call("getTodoList"));

    if (Array.isArray(result)) {
      this.notifyObservers({ name: "initialize", detail: result });
      this.notifyObservers({ name: "empty", detail: result.length === 0 });
      this.#count = result.length;
    }

    return result;
  }

  async add(content: string): Promise<AddResult> {
    const result = JSON.parse(await webui.call("addTodo", content));

    if ("id" in result) {
      this.notifyObservers({ name: "add", detail: result });
      this.#count++;

      if (this.#count === 1) {
        this.notifyObservers({ name: "empty", detail: false });
      }
    }

    return result;
  }

  async getAll(): Promise<GetAllResult> {
    return JSON.parse(await webui.call("getTodoList"));
  }

  async update(id: TodoData["id"]): Promise<UpdateResult> {
    const result = JSON.parse(await webui.call("updateTodo", id));

    if ("id" in result) {
      this.notifyObservers({ name: "update", detail: result });
    }

    return result;
  }

  async remove(id: string): Promise<DeleteResult> {
    const result = JSON.parse(await webui.call("deleteTodo", id));

    if ("id" in result) {
      this.notifyObservers({ name: "delete", detail: result });
      this.#count--;

      if (this.#count === 0) {
        this.notifyObservers({ name: "empty", detail: true });
      }
    }

    return result;
  }

  addObserver<Name extends EventName>(event: Name, observer: Observer<Name>) {
    if (!this.#observers.has(event)) this.#observers.set(event, new Set());
    this.#observers.get(event)!.add(observer as Observer);
  }

  removeObserver<Name extends EventName>(
    event: Name,
    observer: Observer<Name>,
  ) {
    this.#observers.get(event)!.delete(observer as Observer);
  }

  notifyObservers<Name extends EventName>(event: Event<Name>) {
    if (!this.#observers.has(event.name)) return;
    for (const notify of this.#observers.get(event.name)!) notify(event);
  }
}

export const clientTodoList = new ClientTodoList();
