import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { convexFetch } from "../client";
import { getUrl } from "../utils";

const listInput = {};
const getInput = {
  name: z.string().describe("Environment variable name"),
};
const setInput = {
  name: z.string(),
  value: z.string(),
};
const removeInput = {
  name: z.string(),
};

export const registerEnv = (server: McpServer) => {
  // envList
  server.registerTool(
    "envList",
    { description: "List environment variables", inputSchema: listInput },
    async (_args, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const { data } = await convexFetch<any, any>({
        baseUrl,
        method: "POST",
        path: "/api/query",
        body: {
          path: "_system/cli/queryEnvironmentVariables",
          args: {},
        },
      });
      return { content: [{ type: "text", text: JSON.stringify({ variables: data }) }], isError: false };
    },
  );

  // envGet
  server.registerTool(
    "envGet",
    { description: "Get an environment variable", inputSchema: getInput },
    async ({ name }, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const { data } = await convexFetch<any, any>({
        baseUrl,
        method: "POST",
        path: "/api/query",
        body: {
          path: "_system/cli/queryEnvironmentVariables:get",
          args: { name },
        },
      });
      return { content: [{ type: "text", text: JSON.stringify({ value: data?.value ?? null }) }], isError: false };
    },
  );

  // envSet
  server.registerTool(
    "envSet",
    { description: "Set an environment variable", inputSchema: setInput },
    async ({ name, value }, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const { data } = await convexFetch<any, any>({
        baseUrl,
        method: "POST",
        path: "/api/mutation",
        body: {
          path: "_system/cli/environment:set",
          args: { name, value },
        },
      });
      const success = !(data && data.status === "error");
      return { content: [{ type: "text", text: JSON.stringify({ success }) }], isError: !success };
    },
  );

  // envRemove
  server.registerTool(
    "envRemove",
    { description: "Remove an environment variable", inputSchema: removeInput },
    async ({ name }, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const { data } = await convexFetch<any, any>({
        baseUrl,
        method: "POST",
        path: "/api/mutation",
        body: {
          path: "_system/cli/environment:remove",
          args: { name },
        },
      });
      const success = !(data && data.status === "error");
      return { content: [{ type: "text", text: JSON.stringify({ success }) }], isError: !success };
    },
  );
};


