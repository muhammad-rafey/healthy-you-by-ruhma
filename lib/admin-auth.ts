import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}
