import html from "./skeleton-item/template.html" with { type: "text" };
import css from "./skeleton-item/styles.css" with { type: "text" };
import { interpolate, render } from "./template.ts";

const content = interpolate(html, css);

export class SkeletonItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    render(this, content);
  }
}

customElements.define("skeleton-item", SkeletonItem);
