import type { AuthUser } from "../redux/slices/authSlice";

export const isAdminUser = (user: AuthUser | null) => {
  if (!user) return false;

  const groupName = String(user.groupname || user.Group?.name || "")
    .trim()
    .toLowerCase();

  return user.isAdmin === true || groupName === "admin" || user.email === "admin@gmail.com";
};
