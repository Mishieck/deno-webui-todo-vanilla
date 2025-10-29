import html from "./input-form/template.html" with { type: "text" };
import css from "./input-form/styles.css" with { type: "text" };
import { interpolate, render } from "./template.ts";

const content = interpolate(html, css);

export class InputForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    render(this, content);
  }
}

customElements.define("input-form", InputForm);
