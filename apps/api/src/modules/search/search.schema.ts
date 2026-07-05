import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(2, "too_short").max(500, "too_long"),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
