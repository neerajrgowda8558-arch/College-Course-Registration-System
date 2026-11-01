
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// Load the local environment configuration.
const envPath = path.join(__dirname, "..", ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local file.");
  process.exit(1);
}

process.loadEnvFile(envPath);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const role = (await ask("Account role (admin/student): "))
    .trim()
    .toLowerCase();

  if (!["admin", "student"].includes(role)) {
    throw new Error("Role must be admin or student.");
  }

  const username = (await ask("Username: ")).trim();
  const password = await ask("Password (visible while typing): ");

  if (!username || password.length < 12) {
    throw new Error("Username required and password must have at least 12 characters.");
  }

  let studentId = null;

  if (role === "student") {
    studentId = (await ask("Existing student ID: ")).trim();

    if (!studentId) {
      throw new Error("Student ID is required.");
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO app_users (username, password_hash, role, student_id)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, username, role, student_id`,
    [username, passwordHash, role, studentId]
  );

  console.log("Account created:", result.rows[0]);
}

main()
  .catch((error) => {
    console.error("Setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await pool.end();
  });
