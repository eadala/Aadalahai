import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "required").max(10_000, "too_long"),
  stream: z.boolean().optional().default(false),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
