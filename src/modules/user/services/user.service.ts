import type { User } from "../types/user.types";
import { UserRole } from "../types/user.types";

export function formatUserName(user: User): string {
  return user.name || user.email.split("@")[0];
}

export function getInitials(user: User): string {
  const name = formatUserName(user);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}
