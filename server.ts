import { createApp } from "./server/_core/app";

/**
 * Vercel auto-detects a `server.ts` / `server.js` file in the project root and
 * turns it into a Node.js HTTP server that it routes all incoming requests to.
 * Detection relies on `server.listen()` being called at module startup, so this
 * file must own the listener instead of delegating it to a helper module.
 *
 * The Express app itself lives in `server/_core/app.ts` so that both this
 * serverless entry point and the local `pnpm start` server share it.
 */
import { createServer } from "http";

const server = createServer();

// Vercel injects PORT; the value only matters for local runs.
const port = Number(process.env.PORT || 3000);

async function start() {
  const app = await createApp(server);
  server.on("request", app);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch(error => {
  console.error("Failed to start server", error);
  process.exit(1);
});

export { server };