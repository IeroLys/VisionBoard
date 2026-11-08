"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { project, type Project } from "@/db/schema";
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
    where: eq(project.userId, userId),
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

export async function deleteProject(
  projectId: string,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  // Canvases and tasks are removed by ON DELETE CASCADE.
  const [deleted] = await db
    .delete(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .returning({ id: project.id });
  if (!deleted) return { ok: false, error: NOT_FOUND };

  revalidatePath("/");
  return { ok: true, data: deleted };
}
