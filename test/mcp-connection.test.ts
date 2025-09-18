import { describe, expect, it } from "vitest";
import { initMCPClient } from "./utils/mcpClient";

describe("MCP stdio connection", () => {
  it("connects to MCP server and lists tools", async () => {
    const { tools, close } = await initMCPClient({ deploymentName: "test" });
    expect(Object.keys(tools)).toContain("data");
    await close();
  }, 30000);
});


