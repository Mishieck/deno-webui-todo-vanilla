export const interpolate = (
  html: string,
  css: string,
) =>
  new Function(
    `return \`<style>${updateCssUrls(css)}</style>${html}\`;`,
  ) as () => string;

const updateCssUrls = (css: string): string => css.replaceAll(/\.\.\//g, "./");

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

export type Parts<Types extends Record<string, typeof HTMLElement>> = {
  [Name in keyof Types]: InstanceType<Types[Name]>;
};

export const attachParts = <Types extends Record<string, typeof HTMLElement>>(
  element: HTMLElement,
  types: Types,
): Parts<Types> => {
  const parts: Partial<Parts<Types>> = {};

  for (const name in types) {
    Object.defineProperty(parts, name, {
      get() {
        return element.shadowRoot!.querySelector(`::part(${name})`)!;
      },
    });
  }

  return parts as Parts<Types>;
};

/** Converts an HTML string to an `HTMLElement`. */
export const htmlToElement = (html: string): HTMLElement => {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild as HTMLElement;
};
