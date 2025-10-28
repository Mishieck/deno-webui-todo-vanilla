/**
 * The data for a todo item. The data structure is meant to optimize storage.
 * For example, it stores dates as `number`s instead of `Date`s. The data
 * structure is also meant to be easily serializable for storage and
 * transmission.
 */
export type TodoData = {
  id: string;
  content: string;

  /** The time at which the todo item was added. */
  timeAdded: number;

  /**
   * The time at which the todo item was done. `0` means that the todo item is
   * not done.
   */
  timeDone: number;
};

/**
 * The todo item interface. It is used to read from and write to a todo item.
 */
export class Todo {
  #data: TodoData;

  static fromContent(content: string) {
    return new Todo({
      id: crypto.randomUUID(),
      content,
      timeAdded: Date.now(),
      timeDone: 0,
    });
  }

  constructor(data: TodoData) {
    this.#data = data;
  }

  get id(): TodoData["id"] {
    return this.#data.id;
  }

  get content(): TodoData["content"] {
    return this.#data.content;
  }

  get timeAdded(): Date {
    return new Date(this.#data.timeAdded);
  }

  get timeDone(): Date {
    return new Date(this.#data.timeDone);
  }

  get isDone(): boolean {
    return this.#data.timeDone > 0;
  }

  toJSON(): TodoData {
    return this.#data;
  }

  update() {
    if (this.isDone) this.#data.timeDone = 0;
    else this.#data.timeDone = Date.now();
  }
}
