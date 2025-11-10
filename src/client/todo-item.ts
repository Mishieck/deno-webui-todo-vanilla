import html from "./todo-item/template.html" with { type: "text" };
import css from "./todo-item/styles.css" with { type: "text" };
import { attachParts, interpolate, Parts, render } from "./template.ts";
import { clientTodoList } from "./todo-list/object.ts";

const content = interpolate(html, css);

const parts = {
  checkbox: HTMLInputElement,
  button: HTMLButtonElement,
};

export class TodoItem extends HTMLElement {
  #parts: Parts<typeof parts>;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#parts = attachParts(this, parts);
  }

  get content(): string {
    return this.getAttribute("content")!;
  }

  get timeAdded(): number {
    return Number.parseInt(this.getAttribute("time-added")!);
  }

  get timeDone(): number {
    return Number.parseInt(this.getAttribute("time-done")!);
  }

  get isDone(): boolean {
    return Number(this.timeDone) > 0;
  }

  connectedCallback() {
    render(this, content);
    this.#parts.checkbox.checked = this.isDone;

    this.#parts.checkbox.addEventListener("change", async () => {
      const result = await clientTodoList.update(this.id);

      if ("cause" in result) {
        this.#parts.checkbox.checked = !this.#parts.checkbox.checked;
      }
    });

    this.#parts.button.addEventListener("click", async () => {
      const result = await clientTodoList.remove(this.id);

      if ("cause" in result) {
        // TODO: Handle error
      }
    });
  }
}

customElements.define("todo-item", TodoItem);
