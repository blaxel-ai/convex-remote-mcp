import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { convexFetch } from "../client";
import { getUrl } from "../utils";

const inputSchema = {};

const description = (
  `Get function metadata (apiSpec) from the Convex deployment.`
);

export const registerFunctionSpec = (server: McpServer) => {
  server.registerTool(
    "functionSpec",
    {
      description,
      inputSchema,
    },
    async (_args, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const { data } = await convexFetch<any, any>({
        baseUrl,
        method: "POST",
        path: "/api/query",
        body: {
          path: "_system/cli/modules:apiSpec",
          args: {},
        },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
        isError: false,
      };
    },
  );
};


