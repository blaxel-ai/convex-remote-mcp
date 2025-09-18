import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { convexFetch } from "../client";
import { getHeaders, getUrl } from "../utils";

const inputSchema = {};

const description = (
  `List all tables in a Convex deployment with declared and inferred schemas.`
);

export const registerTables = (server: McpServer) => {
  server.registerTool(
    "tables",
    {
      description,
      inputSchema,
    },
    async (_args, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const headers = getHeaders(_meta)
      // Fetch declared (active) schema via system function
      const { data: schemaResponse } = await convexFetch<any, any>({
        baseUrl,
        method: "POST",
        path: "/api/query",
        body: {
          path: "_system/frontend/getSchemas",
          args: {},
        },
        headers,
      });

      const declaredSchema: Record<string, any> = {};
      if (schemaResponse && schemaResponse.active) {
        try {
          const parsed = JSON.parse(schemaResponse.active);
          const activeSchemaEntry = z.object({
            tableName: z.string(),
            indexes: z.array(z.any()),
            searchIndexes: z.array(z.any()),
            vectorIndexes: z.array(z.any()),
            documentType: z.any(),
          });
          const activeSchema = z.object({ tables: z.array(activeSchemaEntry) });
          const validated = activeSchema.parse(parsed);
          for (const table of validated.tables) {
            declaredSchema[table.tableName] = table;
          }
        } catch (_e) {
          // Ignore parse/validation errors; we'll just omit declared schema
        }
      }

      // Fetch inferred schema
      const { data: shapesResult } = await convexFetch<Record<string, any>>({
        baseUrl,
        method: "GET",
        path: "/api/shapes2",
        headers,
      });

      const allTables = Array.from(
        new Set([...
          Object.keys(shapesResult ?? {}),
          ...Object.keys(declaredSchema),
        ])
      ).sort();

      const result: Record<string, { schema?: any; inferredSchema?: any }> = {};
      for (const table of allTables) {
        result[table] = {
          schema: declaredSchema[table],
          inferredSchema: shapesResult?.[table],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ tables: result }) }],
        isError: false,
      };
    },
  );
};


