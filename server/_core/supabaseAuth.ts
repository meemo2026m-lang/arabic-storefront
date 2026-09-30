import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

type SupabaseAuthResponse = { user?: { id?: string; email?: string | null } };

function configurationError() {
  if (!ENV.supabaseUrl || !ENV.supabasePublishableKey || !ENV.cookieSecret) {
    return "Supabase login is not configured on this server.";
  }
  return null;
}

export function registerSupabaseAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const configError = configurationError();
    if (configError) return void res.status(503).json({ error: configError });

    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return void res.status(400).json({ error: "Email and password are required." });

    try {
      const response = await fetch(`${ENV.supabaseUrl.replace(/\/+$/, "")}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: ENV.supabasePublishableKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) return void res.status(401).json({ error: "Invalid email or password." });

      const payload = (await response.json()) as SupabaseAuthResponse;
      const signedInEmail = payload.user?.email?.trim().toLowerCase();
      const userId = payload.user?.id;
      if (!userId || !signedInEmail) {
        return void res.status(401).json({ error: "Supabase did not return a valid user." });
      }

      const token = await sdk.createSessionToken(`supabase_${userId}`, { name: signedInEmail, expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[SupabaseAuth] Login failed", error);
      res.status(502).json({ error: "Could not reach Supabase Auth." });
    }
  });
}
