import { count, eq, gte, and, desc } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import {
  chatSessions,
  messages,
  documents,
  users,
  lawyerProfiles,
  documentAnalyses,
} from "../../db/schema.js";

export interface LawyerProfileSummary {
  licenseNumber: string;
  specialization: string;
  barAssociation: string;
  phone: string | null;
  completedAt: string;
}

export interface RecentSession {
  id: string;
  title: string;
  updatedAt: string;
}

export interface RecentDocument {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface UserAnalytics {
  totalSessions: number;
  totalMessages: number;
  totalDocuments: number;
  messagesThisWeek: number;
  documentsReady: number;
  totalAnalyses: number;
  role: string;
  isLawyer: boolean;
  onboardingCompleted: boolean;
  memberSince: string;
  lastActivityAt: string | null;
  lawyerProfile: LawyerProfileSummary | null;
  recentSessions: RecentSession[];
  recentDocuments: RecentDocument[];
}

export class AnalyticsService {
  constructor(private readonly db: Database) {}

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const [profile] = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, userId))
      .limit(1);

    const [sessionStats] = await this.db
      .select({ total: count() })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId));

    const [messageStats] = await this.db
      .select({ total: count() })
      .from(messages)
      .innerJoin(chatSessions, eq(messages.sessionId, chatSessions.id))
      .where(eq(chatSessions.userId, userId));

    const [weekMessages] = await this.db
      .select({ total: count() })
      .from(messages)
      .innerJoin(chatSessions, eq(messages.sessionId, chatSessions.id))
      .where(and(eq(chatSessions.userId, userId), gte(messages.createdAt, weekAgo)));

    const [docStats] = await this.db
      .select({ total: count() })
      .from(documents)
      .where(eq(documents.userId, userId));

    const [docReady] = await this.db
      .select({ total: count() })
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.status, "ready")));

    const [analysisStats] = await this.db
      .select({ total: count() })
      .from(documentAnalyses)
      .where(eq(documentAnalyses.userId, userId));

    const [lastSession] = await this.db
      .select({ updatedAt: chatSessions.updatedAt })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(1);

    const recentSessions = await this.db
      .select({
        id: chatSessions.id,
        title: chatSessions.title,
        updatedAt: chatSessions.updatedAt,
      })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(5);

    const recentDocuments = await this.db
      .select({
        id: documents.id,
        title: documents.title,
        status: documents.status,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt))
      .limit(5);

    const role = user?.role ?? "user";

    return {
      totalSessions: Number(sessionStats?.total ?? 0),
      totalMessages: Number(messageStats?.total ?? 0),
      totalDocuments: Number(docStats?.total ?? 0),
      messagesThisWeek: Number(weekMessages?.total ?? 0),
      documentsReady: Number(docReady?.total ?? 0),
      totalAnalyses: Number(analysisStats?.total ?? 0),
      role,
      isLawyer: role === "lawyer",
      onboardingCompleted: !!profile,
      memberSince: user?.createdAt.toISOString() ?? new Date().toISOString(),
      lastActivityAt: lastSession?.updatedAt?.toISOString() ?? null,
      lawyerProfile: profile
        ? {
            licenseNumber: profile.licenseNumber,
            specialization: profile.specialization,
            barAssociation: profile.barAssociation,
            phone: profile.phone,
            completedAt: profile.completedAt.toISOString(),
          }
        : null,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt.toISOString(),
      })),
      recentDocuments: recentDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      })),
    };
  }
}
