"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { canvas, project, task, type Canvas, type Task } from "@/db/schema";
import {
  type ActionResult,
  getUserId,
  NOT_FOUND,
  parseTitle,
  UNAUTHORIZED,
} from "./result";

export type CanvasWithTasks = Canvas & { tasks: Task[] };

async function ownsProject(userId: string, projectId: string) {
  const found = await db.query.project.findFirst({
    columns: { id: true },
    where: and(eq(project.id, projectId), eq(project.userId, userId)),
  });
  return Boolean(found);
}

/** Returns the project with its canvases and their tasks, or null if the user doesn't own it. */
export async function getProjectWithCanvases(projectId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const found = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, userId)),
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
  if (!(await ownsProject(userId, projectId))) {
    return { ok: false, error: NOT_FOUND };
  }

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

  const owned = await db
    .select({ id: canvas.id, projectId: canvas.projectId })
    .from(canvas)
    .innerJoin(project, eq(canvas.projectId, project.id))
    .where(and(eq(canvas.id, canvasId), eq(project.userId, userId)))
    .limit(1);
  if (owned.length === 0) return { ok: false, error: NOT_FOUND };

  await db.delete(canvas).where(eq(canvas.id, canvasId));

  revalidatePath(`/project/${owned[0].projectId}`);
  return { ok: true, data: { id: canvasId } };
}

/** Returns the canvas with its project and tasks, or null if the user doesn't own it. */
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
  if (!found || found.project.userId !== userId) return null;
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

  const owned = await db
    .select({ projectId: canvas.projectId })
    .from(canvas)
    .innerJoin(project, eq(canvas.projectId, project.id))
    .where(and(eq(canvas.id, canvasId), eq(project.userId, userId)))
    .limit(1);
  if (owned.length === 0) return { ok: false, error: NOT_FOUND };
  const { projectId } = owned[0];

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
