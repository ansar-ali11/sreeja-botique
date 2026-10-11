import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ----------------------------------------
// Find the project root
// ----------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Service account JSON is located at:
// C:\botique\firebase-service-account.json
const serviceAccountPath = join(
  __dirname,
  "..",
  "firebase-service-account.json",
);

// ----------------------------------------
// Read service account
// ----------------------------------------

let serviceAccount;

try {
  serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, "utf8"),
  );
} catch (error) {
  console.error(
    "Could not read firebase-service-account.json",
  );

  console.error(
    "Make sure the file exists at:",
  );

  console.error(serviceAccountPath);

  process.exit(1);
}

// ----------------------------------------
// Get email from command line
// ----------------------------------------

const email = process.argv[2];

if (
  !email ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
) {
  console.error(
    "Usage: node scripts/grant-admin.mjs verified-owner@example.com",
  );

  process.exit(2);
}

// ----------------------------------------
// Initialize Firebase Admin
// ----------------------------------------

initializeApp({
  credential: cert(serviceAccount),
  projectId: "sreejas-bridal-boutique",
});

const auth = getAuth();

// ----------------------------------------
// Find user
// ----------------------------------------

let user;

try {
  user = await auth.getUserByEmail(email);
} catch (error) {
  console.error(
    `Could not find Firebase Authentication user: ${email}`,
  );

  console.error(error);

  process.exit(1);
}

// ----------------------------------------
// Make sure email is verified
// ----------------------------------------

if (!user.emailVerified) {
  console.error(
    `The email ${email} is not verified.`,
  );

  console.error(
    "Verify the email through Firebase Authentication first.",
  );

  process.exit(1);
}

// ----------------------------------------
// Grant admin claim
// ----------------------------------------

await auth.setCustomUserClaims(user.uid, {
  ...(user.customClaims ?? {}),
  admin: true,
});

console.log("");
console.log(
  `Admin claim granted successfully to ${email}.`,
);
console.log("");
console.log(
  "Sign out of the website and sign in again",
);
console.log(
  "to refresh the Firebase ID token.",
);
console.log("");