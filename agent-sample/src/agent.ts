import { blModel, blTool, blTools } from "@blaxel/mastra";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface Stream {
  write: (data: string) => void;
  end: () => void;
}

export default async function agent(
  input: string,
  stream: Stream
): Promise<void> {
  const convexMcp = await blTool("convex-remote-mcp", { meta: { deploymentName: "enduring-monitor-130" } })
  const agent = new Agent({
    name: "blaxel-agent-mastra",
    model: await blModel("sandbox-openai"),
    tools: {
      ...convexMcp,
    },
    instructions: "If the user ask for the weather, use the weather tool.",
  });

  const response = await agent.stream([{ role: "user", content: input }]);

  for await (const delta of response.textStream) {
    stream.write(delta);
  }
  stream.end();
}