import { z } from "zod";

/**
 * Converts a JSON Schema-like object (FunctionSchema) to a Zod schema
 */
export function schemaToZodSchema(schema: any): z.ZodTypeAny {
  // If schema is already a Zod schema, return it
  if (schema instanceof z.ZodType) {
    return schema;
  }

  // If it's an empty object or undefined, return z.any()
  if (!schema || Object.keys(schema).length === 0) {
    return z.any();
  }

  // If it's a plain object with properties (like the tools use)
  if (typeof schema === 'object' && !Array.isArray(schema)) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, value] of Object.entries(schema)) {
      // If the value is already a Zod schema, use it directly
      if (value instanceof z.ZodType) {
        shape[key] = value;
      } else {
        // Otherwise, recursively convert it
        shape[key] = schemaToZodSchema(value);
      }
    }

    return z.object(shape);
  }

  // Default case
  return z.any();
}
