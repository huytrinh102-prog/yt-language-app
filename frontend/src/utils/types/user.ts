import type { AuthUser } from "../../redux/slices/authSlice";
export type RegisterPayload = {
  email: string;
  password: string;
  username: string;
  phone: string;
};

export type LoginPayload = {
  input: string;
  password: string;
};

export type LoginResponseData = {
  access_token: string;
  user: AuthUser;
};

export type Group = {
  id: number;
  name: string;
  [key: string]: unknown;
};

export type UserFormData = {
  email: string;
  password: string;
  username: string;
  phone: string;
  sex: string;
  groupId: number;
  avatarUrl?: string;
  avatarPublicId?: string;
};

export type UserItem = Omit<UserFormData, "password"> & {
  id: number;
  Group?: Group;
};

export type UsersListData = {
  users: UserItem[];
  totalPages: number;
};

export type CloudinarySignatureData = {
  cloudName?: string;
  cloud_name?: string;
  apiKey?: string;
  api_key?: string;
  timestamp?: number;
  signature?: string;
  folder?: string;
  uploadUrl?: string;
  upload_url?: string;
  [key: string]: unknown;
};

export type CloudinaryUploadResponse = {
  secure_url?: string;
  secureUrl?: string;
  public_id?: string;
  publicId?: string;
};
