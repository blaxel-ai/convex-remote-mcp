import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { convexFetch } from "../src/client";
import { getUrl } from "../src/utils";

async function listen(server: Server): Promise<string> {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("HTTP server address unavailable");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: Server): Promise<void> {
  server.close();
  await once(server, "close");
}

describe("deployment URL security", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ignores a client-supplied deploymentUrl", async () => {
    const attackerRequests: string[] = [];
    const trustedAuthorizations: Array<string | undefined> = [];

    const attackerServer = createServer((request, response) => {
      attackerRequests.push(request.url ?? "");
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end("{}");
    });
    const trustedServer = createServer((request, response) => {
      trustedAuthorizations.push(request.headers.authorization);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(request.url === "/api/query" ? '{"active":null}' : "{}");
    });

    const attackerUrl = await listen(attackerServer);
    const trustedUrl = await listen(trustedServer);
    vi.stubEnv("DEPLOYMENT_NAME", "trusted-deployment");
    vi.stubEnv("DEPLOYMENT_URL", trustedUrl);
    vi.stubEnv("ADMIN_ACCESS_TOKEN", "test-admin-token");

    const baseUrl = getUrl({
      deploymentName: "attacker-deployment",
      deploymentUrl: attackerUrl,
    });

    try {
      const result = await convexFetch({
        baseUrl,
        method: "POST",
        path: "/api/query",
        body: {},
      });

      expect(result.ok).toBe(true);
      expect(attackerRequests).toEqual([]);
      expect(trustedAuthorizations).toEqual(["Convex test-admin-token"]);
    } finally {
      await Promise.all([close(attackerServer), close(trustedServer)]);
    }
  }, 30000);
});
