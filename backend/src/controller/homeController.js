import userService from "../service/userService.js";
const handleHelloWorld = (req, res) => {
  return res.render("home.ejs");
};
const handleUserPage = async (req, res) => {
  const userlist = await userService.getListUsers();
  // console.log("check list user", userlist);
  return res.render("user.ejs", { userlist });
};
const handleCreateNewUser = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let username = req.body.username;
  await userService.CreateNewUser(email, password, username);
  return res.redirect("/user");
};
const handleDeleteUser = async (req, res) => {
  const userId = req.params.id;
  await userService.DeleteUser(userId);
  return res.redirect("/user");
};
const getUpdateUser = async (req, res) => {
  let userId = req.params.id;
  let userData = [];
  let user = await userService.getUserById(userId);
  userData = user;
  console.log("check userdata ", userData);
  return res.render("updateUser.ejs", { userData });
};

const handleUpdateUser = async (req, res) => {
  let id = req.params.id;
  let { email, username } = req.body;
  await userService.UpdateUser(email, username, id);
  console.log("checkid", id);
  return res.redirect("/user");
};

export default {
  handleCreateNewUser,
  handleHelloWorld,
  handleUserPage,
  handleUpdateUser,
  handleDeleteUser,
  getUpdateUser,
};
