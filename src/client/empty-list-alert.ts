import html from "./empty-list-alert/template.html" with { type: "text" };
import css from "./empty-list-alert/styles.css" with { type: "text" };
import { interpolate, render } from "./template.ts";

const content = interpolate(html, css);

export class EmptyListAlert extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    render(this, content);
  }
}

customElements.define("empty-list-alert", EmptyListAlert);
