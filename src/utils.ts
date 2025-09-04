import { RequestMeta } from "@modelcontextprotocol/sdk/types.js"

export function getDeploymentSelector(meta: RequestMeta ): string {
  if (!meta?.deploymentSelector && !process.env.DEPLOYMENT_SELECTOR) {
    throw new Error("Deployment selector not found")
  }
  if (meta?.deploymentSelector) {
    return meta.deploymentSelector as string
  }
  return process.env.DEPLOYMENT_SELECTOR
}

export function getUrl(meta: RequestMeta): string {
  if (!meta?.deploymentSelector && !process.env.DEPLOYMENT_SELECTOR) {
    throw new Error("Deployment selector not found")
  }
  if (meta?.deploymentUrl) {
    return meta.deploymentUrl as string
  }
  if (process.env.DEPLOYMENT_URL) {
    return process.env.DEPLOYMENT_URL
  }
  const deploymentSelector = getDeploymentSelector(meta)
  return `https://${deploymentSelector}.convex.cloud`
}