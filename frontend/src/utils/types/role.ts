export type Role = {
  id: number;
  url: string;
  description: string;
};
export type RoleFormData = {
  url: string;
  description: string;
};

export type RolesListData = {
  roles: Role[];
  totalPages: number;
};
export type UpdateRolesByGroupPayload = {
  groupId: number;
  roleId: number[];
};
