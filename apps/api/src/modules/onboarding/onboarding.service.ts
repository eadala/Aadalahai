import { eq } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { users, lawyerProfiles } from "../../db/schema.js";
import { AppError } from "../../lib/errors.js";
import type { LawyerOnboardingInput } from "./onboarding.schema.js";

export interface OnboardingStatus {
  role: string;
  isLawyer: boolean;
  onboardingCompleted: boolean;
  profile: {
    licenseNumber: string;
    specialization: string;
    barAssociation: string;
    phone: string | null;
    completedAt: string;
  } | null;
}

export class OnboardingService {
  constructor(private readonly db: Database) {}

  async getStatus(userId: string): Promise<OnboardingStatus> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "المستخدم غير موجود", 404);
    }

    const [profile] = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, userId))
      .limit(1);

    return {
      role: user.role,
      isLawyer: user.role === "lawyer",
      onboardingCompleted: !!profile,
      profile: profile
        ? {
            licenseNumber: profile.licenseNumber,
            specialization: profile.specialization,
            barAssociation: profile.barAssociation,
            phone: profile.phone,
            completedAt: profile.completedAt.toISOString(),
          }
        : null,
    };
  }

  async completeLawyerOnboarding(userId: string, input: LawyerOnboardingInput) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "المستخدم غير موجود", 404);
    }

    if (user.role === "lawyer") {
      const existing = await this.db
        .select()
        .from(lawyerProfiles)
        .where(eq(lawyerProfiles.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        throw new AppError("ONBOARDING_COMPLETE", "تم إكمال التسجيل مسبقًا", 409);
      }
    }

    const [existingProfile] = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, userId))
      .limit(1);

    if (existingProfile) {
      throw new AppError("ONBOARDING_COMPLETE", "تم إكمال التسجيل مسبقًا", 409);
    }

    await this.db.insert(lawyerProfiles).values({
      userId,
      licenseNumber: input.licenseNumber,
      specialization: input.specialization,
      barAssociation: input.barAssociation,
      phone: input.phone ?? null,
    });

    const [updated] = await this.db
      .update(users)
      .set({ role: "lawyer", updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return {
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      onboarding: await this.getStatus(userId),
    };
  }
}
