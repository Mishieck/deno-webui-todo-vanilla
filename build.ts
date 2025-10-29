export const log = (buffer: Uint8Array<ArrayBuffer>) =>
  console.log(new TextDecoder().decode(buffer));

export type TemplateStringTag<
  Output,
  Expressions extends Array<unknown> = Array<unknown>,
> = (strings: TemplateStringsArray, ...expressions: Expressions) => Output;

export type DenoShell = TemplateStringTag<
  Promise<Deno.CommandOutput>,
  Array<string>
>;

export const shell: DenoShell = (strings, ...expressions) => {
  let subCommand = strings[0];

  for (let i = 1; i < expressions.length; i++) {
    subCommand += expressions[i] + strings[i];
  }

  const command = new Deno.Command(Deno.execPath(), {
    args: subCommand.split(/\s+/),
  });

  return command.output();
};

export const build = async (optimize: boolean) => {
  const output =
    await shell`bundle --unstable-raw-imports --outdir dist ./src/client/index.html`;

  const htmlFilePath = new URL("./dist/index.html", import.meta.url);
  const html = await Deno.readTextFile(htmlFilePath);
  const newHtml = insertWebUiScript(html);
  await Deno.writeTextFile(htmlFilePath, newHtml);
  await moveStyles();
  log(output.stdout);
};

const insertWebUiScript = (html: string): string => {
  const webUiScript = `<script src="/webui.js"></script>`;
  const insertionIndex = html.indexOf("<script"); // The script is for custom code.

  return html.substring(0, insertionIndex) +
    webUiScript +
    html.substring(insertionIndex);
};

// TODO: Remove this when Deno bundles CSS.
const moveStyles = async () => {
  const styleNames = ["index", "resets", "button"];

  const pathEntries = styleNames
    .map((name) => [`./src/client/${name}.css`, `./dist/${name}.css`])
    .map((entry) => entry.map((path) => new URL(path, import.meta.url)));

  for (const [source, destination] of pathEntries) {
    await Deno.copyFile(source, destination);
  }
};

if (import.meta.main) await build(true);
