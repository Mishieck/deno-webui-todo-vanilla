import html from "./input-form/template.html" with { type: "text" };
import css from "./input-form/styles.css" with { type: "text" };
import { attachParts, interpolate, Parts, render } from "./template.ts";
import { clientTodoList } from "./todo-list/object.ts";

const content = interpolate(html, css);

const parts = {
  editor: HTMLFormElement,
  textfield: HTMLInputElement,
  button: HTMLButtonElement,
};

export type InputFormSubmit = CustomEvent<string>;

export class InputForm extends HTMLElement {
  #parts: Parts<typeof parts>;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#parts = attachParts(this, parts);
  }

  connectedCallback() {
    render(this, content);
    this.#parts.textfield.disabled = false;

    this.#parts.textfield.addEventListener(
      "input",
      this.onInputChange.bind(this),
    );

    this.#parts.editor.addEventListener("submit", (event) => {
      event.preventDefault();
      clientTodoList.add(this.#parts.textfield.value);

      // TODO: Maybe update value in a way that triggers the 'input' event.
      this.#parts.textfield.value = "";
      this.#parts.button.disabled = true;
    });
  }

  onInputChange(_event: Event) {
    this.#parts.button.disabled = this.#parts.textfield.value ? false : true;
  }
}

customElements.define("input-form", InputForm);
