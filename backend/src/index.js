import { env } from "./config/env.js";
import { connectDatabase } from "./lib/db.js";
import { ensureAdminUser } from "./utils/bootstrap.js";
import { createApp } from "./app.js";

async function main() {
  await connectDatabase();
  await ensureAdminUser();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
