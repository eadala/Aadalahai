import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "too_short").max(255, "too_long"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
