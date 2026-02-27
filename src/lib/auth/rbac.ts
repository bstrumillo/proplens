const ROLE_HIERARCHY: Record<string, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  staff: 2,
  viewer: 1,
};

export type Role = "owner" | "admin" | "manager" | "staff" | "viewer";

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

export function requireRole(userRole: Role, requiredRole: Role): void {
  if (!hasPermission(userRole, requiredRole)) {
    throw new Error(
      `Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`
    );
  }
}
