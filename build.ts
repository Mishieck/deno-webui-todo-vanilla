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
  const output = await shell`bundle --outdir dist ./src/client/index.html`;
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

const moveStyles = async () => {
  const stylesPath = new URL("./src/client/index.css", import.meta.url);
  const stylesDistPath = new URL("./dist/index.css", import.meta.url);
  await Deno.copyFile(stylesPath, stylesDistPath);
};

if (import.meta.main) await build(true);
