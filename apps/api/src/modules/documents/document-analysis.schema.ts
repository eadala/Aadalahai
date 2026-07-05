import { z } from "zod";

export const analysisOutputSchema = z.object({
  summary: z.string().min(10),
  keyClauses: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      })
    )
    .default([]),
  risks: z
    .array(
      z.object({
        level: z.enum(["high", "medium", "low"]),
        description: z.string().min(1),
      })
    )
    .default([]),
  recommendations: z.array(z.string().min(1)).default([]),
});

export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;
