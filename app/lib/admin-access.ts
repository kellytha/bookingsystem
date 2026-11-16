import { auth, currentUser } from "@clerk/nextjs/server";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function roleFromMetadata(metadata: unknown) {
  const role = asRecord(metadata)?.role;
  return typeof role === "string" ? role : null;
}

export function hasAdminRole(sessionClaims: unknown, publicMetadata?: unknown) {
  const claims = asRecord(sessionClaims);
  const claimRole =
    roleFromMetadata(claims?.metadata) ??
    roleFromMetadata(claims?.publicMetadata) ??
    roleFromMetadata(claims?.public_metadata) ??
    roleFromMetadata(publicMetadata);
  return claimRole === "admin" || claimRole === "super_admin";
}

export async function hasAdminAccess() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  if (hasAdminRole(sessionClaims)) return true;
  const user = await currentUser();
  return hasAdminRole(sessionClaims, user?.publicMetadata);
}
