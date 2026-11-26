"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { canvas, project, projectMembers, task, type Canvas, type Task } from "@/db/schema";
import {
  type ActionResult,
  getUserId,
  NOT_FOUND,
  parseTitle,
  UNAUTHORIZED,
} from "./result";

export type CanvasWithTasks = Canvas & { tasks: Task[] };

async function hasAccessToProject(userId: string, projectId: string) {
  const found = await db.query.project.findFirst({
    columns: { id: true, userId: true },
    where: eq(project.id, projectId),
  });

  if (!found) return false;
  if (found.userId === userId) return true;

  const member = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ),
  });

  return !!member;
}

export async function getProjectWithCanvases(projectId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) return null;

  const found = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      canvases: {
        orderBy: [asc(canvas.createdAt)],
        with: { tasks: { orderBy: [asc(task.createdAt)] } },
      },
    },
  });
  return found ?? null;
}

export async function createCanvas(
  projectId: string,
  rawTitle: string,
): Promise<ActionResult<CanvasWithTasks>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };
  
  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) return { ok: false, error: NOT_FOUND };

  const parsed = parseTitle(rawTitle, "Пожалуйста, введите название холста");
  if (!parsed.ok) return parsed;

  const duplicate = await db.query.canvas.findFirst({
    where: and(
      eq(canvas.projectId, projectId),
      sql`lower(${canvas.title}) = lower(${parsed.title})`,
    ),
  });
  if (duplicate) {
    return { ok: false, error: "Холст с таким названием уже существует" };
  }

  const [created] = await db
    .insert(canvas)
    .values({ title: parsed.title, projectId })
    .returning();

  revalidatePath(`/project/${projectId}`);
  return { ok: true, data: { ...created, tasks: [] } };
}

export async function deleteCanvas(
  canvasId: string,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const found = await db.query.canvas.findFirst({
    where: eq(canvas.id, canvasId),
    columns: { projectId: true },
  });
  if (!found) return { ok: false, error: NOT_FOUND };

  const hasAccess = await hasAccessToProject(userId, found.projectId);
  if (!hasAccess) return { ok: false, error: NOT_FOUND };

  await db.delete(canvas).where(eq(canvas.id, canvasId));

  revalidatePath(`/project/${found.projectId}`);
  return { ok: true, data: { id: canvasId } };
}

export async function getCanvas(canvasId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const found = await db.query.canvas.findFirst({
    where: eq(canvas.id, canvasId),
    with: {
      project: { columns: { id: true, title: true, userId: true } },
      tasks: { orderBy: [asc(task.createdAt)] },
    },
  });
  if (!found) return null;

  const hasAccess = await hasAccessToProject(userId, found.project.id);
  if (!hasAccess) return null;

  return found;
}

export async function renameCanvas(
  canvasId: string,
  rawTitle: string,
): Promise<ActionResult<Canvas>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const parsed = parseTitle(rawTitle, "Пожалуйста, введите название холста");
  if (!parsed.ok) return parsed;

  const found = await db.query.canvas.findFirst({
    where: eq(canvas.id, canvasId),
    columns: { projectId: true },
  });
  if (!found) return { ok: false, error: NOT_FOUND };

  const hasAccess = await hasAccessToProject(userId, found.projectId);
  if (!hasAccess) return { ok: false, error: NOT_FOUND };

  const { projectId } = found;

  const duplicate = await db.query.canvas.findFirst({
    where: and(
      eq(canvas.projectId, projectId),
      sql`lower(${canvas.title}) = lower(${parsed.title})`,
      sql`${canvas.id} <> ${canvasId}`,
    ),
  });
  if (duplicate) {
    return { ok: false, error: "Холст с таким названием уже существует" };
  }

  const [updated] = await db
    .update(canvas)
    .set({ title: parsed.title })
    .where(eq(canvas.id, canvasId))
    .returning();

  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/canvas/${canvasId}`);
  return { ok: true, data: updated };
}