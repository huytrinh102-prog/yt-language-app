import express from "express";
import apiController from "../controller/apiController.js";
import userController from "../controller/userController.js";
import { checkPermission, checkToken } from "../middleware/jwt-action.js";
import rolesController from "../controller/rolesController.js";
import GroupRoleController from "../controller/GroupRoleController.js";
import videoController from "../controller/videoContreoller.js";
import languageController from "../controller/languageController.js";
import learningController from "../controller/learningController.js";
const router = express.Router();
/**
 * @param {*} app :express appß
 */
const initApiRoutes = (app) => {
  // puclic
  router.post("/login", apiController.handleLogin);
  router.post("/register", apiController.handleRegister);
  router.post("/auth/google", apiController.handleLoginGoogle);
  router.post("/refresh-token", apiController.handleRefreshToken);
  router.post("/logout", apiController.handleLogout);
  router.post("/forgot-password", apiController.handleForgotPassword);
  router.post("/reset-password", apiController.handleResetPassword);

  // CHECK TOKEN
  router.use(checkToken);
  router.get("/account", userController.getAccountData);
  router.post("/cloudinary/sign-avatar", userController.userAvatar);

  // user language folders
  router.post("/languages", languageController.createLanguage);
  router.get("/languages", languageController.getLanguages);
  router.get("/languages/:id", languageController.getLanguageById);
  router.put("/languages/:id", languageController.updateLanguage);
  router.delete("/languages/:id", languageController.deleteLanguage);

  // video
  router.post("/videos", videoController.createVideo);
  router.get("/videos", videoController.getVideo);
  router.get("/videos/:id", videoController.getVideoById);
  router.delete("/videos/:id", videoController.deleteVideo);
  router.put("/videos/:id", videoController.updateVideo);

  // video learning tools
  router.get("/youtube/metadata", learningController.getYoutubeMetadata);
  router.post(
    "/videos/:videoId/sync-youtube",
    learningController.syncYoutubeMetadata,
  );
  router.post(
    "/videos/:videoId/import-transcript",
    learningController.importTranscript,
  );
  router.post(
    "/videos/:videoId/transcripts",
    learningController.saveManualTranscript,
  );
  router.get("/videos/:videoId/transcripts", learningController.getTranscripts);
  router.get("/videos/:videoId/notes", learningController.getNotes);
  router.post("/videos/:videoId/notes", learningController.createNote);
  router.get("/notes", learningController.getAllNotes);
  router.put("/notes/:id", learningController.updateNote);
  router.delete("/notes/:id", learningController.deleteNote);
  router.get("/videos/:videoId/vocabulary", learningController.getVocabulary);
  router.post(
    "/videos/:videoId/vocabulary",
    learningController.createVocabulary,
  );
  router.get("/vocabulary", learningController.getAllVocabulary);
  router.put("/vocabulary/:id", learningController.updateVocabulary);
  router.delete("/vocabulary/:id", learningController.deleteVocabulary);
  router.get("/videos/:videoId/progress", learningController.getProgress);
  router.put("/videos/:videoId/progress", learningController.updateProgress);

  // PERMISSION
  router.use(checkPermission);
  // roles
  router.post("/roles", rolesController.createRoles);
  router.get("/roles", rolesController.getRoles);
  router.delete("/roles/:id", rolesController.deleteRole);
  router.put("/roles/:id", rolesController.updateRole);

  // crud user
  router.get("/users", userController.getUsers);
  router.post("/users", userController.creatUser);
  router.delete("/users/:id", userController.deleteUser);
  router.put("/users/:id", userController.updateUser);
  // group-role
  router.get("/group", userController.getGroups);
  router.get("/group-role/read", GroupRoleController.getAllRoles);
  router.get("/role-by-group/:id", GroupRoleController.getRolesByGroup);
  router.post("/group-role/update", GroupRoleController.updateRolesbyGroup);
  return app.use("/api/v1/", router);
};
export default initApiRoutes;
