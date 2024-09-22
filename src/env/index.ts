import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
});

const treatment = envSchema.safeParse(process.env);

if (!treatment.success) {
  console.error("Invalid environment variables", treatment.error);
  throw new Error("Invalid environment variables");
}

export const env = treatment.data;
