import { Pool } from "pg";

const connectionString: string =
  process.env.DATABASE_URL ||
  "d";

export const pool = new Pool({
  connectionString,
});
