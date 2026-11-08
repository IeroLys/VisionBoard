"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { canvas, project, task, type Task } from "@/db/schema";
import {
  type ActionResult,
  getUserId,
  NOT_FOUND,
  parseTitle,
  UNAUTHORIZED,
} from "./result";

/** Returns the canvas's projectId if the user owns it, otherwise null. */
async function ownedCanvasProjectId(userId: string, canvasId: string) {
  const rows = await db
    .select({ projectId: canvas.projectId })
    .from(canvas)
    .innerJoin(project, eq(canvas.projectId, project.id))
    .where(and(eq(canvas.id, canvasId), eq(project.userId, userId)))
    .limit(1);
  return rows[0]?.projectId ?? null;
}

/** Returns the task with its projectId if the user owns it, otherwise null. */
async function ownedTask(userId: string, taskId: string) {
  const rows = await db
    .select({ task, projectId: project.id })
    .from(task)
    .innerJoin(canvas, eq(task.canvasId, canvas.id))
    .innerJoin(project, eq(canvas.projectId, project.id))
    .where(and(eq(task.id, taskId), eq(project.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTask(
  canvasId: string,
  rawTitle: string,
): Promise<ActionResult<Task>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const projectId = await ownedCanvasProjectId(userId, canvasId);
  if (!projectId) return { ok: false, error: NOT_FOUND };

  const parsed = parseTitle(rawTitle, "Пожалуйста, введите название задачи");
  if (!parsed.ok) return parsed;

  const [created] = await db
    .insert(task)
    .values({ title: parsed.title, canvasId })
    .returning();

  revalidatePath(`/project/${projectId}`);
  return { ok: true, data: created };
}

export async function setTaskCompleted(
  taskId: string,
  completed: boolean,
): Promise<ActionResult<Task>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const owned = await ownedTask(userId, taskId);
  if (!owned) return { ok: false, error: NOT_FOUND };

  const [updated] = await db
    .update(task)
    .set({ completed })
    .where(eq(task.id, taskId))
    .returning();

  revalidatePath(`/project/${owned.projectId}`);
  return { ok: true, data: updated };
}

export async function deleteTask(
  taskId: string,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const owned = await ownedTask(userId, taskId);
  if (!owned) return { ok: false, error: NOT_FOUND };

  await db.delete(task).where(eq(task.id, taskId));

  revalidatePath(`/project/${owned.projectId}`);
  return { ok: true, data: { id: taskId } };
}
