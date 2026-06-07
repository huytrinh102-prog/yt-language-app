import db from "../models/index.cjs";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import crypto from "crypto";
import emailService from "./emailService.js";
//reset password
const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
const forgotPassword = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    return {
      EM: "If this email exists, a reset link has been sent",
      EC: 0,
      DT: "",
    };
  }
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.PasswordResetToken.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await emailService.sendResetPasswordEmail(user.email, resetLink);
  return {
    EM: "If this email exists, a reset link has been sent",
    EC: 0,
    DT: "",
  };
};
const resetPassword = async (token, newPassword) => {
  if (!token) {
    return {
      EM: "Missing reset token",
      EC: 1,
      DT: "",
    };
  }

  if (!newPassword) {
    return {
      EM: "Password is required",
      EC: 1,
      DT: "",
    };
  }
  if (String(newPassword).length < 8) {
    return {
      EM: "Your password must have at least 8 characters",
      EC: 1,
      DT: "",
    };
  }
  const tokenHash = hashResetToken(token);
  const resteToken = await db.PasswordResetToken.findOne({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    include: {
      model: db.User,
      as: "user",
    },
  });
  if (!resteToken?.user) {
    return { EM: "Reset link is invalid or expired", EC: 1, DT: "" };
  }
  const hashPassword = await bcrypt.hash(newPassword, 10);
  await resteToken.user.update({ password: hashPassword });
  await resteToken.update({ usedAt: new Date() });
  return { EM: "Reset password success", EC: 0, DT: "" };
};
const buildUserWithRoles = async (userId) => {
  const userWithRole = await db.User.findOne({
    where: { id: userId },
    attributes: ["id", "email", "username", "avatarUrl"],
    include: {
      model: db.Group,
      attributes: ["id", "name", "description"],
      include: {
        model: db.Role,
        as: "roles", //
        attributes: ["id", "url", "description"],
      },
    },
  });
  const roles =
    userWithRole?.Group?.roles?.map((r) => ({
      id: r.id,
      url: r.url,
    })) || [];

  const isAdmin =
    userWithRole?.Group?.name?.toLowerCase() === "admin" ||
    userWithRole?.email === "admin@gmail.com";

  const userData = {
    id: userWithRole.id,
    email: userWithRole.email,
    username: userWithRole.username,
    groupname: userWithRole?.Group?.name,
    avatarUrl: userWithRole.avatarUrl,
  };

  return {
    userData,
    payload: {
      ...userData,
      roles,
      isAdmin,
    },
  };
};

const issueAccessToken = (payload) => {
  return jwt.sign(payload, process.env.jwtKey, { expiresIn: "15m" });
};
const RefreshByUserId = async (userId) => {
  try {
    const { userData, payload } = await buildUserWithRoles(userId);
    const access_token = issueAccessToken(payload);
    return {
      EC: 0,
      EM: "Refresh success",
      DT: { access_token: access_token, user: userData },
    };
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Refresh failed", DT: "" };
  }
};

const Register = async (rawData, req, res) => {
  //check emai/phone password
  try {
    const { email, phone, password, username } = rawData;
    const isExistEmail = await db.User.findOne({ where: { email: email } });
    const isExistPhone = await db.User.findOne({ where: { phone: phone } });
    if (isExistEmail) {
      return {
        EM: "the email already exists",
        EC: 1,
      };
    }
    if (isExistPhone) {
      return {
        EM: "the phone number already exists",
        EC: 1,
      };
    }

    // hash password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    console.log("check passs", hashPassword);
    // create new user
    const newUser = await db.User.create({
      email: email,
      password: hashPassword,
      username: username,
      phone: phone,
      groupId: 2,
    });
    return { EM: "register success", EC: 0 };
  } catch (error) {
    console.log(error);
    return {
      EM: "Something wrong from server...",
      EC: 1,
    };
  }
};
const Login = async (data) => {
  try {
    const user = await db.User.findOne({
      where: {
        [Op.or]: [
          { email: data.input },
          { phone: data.input },
          { username: data.input },
        ],
      },
    });

    if (!user) {
      return {
        EM: "THE ACCOUNT IS NOT EXIST",
        EC: 1,
        DT: "",
      };
    }

    const checkPassword = await bcrypt.compare(data.password, user.password);

    if (!checkPassword) {
      return {
        EM: "WRONG EMAIL or PASSWORD",
        EC: 1,
        DT: "",
      };
    }

    let access_token = "";
    try {
      const { userData, payload } = await buildUserWithRoles(user.id);
      access_token = issueAccessToken(payload);
      return {
        EM: "Login success",
        EC: 0,
        DT: { access_token: access_token, user: userData },
      };
    } catch (error) {
      console.log(error);
      return {
        EM: "Error from server...",
        EC: 1,
        DT: "",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};
const googleLogin = async (token) => {
  try {
    const res = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    );

    const { email, name } = res.data;
    let user = await db.User.findOne({ where: { email } });

    if (!user) {
      user = await db.User.create({
        email,
        username: name,
        groupId: 2,
      });
    }
    const { userData, payload } = await buildUserWithRoles(user.id);
    const access_token = issueAccessToken(payload);
    return {
      EC: 0,
      EM: "Login success",
      DT: { access_token: access_token, user: userData },
    };
  } catch (error) {
    console.log(error);
    return {
      EC: 1,
      EM: "Google login failed",
    };
  }
};

export default {
  forgotPassword,
  resetPassword,
  Register,
  Login,
  googleLogin,
  RefreshByUserId,
};
