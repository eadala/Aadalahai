import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "required").max(255, "too_long"),
  content: z.string().min(10, "too_short").max(100_000, "too_long"),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
