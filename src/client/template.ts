export const interpolate = (
  html: string,
  css: string,
) => new Function(`return \`<style>${css}</style>${html}\`;`) as () => string;

export const render = (
  component: HTMLElement,
  content: () => string,
) => {
  const template = document.createElement("template");
  template.innerHTML = content.apply(component);

  if (component.shadowRoot && component.shadowRoot.innerHTML) {
    component.shadowRoot.innerHTML = "";
  }

  component.shadowRoot?.append(template.content);
};
