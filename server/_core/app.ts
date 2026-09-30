import "dotenv/config";
import express, { type Express } from "express";
import type { Server } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerSupabaseAuthRoutes } from "./supabaseAuth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { recordNetworkClient } from "../network";

/**
 * Builds the Express application.
 *
 * Kept in its own module so that serverless entry points (e.g. Vercel's
 * /api/index.ts) can import and mount the app without also starting a
 * long-lived HTTP listener.
 */
export async function createApp(server: Server): Promise<Express> {
  const app = express();
  app.use((req, _res, next) => {
    recordNetworkClient(req.ip ?? req.socket.remoteAddress, req.originalUrl || req.path);
    next();
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerSupabaseAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return app;
}

