import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Other tables here...

  tasks: defineTable({
    isCompleted: v.boolean(),
    text: v.string(),
  }),
});