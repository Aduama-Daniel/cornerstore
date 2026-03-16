import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/database.js';
import { upsertAdmin } from '../services/adminService.js';

dotenv.config();

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node src/scripts/createAdmin.js <email> <password>');
  process.exit(1);
}

async function main() {
  const db = await connectDB();

  try {
    const admin = await upsertAdmin(db, email, password);
    console.log(`Admin upserted for ${admin.email}`);
    console.log(`Password hash: ${admin.passwordHash}`);
  } finally {
    await closeDB();
  }
}

main().catch((error) => {
  console.error('Failed to create admin:', error);
  process.exit(1);
});
