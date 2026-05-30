import path from "path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: path.join(process.cwd(), ".env.local") });

export default defineConfig({
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
