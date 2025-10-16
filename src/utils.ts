import { IsomorphicHeaders, RequestInfo, RequestMeta } from "@modelcontextprotocol/sdk/types.js"

/**
 * Helper function to get a value based on priority: meta > headers > env
 */
export function getConfigValue(
  metaValue: any,
  headerKey: string,
  envKey: string,
  headers: IsomorphicHeaders = {}
): string | undefined {
  console.log("getConfigValue", metaValue, headerKey, envKey, headers);
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