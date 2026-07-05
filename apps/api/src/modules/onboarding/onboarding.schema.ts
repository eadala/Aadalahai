import { z } from "zod";

export const lawyerOnboardingSchema = z.object({
  licenseNumber: z.string().min(3, "too_short").max(64, "too_long"),
  specialization: z.string().min(2, "too_short").max(128, "too_long"),
  barAssociation: z.string().min(2, "too_short").max(128, "too_long"),
  phone: z.string().min(8, "too_short").max(32, "too_long").optional(),
});

export type LawyerOnboardingInput = z.infer<typeof lawyerOnboardingSchema>;
