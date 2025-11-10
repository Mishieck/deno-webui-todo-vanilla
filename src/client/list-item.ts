import html from "./list-item/template.html" with { type: "text" };
import css from "./list-item/styles.css" with { type: "text" };
import { interpolate, render } from "./template.ts";

const content = interpolate(html, css);

export class ListItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    render(this, content);
  }
}

customElements.define("list-item", ListItem);
