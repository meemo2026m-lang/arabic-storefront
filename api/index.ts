import { createServer } from "http";
import { createApp } from "../server/_core/app";

/**
 * Vercel serverless entry point (prebuilt with esbuild to dist/vercel-entry.js).
 *
 * `@vercel/node` invokes the default export with Node's (req, res) pair, so the
 * Express app is created once per warm lambda and reused across invocations.
 *
 * The Express app is built in `server/_core/app.ts` so this entry point and the
 * long-running local server share exactly the same middleware, routes and
 * static file handling.
 */
let appPromise: Promise<any> | undefined;

function getApp(): Promise<any> {
  if (!appPromise) {
    appPromise = createApp(createServer());
  }
  return appPromise;
}

export default async function handler(req: any, res: any): Promise<void> {
  const app = await getApp();
  // Express apps are callable request listeners; cast because the Express type
  // in this project resolves to a generic Application TypeScript won't call.
  return (app as unknown as (req: any, res: any) => void)(req, res);
}

