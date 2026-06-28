import index from "./index.html";

const port = Number(Bun.env.PORT ?? 3000);

const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  routes: {
    "/": index,
    "/favicon.ico": new Response(null, { status: 204 }),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Island Toast playground running at ${server.url}`);
