import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/Layouts";
import Home from "../../component/homepage/Homepage";
import Register from "../../auth/Register";
import Login from "../../auth/Login";
import User from "../../component/users/manageUser";
import Roles from "../../component/roles/roles";
import GroupRole from "../../component/roles/roles-groups";
import AdminRoute from "./AdminRoute";
import VideoDetail from "../../component/videos/VideoDetail";
import LanguageLibrary from "../../component/videos/LanguageLibrary";
import Videos from "../../component/videos/Videos";
import Notes from "../../component/notes/Notes";
import Vocabulary from "../../component/vocabulary/Vocabulary";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../../auth/resetPassword/ForgotPassword";
import ResetPassword from "../../auth/resetPassword/ResetPassword";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <LanguageLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos/languages/:languageId"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos/watch/:id"
          element={
            <ProtectedRoute>
              <VideoDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary"
          element={
            <ProtectedRoute>
              <Vocabulary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <User />
            </AdminRoute>
          }
        ></Route>
        <Route
          path="/roles"
          element={
            <AdminRoute>
              <Roles />
            </AdminRoute>
          }
        ></Route>
        <Route
          path="/group-role"
          element={
            <AdminRoute>
              <GroupRole />
            </AdminRoute>
          }
        ></Route>
      </Route>
    </Routes>
  );
}
