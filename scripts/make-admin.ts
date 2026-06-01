import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { userService } = await import("../src/services/user.service");

  const [email, password, username] = process.argv.slice(2);

  if (!email) {
    console.log("Usage:");
    console.log("  Create new admin : npx tsx scripts/make-admin.ts <email> <password> [username]");
    console.log("  Promote existing : npx tsx scripts/make-admin.ts <email-or-username>");
    process.exit(1);
  }

  const existing = await userService.findByEmail(email);

  if (existing) {
    await userService.promoteToAdmin(existing.id);
    console.log(`✓ ${existing.email} promoted to ADMIN.`);
    return;
  }

  if (!password) {
    console.error(`No user found for "${email}". To create one, also pass a password.`);
    process.exit(1);
  }

  const user = await userService.createWithPassword({
    email,
    username: username ?? email.split("@")[0],
    password,
    name: username ?? email.split("@")[0],
    role: "ADMIN",
  });

  console.log(`✓ Admin created: ${user.email} (username: ${user.username})`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
