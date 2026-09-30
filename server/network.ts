import { hostname, networkInterfaces } from "node:os";

const activeClients = new Map<string, { address: string; lastSeenAt: number; lastPath: string }>();

export function recordNetworkClient(address?: string, lastPath = "/") {
  const normalized = (address || "unknown").replace("::ffff:", "");
  const previous = activeClients.get(normalized);
  activeClients.set(normalized, { address: normalized, lastSeenAt: Date.now(), lastPath: lastPath || previous?.lastPath || "/" });
}

export function getNetworkStatus() {
  const interfaces = networkInterfaces();
  const addresses = Object.entries(interfaces).flatMap(([name, entries]) => (entries ?? []).filter(entry => entry.family === "IPv4" && !entry.internal).map(entry => ({ name, address: entry.address, netmask: entry.netmask })));
  const checkedAt = Date.now();
  const clients = Array.from(activeClients.values()).filter(client => checkedAt - client.lastSeenAt < 120_000).sort((left, right) => right.lastSeenAt - left.lastSeenAt);
  return { hostname: hostname(), bindHost: process.env.HOST || "0.0.0.0", addresses, clients, servicePort: Number(process.env.PORT ?? 3000), mode: process.env.NODE_ENV === "production" ? "production" : "development", checkedAt };
}
