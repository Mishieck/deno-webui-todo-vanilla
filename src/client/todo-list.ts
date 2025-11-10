import html from "./todo-list/template.html" with { type: "text" };
import css from "./todo-list/styles.css" with { type: "text" };
import "./todo-item.ts";
import {
  attachParts,
  htmlToElement,
  interpolate,
  Parts,
  render,
} from "./template.ts";
import { TodoData } from "../shared/todo.ts";
import { clientTodoList } from "./todo-list/object.ts";

const content = interpolate(html, css);
const parts = { list: HTMLUListElement };

export type EmptyEvent = CustomEvent<boolean>;

export class TodoList extends HTMLElement {
  #parts: Parts<typeof parts>;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#parts = attachParts(this, parts);

    clientTodoList.addObserver(
      "initialize",
      (event) => this.initialize(event.detail),
    );
  }

  connectedCallback() {
    render(this, content);
    clientTodoList.addObserver("add", (event) => this.addTodo(event.detail));

    clientTodoList.addObserver(
      "delete",
      (event) => this.deleteTodo(event.detail),
    );
  }

  addTodo(todo: TodoData) {
    this.#parts.list.prepend(this.createTodoElement(todo));
  }

  deleteTodo(todo: TodoData) {
    const todoItem = this.shadowRoot?.getElementById(todo.id);
    todoItem?.parentElement?.remove();
  }

  createTodoElement(todo: TodoData): HTMLLIElement {
    const { id, content, timeAdded, timeDone } = todo;

    return htmlToElement(`
        <li>
          <todo-item
            id="${id}"
            content="${content}"
            time-added="${timeAdded}"
            time-done="${timeDone}"
          ></todo-item>
        </li>
      `) as HTMLLIElement;
  }

  initialize(items: Array<TodoData>) {
    const fragment = document.createDocumentFragment();

    for (const item of items as Array<TodoData>) {
      const todoEl = this.createTodoElement(item);
      fragment.append(todoEl);
    }

    this.#parts.list.append(fragment);
  }
}

customElements.define("todo-list", TodoList);
