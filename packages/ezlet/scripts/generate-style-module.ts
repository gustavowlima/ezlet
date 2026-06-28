const css = await Bun.file("src/styles/ezlet.css").text();

const module = `export const EZLET_CSS =\n  ${JSON.stringify(css)};\n`;

await Bun.write("src/styles/generated-css.ts", module);
