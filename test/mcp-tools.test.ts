import { describe, expect, it } from "vitest";
import { initMCPClient } from "./utils/mcpClient";

const TOOL_NAMES = [
  "data",
  "tables",
  "logs",
  "functionSpec",
  "run",
  "runOneoffQuery",
  "envList",
  "envGet",
  "envSet",
  "envRemove",
];

const deploymentName = process.env.TEST_DEPLOYMENT_NAME;
const deploymentKey = process.env.TEST_DEPLOYMENT_KEY;

describe("MCP tools", () => {
  it("exposes all expected tools", async () => {
    const { tools, close } = await initMCPClient({ deploymentName: "test" });
    const names = Object.keys(tools);
    for (const name of TOOL_NAMES) {
      expect(names).toContain(name);
    }
    await close();
  }, 30000);

  it("raises error without deployment name for tools that require it", async () => {
    const { tools, close } = await initMCPClient({});
    const toolsToCheck = {
      data: {
        tableName: "tasks",
        order: "asc",
        limit: 1000,
      },
      tables: {
        tableName: "tasks",
        order: "asc",
        limit: 1000,
      },
      logs: {
        limit: 1000,
      },
      functionSpec: {
        functionName: "tasks",
      },
      runOneoffQuery: {
        query: "tasks",
      },
      envList: {
        projectDir: "tasks",
      },
      envGet: {
        name: "tasks",
      },
      envSet: {
        name: "tasks",
        value: "tasks",
      },
      envRemove: {
        name: "tasks",
      },
    }
    for (const name of Object.keys(toolsToCheck)) {
      const result = await tools[name].execute(toolsToCheck[name] as any);
      expect(result.isError).toBe(true);
    }
    await close();
  }, 45000);

  it("tables lists schemas", async () => {
    const { tools, close } = await initMCPClient({ deploymentName });
    const result = await tools["tables"].execute({});
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("functionSpec returns metadata", async () => {
    const { tools, close } = await initMCPClient({ deploymentName });
    const result = await tools["functionSpec"].execute({});
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("logs returns entries and newCursor", async () => {
    const { tools, close } = await initMCPClient({ deploymentName });
    const result = await tools["logs"].execute({ limit: 1 });
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("envList returns variables", async () => {
    const { tools, close } = await initMCPClient({ deploymentName });
    const result = await tools["envList"].execute({});
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("runOneoffQuery executes a readonly query", async () => {
    const { tools, close } = await initMCPClient({ deploymentName });
    const source = [
      'import { query } from "convex:/_system/repl/wrappers.js";',
      "export default query({",
      "  handler: async () => {",
      "    return 42;",
      "  },",
      "});",
    ].join("\n");
    const result = await tools["runOneoffQuery"].execute({ query: source });
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 45000);

  it("tables lists schemas with deployment key", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    console.log(deploymentName, deploymentKey);
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["tables"].execute({});
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("data reads table data with deployment key", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["data"].execute({
      tableName: "_storage",
      order: "asc",
      limit: 1
    });
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("functionSpec returns metadata with deployment key", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["functionSpec"].execute({});
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("logs returns entries with deployment key", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["logs"].execute({ limit: 1 });
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("envList returns variables with deployment key", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["envList"].execute({});
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("envGet retrieves variable with deployment key", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["envGet"].execute({ name: "TEST_VAR" });
    console.log(result);
    expect(result.isError).toBe(false);
    await close();
  }, 30000);

  it("envSet requires admin key (fails with deployment key)", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["envSet"].execute({
      name: "TEST_VAR_MCP",
      value: "test_value"
    });
    console.log(result);
    // Should fail as envSet mutations require admin access
    expect(result.isError).toBe(true);
    await close();
  }, 30000);

  it("envRemove requires admin key (fails with deployment key)", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const result = await tools["envRemove"].execute({ name: "TEST_VAR_MCP" });
    console.log(result);
    // Should fail as envRemove mutations require admin access
    expect(result.isError).toBe(true);
    await close();
  }, 30000);

  it("run requires admin key for system functions (fails with deployment key)", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    // Try to run a system function that requires admin access
    const result = await tools["run"].execute({
      functionName: "_system/cli/queryEnvironmentVariables",
      args: {}
    });
    console.log(result);
    // Should fail as system functions require admin access
    expect(result.isError).toBe(true);
    await close();
  }, 30000);

  it("runOneoffQuery requires admin key (fails with deployment key)", async () => {
    delete process.env.ADMIN_ACCESS_TOKEN;
    const { tools, close } = await initMCPClient({ deploymentName, deploymentKey });
    const source = [
      'import { query } from "convex:/_system/repl/wrappers.js";',
      "export default query({",
      "  handler: async () => {",
      "    return 42;",
      "  },",
      "});",
    ].join("\n");
    const result = await tools["runOneoffQuery"].execute({ query: source });
    console.log(result);
    // Should fail as oneoff queries require admin key
    expect(result.isError).toBe(true);
    await close();
  }, 45000);
});


