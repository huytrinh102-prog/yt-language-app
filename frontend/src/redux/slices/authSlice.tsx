import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id?: number;
  email?: string;
  username: string;
  phone?: string;
  sex?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  groupname?: string;
  Group?: {
    id?: number;
    name?: string;
  };
  roles?: {
    id?: number;
    url?: string;
  }[];
  isAdmin?: boolean;
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
};

type LoginPayload = {
  user: AuthUser;
  access_token: string;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
