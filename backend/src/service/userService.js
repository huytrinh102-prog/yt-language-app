import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import db from "../models/index.cjs";

const saltRounds = 10;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "jwt",
});

const CreateNewUser = async (email, password, username) => {
  const hashPassword = await bcrypt.hash(password, saltRounds);
  const newUser = await db.User.create({
    email: email,
    password: hashPassword,
    username: username,
  });

  return newUser;
};
const getListUsers = async () => {
  const newuser = await db.User.findAll({
    where: { id: 1 },
    include: {
      model: db.Group,
    },
    raw: true,
    nest: true,
  });
  console.log("check new us", newuser);
  const users = await db.User.findAll();

  // const [rows] = await pool.execute("SELECT * FROM users");
  return users;
};
const DeleteUser = async (id) => {
  const rows = await db.User.destroy({
    where: { id: id },
  });
  // const [rows] = await pool.execute("DELETE FROM users WHERE id=?", [id]);
  return rows;
};
const UpdateUser = async (email, username, id) => {
  await db.User.update(
    { email: email, username: username },
    {
      where: {
        id: id,
      },
    },
  );
  // const [rows] = await pool.execute(
  //   " UPDATE users SET email = ?,username = ? WHERE id=?",
  //   [email, username, id],
  // );
};
const getUserById = async (id) => {
  const user = await db.User.findOne({
    where: {
      id: id,
    },
  });

  if (user === null) {
    console.log("Not found!");
  } else {
    console.log(user.username); // 'johndoe'
  }
  // const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  return user;
};

export default {
  CreateNewUser,
  getListUsers,
  DeleteUser,
  UpdateUser,
  getUserById,
};
