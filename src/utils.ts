import { RequestMeta } from "@modelcontextprotocol/sdk/types.js"

export function getDeploymentName(meta: RequestMeta ): string {
  if (!meta?.deploymentName && !process.env.DEPLOYMENT_NAME) {
    throw new Error("Deployment name not found")
  }
  if (meta?.deploymentName) {
    return meta.deploymentName as string
  }
  return process.env.DEPLOYMENT_NAME
}

export function getUrl(meta: RequestMeta): string {
  if (!meta?.deploymentName && !process.env.DEPLOYMENT_NAME) {
    throw new Error("Deployment name not found")
  }
  if (meta?.deploymentUrl) {
    return meta.deploymentUrl as string
  }
  if (process.env.DEPLOYMENT_URL) {
    return process.env.DEPLOYMENT_URL
  }
  const deploymentName = getDeploymentName(meta)
  return `https://${deploymentName}.convex.cloud`
}

export function getHeaders(meta: RequestMeta): Record<string, string> {
  const headers = {}
  const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN;
  console.error(meta)
  if (meta?.deploymentKey) {
    headers["Authorization"] = `Convex ${meta.deploymentKey}`
  } else if (process.env.DEPLOYMENT_KEY) {
    headers["Authorization"] = `Convex ${process.env.DEPLOYMENT_KEY}`
  } else if (adminAccessToken) {
    headers["Authorization"] = `Convex ${adminAccessToken}`
  } else {
    throw new Error("ADMIN_ACCESS_TOKEN or DEPLOYMENT_KEY environment variable is required");
  }
  return headers
}