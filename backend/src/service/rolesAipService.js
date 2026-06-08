import db from "../models/index.cjs";
import { Op, where } from "sequelize";
const create = async (data) => {
  try {
    // isvalid
    const isExistUrl = await db.Role.findOne({
      where: { url: data.url },
    });
    if (isExistUrl) {
      return {
        EM: "the Role already exists",
        EC: 1,
      };
    }

    const res = await db.Role.create({
      url: data.url,
      desciption: data.description,
    });
    console.log(res);
    return { EM: "create a new role success", EC: 0, DT: "" };
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
    let whereCondition = {};
    if (search) {
      const keyword = search.trim().split(" ").filter(Boolean);
      whereCondition = {
        [Op.and]: keyword.map((word) => ({
          [Op.or]: [
            { url: { [Op.like]: `%${word}%` } },
            { description: { [Op.like]: `%${word}%` } },
          ],
        })),
      };
    }
    // order
    let order = [["id", "DESC"]];
    if (sort) {
      const [field, direction] = sort.split(",");
      order = [[field, direction.toUpperCase()]];
    }
    const offset = (page - 1) * limit;
    let data = await db.Role.findAndCountAll({
      where: whereCondition,
      order: order,
      limit: +limit,
      offset: +offset,
      attributes: ["id", "url", "description"],
      include: [
        {
          model: db.Group,
          as: "groups",
          attributes: ["name", "description"],
          through: { attributes: [] },
        },
      ],
    });
    if (data) {
      return {
        EM: "get roles succcess",
        EC: "0",
        DT: {
          roles: data.rows,
          totalRoles: data.count,
          totalPages: Math.ceil(data.count / limit),
          currentPage: +page,
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
    console.log("🔥 ROLE READ ERROR:", error);
    console.log("🔥 DETAIL:", error?.original || error);
    return {
      EM: error.message,
      EC: 1,
      DT: "",
    };
  }
};
const remove = async (id) => {
  try {
    const removeRole = await db.Role.destroy({
      where: {
        id: id,
      },
    });
    if (removeRole > 0) {
      return {
        EM: "Delete the role success",
        EC: 0,
        DT: removeRole,
      };
    }
    {
      return {
        EM: "Something wrongs from server...",
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
    const { url, description } = data;
    const isExistUrl = await db.Role.findOne({
      where: {
        url: url,
        id: {
          [Op.ne]: id, // ❗ không tính chính nó
        },
      },
    });
    if (isExistUrl) {
      return {
        EM: "the roles already exists",
        EC: 1,
      };
    }
    if (!url) {
      return {
        EM: "please fill the roles",
        EC: 1,
      };
    }
    const updateRole = await db.Role.update(
      {
        url: url,
        description: description,
      },
      {
        where: {
          id: id,
        },
      },
    );
    if (updateRole === 0) {
      return {
        EM: "not found the role",
        EC: 1,
      };
    }
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
export default { create, read, remove, update };
