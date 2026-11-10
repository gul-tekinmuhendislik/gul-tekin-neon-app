import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

const envFiles = [
  '.env.production.local',
  '.env.local',
  '.env.development.local',
  '.env.production',
  '.env',
];

for (const envFile of envFiles) {
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
