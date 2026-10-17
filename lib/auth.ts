import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { db} from "@/db";

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret) {
  // No hardcoded fallback: a secret committed to a public repo can forge
  // sessions against any deployment that forgets to set its own.
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Set it in your environment before starting the app."
  );
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
});
