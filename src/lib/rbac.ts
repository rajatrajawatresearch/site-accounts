import type { Role } from "@/db/schema";

export const PERMISSIONS = {
  "entries.read": ["admin", "manager", "viewer"],
  "entries.write": ["admin", "manager"],
  "masters.write": ["admin", "manager"],
  "users.manage": ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined, perm: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[perm] as readonly Role[]).includes(role);
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  viewer: "Viewer",
};
