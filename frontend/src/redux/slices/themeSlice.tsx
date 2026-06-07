import { createSlice } from "@reduxjs/toolkit";

type ThemeMode = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
};

const initialState: ThemeState = {
  mode: (localStorage.getItem("theme") as ThemeMode) || "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
