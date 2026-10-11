import { getFirebase } from "./firebase";

const BACKEND_URL =
  import.meta.env["VITE_BACKEND_URL"]|| "http://localhost:3000";

export async function backendRequest<T>(
  path: string,
  body?: unknown
): Promise<T> {
  const { auth } = getFirebase();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in before continuing.");
  }

  const token = await user.getIdToken();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "The request failed.");
  }

  return result as T;
}
