import html from "./todo-app/template.html" with { type: "text" };
import css from "./todo-app/styles.css" with { type: "text" };
import "./input-form.ts";
import "./app-body.ts";
import { interpolate, render } from "./template.ts";

const content = interpolate(html, css);

export class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    render(this, content);
  }
}

customElements.define("todo-app", TodoApp);
