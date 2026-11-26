"use server";

import { and, asc, eq, sql, or, exists } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { project, projectMembers, type Project } from "@/db/schema";
import {
  type ActionResult,
  getUserId,
  NOT_FOUND,
  parseTitle,
  UNAUTHORIZED,
} from "./result";

export type ProjectSummary = Project & { canvasCount: number };

export async function getProjects(): Promise<ProjectSummary[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const rows = await db.query.project.findMany({
    where: or(
      eq(project.userId, userId),
      exists(
        db.select().from(projectMembers).where(
          and(
            eq(projectMembers.projectId, project.id),
            eq(projectMembers.userId, userId)
          )
        )
      )
    ),
    orderBy: [asc(project.createdAt)],
    with: { canvases: { columns: { id: true } } },
  });

  return rows.map(({ canvases, ...p }) => ({ ...p, canvasCount: canvases.length }));
}

export async function createProject(
  rawTitle: string,
): Promise<ActionResult<Project>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const parsed = parseTitle(rawTitle, "Пожалуйста, введите название проекта");
  if (!parsed.ok) return parsed;

  const duplicate = await db.query.project.findFirst({
    where: and(
      eq(project.userId, userId),
      sql`lower(${project.title}) = lower(${parsed.title})`,
    ),
  });
  if (duplicate) {
    return { ok: false, error: "Проект с таким названием уже существует" };
  }

  const [created] = await db
    .insert(project)
    .values({ title: parsed.title, userId })
    .returning();

  revalidatePath("/");
  return { ok: true, data: created };
}

export async function renameProject(
  projectId: string,
  rawTitle: string,
): Promise<ActionResult<Project>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const parsed = parseTitle(rawTitle, "Пожалуйста, введите название проекта");
  if (!parsed.ok) return parsed;

  const duplicate = await db.query.project.findFirst({
    where: and(
      eq(project.userId, userId),
      sql`lower(${project.title}) = lower(${parsed.title})`,
      sql`${project.id} <> ${projectId}`,
    ),
  });
  if (duplicate) {
    return { ok: false, error: "Проект с таким названием уже существует" };
  }

  const [updated] = await db
    .update(project)
    .set({ title: parsed.title })
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .returning();
  if (!updated) return { ok: false, error: NOT_FOUND };

  revalidatePath("/");
  revalidatePath(`/project/${projectId}`);
  return { ok: true, data: updated };
}

const MAX_DESCRIPTION_LENGTH = 2000;

export async function updateProjectDescription(
  projectId: string,
  rawDescription: string,
): Promise<ActionResult<{ id: string; description: string }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  if (typeof rawDescription !== "string") {
    return { ok: false, error: "Некорректное описание" };
  }
  const description = rawDescription.trim();
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `Описание не должно превышать ${MAX_DESCRIPTION_LENGTH} символов`,
    };
  }

  const [updated] = await db
    .update(project)
    .set({ description })
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .returning({ id: project.id, description: project.description });
  if (!updated) return { ok: false, error: NOT_FOUND };

  revalidatePath(`/project/${projectId}`);
  return { ok: true, data: updated };
}

export async function deleteProject(
  projectId: string,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const [deleted] = await db
    .delete(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .returning({ id: project.id });
  if (!deleted) return { ok: false, error: NOT_FOUND };

  revalidatePath("/");
  return { ok: true, data: deleted };
}

// ---------- Приглашения ----------

export async function generateInviteToken(projectId: string) {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const owned = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, userId)),
  });

  if (!owned) return { ok: false, error: NOT_FOUND };

  const token = crypto.randomUUID();
  await db.update(project).set({ inviteToken: token }).where(eq(project.id, projectId));

  return { ok: true, data: token };
}

export async function getProjectByToken(token: string) {
  const found = await db.query.project.findFirst({
    where: eq(project.inviteToken, token),
    columns: { id: true, title: true, userId: true },
  });
  return found ?? null;
}

export async function joinProjectByToken(token: string) {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const projectFound = await db.query.project.findFirst({
    where: eq(project.inviteToken, token),
  });

  if (!projectFound) return { ok: false, error: "Ссылка недействительна" };

  const alreadyMember = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectFound.id),
      eq(projectMembers.userId, userId)
    ),
  });

  if (!alreadyMember) {
    await db.insert(projectMembers).values({
      projectId: projectFound.id,
      userId: userId,
    });
  }

  revalidatePath("/");
  return { ok: true, data: projectFound.id };
}


// Проверка, является ли пользователь участником проекта
export async function isProjectMember(projectId: string, userId: string) {
  const member = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ),
  });
  return !!member;
}