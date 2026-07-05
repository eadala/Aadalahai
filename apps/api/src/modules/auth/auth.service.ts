import { eq, and, isNull, gt } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { users, refreshTokens } from "../../db/schema.js";
import { AppError } from "../../lib/errors.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  getRefreshExpiry,
} from "../../lib/tokens.js";
import type { Env } from "../../config/env.js";
import type {
  RegisterInput,
  LoginInput,
  AuthResponse,
  UserResponse,
} from "./auth.schema.js";

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly env: Env,
    private readonly signAccessToken: (payload: {
      sub: string;
      email: string;
      role: string;
    }) => string
  ) {}

  private toUserResponse(user: typeof users.$inferSelect): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async issueTokens(user: typeof users.$inferSelect): Promise<AuthResponse> {
    const accessToken = this.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await this.db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: getRefreshExpiry(this.env.JWT_REFRESH_EXPIRES_DAYS),
    });

    return {
      user: this.toUserResponse(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.env.JWT_ACCESS_EXPIRES_IN,
      },
    };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError("EMAIL_EXISTS", "البريد الإلكتروني مسجل مسبقًا", 409);
    }

    const passwordHash = await hashPassword(input.password);

    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
      })
      .returning();

    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new AppError("INVALID_CREDENTIALS", "بيانات الدخول غير صحيحة", 401);
    }

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) {
      throw new AppError("INVALID_CREDENTIALS", "بيانات الدخول غير صحيحة", 401);
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    const [stored] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!stored) {
      throw new AppError("INVALID_REFRESH_TOKEN", "رمز التجديد غير صالح", 401);
    }

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(eq(refreshTokens.id, stored.id));

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, stored.userId))
      .limit(1);

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "المستخدم غير موجود", 404);
    }

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt))
      );
  }

  async getMe(userId: string): Promise<UserResponse> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "المستخدم غير موجود", 404);
    }

    return this.toUserResponse(user);
  }
}
