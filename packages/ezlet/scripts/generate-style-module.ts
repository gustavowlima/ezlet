const css = await Bun.file("src/styles/ezlet.css").text();

const cssLiteral = `'${css
  .replaceAll("\\", "\\\\")
  .replaceAll("'", "\\'")
  .replaceAll("\r", "\\r")
  .replaceAll("\n", "\\n")}'`;

const module = `export const EZLET_CSS =\n  ${cssLiteral};\n`;

await Bun.write("src/styles/generated-css.ts", module);
