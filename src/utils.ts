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
  if (process.env.DEPLOYMENT_URL) {
    return process.env.DEPLOYMENT_URL
  }
  const deploymentName = getDeploymentName(meta)
  const expectedHostname = `${deploymentName}.convex.cloud`.toLowerCase()
  const url = new URL(`https://${deploymentName}.convex.cloud`)
  if (url.hostname !== expectedHostname) {
    throw new Error("Invalid deployment name")
  }
  return url.origin
}