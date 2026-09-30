import { createServer } from "http";
import type { Express } from "express";
import { createApp } from "../server/_core/app";

/**
 * Vercel serverless entry point.
 *
 * The Express app is expensive to build (registers tRPC routes, mounts static
 * assets), so it is created once and reused across invocations in the same
 * warm lambda instance.
 */
let appPromise: Promise<Express> | undefined;

function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = createApp(createServer());
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
