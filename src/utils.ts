import { IsomorphicHeaders, RequestInfo, RequestMeta } from "@modelcontextprotocol/sdk/types.js"
import { startSpan } from "@blaxel/core";

/**
 * Helper function to get a value based on priority: meta > headers > env
 */
export function getConfigValue(
  metaValue: any,
  headerKey: string,
  envKey: string,
  headers: IsomorphicHeaders = {}
): string | undefined {
  // Priority order: meta > headers > env
  if (metaValue) {
    return metaValue as string;
  }
  if (headers[headerKey]) {
    const headerValue = headers[headerKey];
    // Handle both array and string formats
    return Array.isArray(headerValue) ? headerValue[0] : headerValue;
  }
  if (process.env[envKey]) {
    return process.env[envKey];
  }
  return undefined;
}

export function getDeploymentName(meta: RequestMeta, requestInfo: RequestInfo): string {
  const headers = requestInfo?.headers ?? {};

  const deploymentName = getConfigValue(
    meta?.deploymentName,
    "x-convex-deployment-name",
    "DEPLOYMENT_NAME",
    headers
  );

  if (!deploymentName) {
    throw new Error("Deployment name not found");
  }

  return deploymentName;
}

export function getUrl(meta: RequestMeta, requestInfo: RequestInfo): string {
  const headers = requestInfo?.headers ?? {};

  const url = getConfigValue(
    meta?.deploymentUrl,
    "x-convex-deployment-url",
    "DEPLOYMENT_URL",
    headers
  );

  if (url) {
    return url;
  }

  // Fallback: construct URL from deployment name
  const deploymentName = getDeploymentName(meta, requestInfo);
  return `https://${deploymentName}.convex.cloud`;
}

export function getHeaders(meta: RequestMeta, requestInfo: RequestInfo): Record<string, string> {
  const requestHeaders = requestInfo?.headers ?? {};

  // Try deployment key first
  const deploymentKey = getConfigValue(
    meta?.deploymentKey,
    "x-convex-deployment-key",
    "DEPLOYMENT_KEY",
    requestHeaders
  );

  if (deploymentKey) {
    return { Authorization: `Convex ${deploymentKey}` };
  }

  // Fallback to admin access token
  const adminAccessToken = getConfigValue(
    null,
    "x-convex-admin-access-token",
    "ADMIN_ACCESS_TOKEN",
    requestHeaders
  );

  if (adminAccessToken) {
    return { Authorization: `Convex ${adminAccessToken}` };
  }

  throw new Error("ADMIN_ACCESS_TOKEN or DEPLOYMENT_KEY environment variable is required");
}

/**
 * Middleware that wraps MCP tool handlers with logging and telemetry
 */
export function withToolMiddleware<TArgs extends Record<string, any>, TContext extends { _meta?: RequestMeta; requestInfo?: RequestInfo }>(
  toolName: string,
  handler: (args: TArgs, context: TContext) => Promise<{ content: any[]; isError: boolean }>
): (args: TArgs, context: TContext) => Promise<{ content: any[]; isError: boolean }> {
  return async (args: TArgs, context: TContext) => {
    const startTime = Date.now();

    console.log(`[MCP Tool] ${toolName} called`, {
      timestamp: new Date().toISOString(),
      args: JSON.stringify(args),
    });

    const span = startSpan(`mcp.tool.${toolName}`);
    try {
      const result = await handler(args, context);
      const duration = Date.now() - startTime;

      span.setAttribute("tool.success", !result.isError);
      span.setAttribute("tool.duration_ms", duration);

        console.log(`[MCP Tool] ${toolName} completed`, {
          timestamp: new Date().toISOString(),
          duration_ms: duration,
          success: !result.isError,
        });

        span.end();
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        span.recordException(error as Error);
        span.setAttribute("tool.success", false);
        span.setAttribute("tool.duration_ms", duration);
        span.setAttribute("tool.error", (error as Error).message);

        console.error(`[MCP Tool] ${toolName} failed`, {
          timestamp: new Date().toISOString(),
          duration_ms: duration,
          error: (error as Error).message,
          stack: (error as Error).stack,
        });

        span.end();
        throw error;
      }
  };
}