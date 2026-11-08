import { getServerSession } from "@/lib/server/session";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const MAX_TITLE_LENGTH = 100;

export async function getUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}

/** Trims and validates a user-supplied title. Returns an error message or the clean title. */
export function parseTitle(
  raw: unknown,
  emptyMessage: string,
): { ok: true; title: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: emptyMessage };
  const title = raw.trim();
  if (!title) return { ok: false, error: emptyMessage };
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Название не должно превышать ${MAX_TITLE_LENGTH} символов`,
    };
  }
  return { ok: true, title };
}

export const UNAUTHORIZED = "Необходимо войти в систему";
export const NOT_FOUND = "Не найдено";
