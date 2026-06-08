import db from "../models/index.cjs";
import bcrypt from "bcrypt";
const saltRounds = 10;
import { Op, where } from "sequelize";
import cloudinary from "../config/cloudinary.js";

const buildAccountData = async (userId) => {
  const user = await db.User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "email",
      "username",
      "phone",
      "sex",
      "avatarUrl",
      "avatarPublicId",
    ],
    include: [
      {
        association: db.User.associations.Group,
        attributes: ["id", "name", "description"],
        include: [
          {
            association: db.Group.associations.roles,
            attributes: ["id", "url", "description"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  if (!user) return null;

  const plainUser = user.get({ plain: true });
  const roles =
    plainUser.Group?.roles?.map((role) => ({
      id: role.id,
      url: role.url,
    })) || [];
  const groupname = plainUser.Group?.name;
  const isAdmin =
    String(groupname || "").toLowerCase() === "admin" ||
    plainUser.email === "admin@gmail.com";

  return {
    ...plainUser,
    groupname,
    roles,
    isAdmin,
  };
};

const getAccountProfile = async (userId) => {
  try {
    const user = await buildAccountData(userId);

    if (!user) {
      return {
        EM: "User not found",
        EC: 1,
        DT: "",
      };
    }

    return {
      EM: "get Account Data succedds",
      EC: 0,
      DT: user,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};

const read = async (page, limit, search, sort) => {
  try {
    // /condition
    let whereCondition = {};
    if (search) {
      const keyword = search.trim().split(" ").filter(Boolean);
      whereCondition = {
        [Op.and]: keyword.map((word) => ({
          [Op.or]: [
            { email: { [Op.like]: `%${word}%` } },
            { username: { [Op.like]: `%${word}%` } },
          ],
        })),
      };
    }
    // order (avoid invalid fields causing Sequelize to generate unexpected joins)
    const allowedSortFields = new Set([
      "id",
      "username",
      "email",
      "phone",
      "sex",
      "createdAt",
      "updatedAt",
    ]);
    let order = [["id", "DESC"]];
    if (sort) {
      const [rawField, rawDirection] = String(sort).split(",");
      const field = String(rawField || "").trim();
      const direction = String(rawDirection || "")
        .trim()
        .toUpperCase();
      if (
        allowedSortFields.has(field) &&
        (direction === "ASC" || direction === "DESC")
      ) {
        order = [[field, direction]];
      }
    }
    const options = {
      where: whereCondition,
      order,
      attributes: [
        "id",
        "username",
        "email",
        "phone",
        "sex",
        "avatarUrl",
        "avatarPublicId",
      ],
      include: [
        {
          association: db.User.associations.Group,
          attributes: ["id", "name", "description"],
        },
      ],
    };
    const safeLimit = Number(limit);
    const safePage = Number(page);

    const hasPagination =
      Number.isInteger(safeLimit) &&
      safeLimit > 0 &&
      Number.isInteger(safePage) &&
      safePage > 0;

    if (hasPagination) {
      options.limit = safeLimit;
      options.offset = (safePage - 1) * safeLimit;
    }
    let data = await db.User.findAndCountAll(options);
    if (data) {
      return {
        EM: "get users succcess",
        EC: "0",
        DT: {
          users: data.rows,
          totalUsers: data.count,
          totalPages: Number.isFinite(safeLimit)
            ? Math.ceil(data.count / safeLimit)
            : 1,
          currentPage: Number.isFinite(safePage) ? safePage : 1,
        },
      };
    }
    {
      return {
        EM: "Something wrongs from server...",
        EC: "1",
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
const create = async (data) => {
  try {
    // isvalid
    if (!data?.email) {
      return {
        EM: "Email is required",
        EC: 1,
      };
    }

    if (!data?.phone) {
      return {
        EM: "Phone is required",
        EC: 1,
      };
    }
    console.log("checkemial", data);
    const isExistEmail = await db.User.findOne({
      where: { email: data.email },
    });
    const isExistPhone = await db.User.findOne({
      where: { phone: data.phone },
    });
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
    const DEFAULT_AVATAR =
      "https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper.png";
    // hass password
    const hashPassword = await bcrypt.hash(data.password, saltRounds);
    const res = await db.User.create({
      email: data.email,
      password: hashPassword,
      username: data.username,
      sex: data.sex,
      groupId: data.groupId,
      phone: data.phone,
      avatarUrl: data.avatarUrl || DEFAULT_AVATAR,
      avatarPublicId: data.avatarPublicId || "",
    });
    console.log(res);
    return { EM: "register success", EC: 0 };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};
const remove = async (id) => {
  try {
    const user = await db.User.findOne({ where: { id: id } });

    if (user) {
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }
      await db.User.destroy({
        where: {
          id: id,
        },
      });
      return {
        EM: "Delete the user success",
        EC: 0,
        DT: { id: user.id },
      };
    }
    {
      return {
        EM: "User not found",
        EC: 1,
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
const update = async (data, id) => {
  try {
    const { email, username, phone, sex, groupId } = data;
    const user = await db.User.findOne({ where: { id } });
    const oldPublicId = user.avatarPublicId;

    // 🔥 新＝＞古いを消す
    if (
      data.avatarPublicId &&
      oldPublicId &&
      data.avatarPublicId !== oldPublicId
    ) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
    const updateData = {
      email,
      username,
      phone,
      sex,
      groupId,
    };

    // chỉ update khi có gửi lên
    if (data.avatarUrl) {
      updateData.avatarUrl = data.avatarUrl;
    }
    if (data.avatarPublicId) {
      updateData.avatarPublicId = data.avatarPublicId;
    }

    const isExistPhone = await db.User.findOne({
      where: {
        phone: phone,
        id: { [Op.ne]: id }, // ❗ loại trừ chính nó
      },
    });
    if (isExistPhone) {
      return {
        EM: "the phone number already exists",
        EC: 1,
      };
    }
    const updateUser = await db.User.update(updateData, {
      where: {
        id: id,
      },
    });
    return { EM: "update success", EC: 0 };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};

const updateProfile = async (data, userId) => {
  try {
    const { username, phone, sex } = data;

    if (!phone || String(phone).length < 8) {
      return {
        EM: "Your phone number must have at least 8 digits",
        EC: 1,
        DT: "",
      };
    }

    const user = await db.User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        EM: "User not found",
        EC: 1,
        DT: "",
      };
    }

    const isExistPhone = await db.User.findOne({
      where: {
        phone,
        id: { [Op.ne]: userId },
      },
    });

    if (isExistPhone) {
      return {
        EM: "the phone number already exists",
        EC: 1,
        DT: "",
      };
    }

    if (
      data.avatarPublicId &&
      user.avatarPublicId &&
      data.avatarPublicId !== user.avatarPublicId
    ) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    const updateData = {
      username,
      phone,
      sex,
    };

    if (data.avatarUrl) {
      updateData.avatarUrl = data.avatarUrl;
    }

    if (data.avatarPublicId) {
      updateData.avatarPublicId = data.avatarPublicId;
    }

    await user.update(updateData);

    const updatedUser = await buildAccountData(userId);

    return { EM: "update profile success", EC: 0, DT: updatedUser };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};

const getGroups = async () => {
  try {
    const data = await db.Group.findAll({
      attributes: ["id", "name", "description"],
      order: [["id", "ASC"]],
    });
    if (data) {
      return {
        EM: "Get Groups succecss...",
        EC: 0,
        DT: data,
      };
    }
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

export {
  read,
  remove,
  create,
  update,
  updateProfile,
  getAccountProfile,
  getGroups,
};
