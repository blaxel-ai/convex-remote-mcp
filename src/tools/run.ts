import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { convexFetch } from "../client";
import { getHeaders, getUrl } from "../utils";

const inputSchema = {
  functionName: z
    .string()
    .describe("The fully qualified function name (e.g. 'module.js:exportedName')."),
  args: z
    .unknown()
    .optional()
    .describe("Arguments to pass to the function (object)."),
};

const description = (
  `Run a Convex function (query, mutation, or action) on the deployment.`
);

export const registerRun = (server: McpServer) => {
  server.registerTool(
    "run",
    {
      description,
      inputSchema,
    },
    async ({ functionName, args }, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const headers = getHeaders(_meta)
      const body = {
        path: functionName,
        args: args ?? {},
      };
      const { data } = await convexFetch<{ value: unknown }>({
        baseUrl,
        method: "POST",
        path: "/api/function",
        body,
        headers,
      });
      return {
        content: [{ type: "text", text: JSON.stringify({ result: data?.value }) }],
        isError: false,
      };
    },
  );
};


