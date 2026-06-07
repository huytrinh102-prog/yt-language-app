import express from "express";
import homeController from "../controller/homeController.js";
import apiController from "../controller/apiController.js";
const router = express.Router();
/**
 * @param {*} app :express app
 */
const initWebRoutes = (app) => {
  router.get("/", homeController.handleHelloWorld);
  router.get("/user", homeController.handleUserPage);
  router.post("/user/create-user", homeController.handleCreateNewUser);
  router.post("/user/delete-user/:id", homeController.handleDeleteUser);
  router.get("/user/update-user/:id", homeController.getUpdateUser);
  router.post("/user/update-user/:id", homeController.handleUpdateUser);
  router.get("/test-api", apiController.testApi);

  return app.use("/", router);
};
export default initWebRoutes;
