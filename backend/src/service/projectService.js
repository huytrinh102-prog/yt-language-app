import db from "../models/index.cjs";
import cloudinary from "../config/cloudinary.js";
import { Op, Sequelize } from "sequelize";

const create = async (data, userId) => {
  if (!data || !data.name || !data.startDate || !data.endDate) {
    return {
      EM: "Missing required parameters",
      EC: 1,
      DT: "",
    };
  }
  if (isNaN(Date.parse(data.startDate)) || isNaN(Date.parse(data.endDate))) {
    return {
      EM: "Invalid DATE",
      EC: 1,
      DT: "",
    };
  }

  const { name, description, startDate, endDate, avatarUrl, avatarPublicId } =
    data; // status
  const now = new Date();

  let status = "";

  if (new Date(startDate) > now) {
    status = "PENDING";
  } else if (new Date(endDate) < now) {
    status = "COMPLETED";
  } else {
    status = "ACTIVE";
  }
  const DEFAULT_AVATAR =
    "https://media.licdn.com/dms/image/v2/C4E12AQEDHtUmDLS3yQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1520046874939?e=2147483647&v=beta&t=9r5LerPDALfUQW36HYezN-aRfmXdJsWrtjJ-j-VDZAs";
  try {
    const res = await db.Project.create({
      name: name || "NONAME",
      description: description || "",
      startDate: startDate,
      endDate: endDate,
      avatarUrl: avatarUrl || DEFAULT_AVATAR,
      avatarPublicId: avatarPublicId || "",
      status: status,
      createdBy: userId || "",
    });
    if (!res) {
      return {
        EM: "Error from server...",
        EC: 1,
        DT: "",
      };
    }
    return {
      EM: "Create the project success",
      EC: 0,
      DT: res,
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
const read = async (search, filter, userId) => {
  try {
    let whereCondition = {};

    // ================= SEARCH =================
    if (search) {
      const keyword = search.trim().split(" ").filter(Boolean);

      whereCondition = {
        [Op.and]: keyword.map((word) => ({
          [Op.or]: [
            { name: { [Op.like]: `%${word}%` } },
            { description: { [Op.like]: `%${word}%` } },
          ],
        })),
      };
    }
    // ================= FILTER STATUS =================
    if (filter) {
      const f = filter.toUpperCase();

      if (f === "ACTIVE") {
        whereCondition.status = "ACTIVE";
      }

      if (f === "COMPLETED") {
        whereCondition.status = "COMPLETED";
      }

      if (f === "PENDING") {
        whereCondition.status = "PENDING";
      }

      if (f === "MINE") {
        whereCondition.createdBy = userId;
      }
    }
    const data = await db.Project.findAll({
      where: whereCondition,

      attributes: [
        "id",
        "name",
        "description",
        "startDate",
        "endDate",
        "avatarUrl",
        "avatarPublicId",
        "status",
        "createdBy",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM ProjectUser AS up
            WHERE up.projectId = Project.id
          )`),
          "memberCount",
        ],
      ],
    });

    return {
      EM: "Get the project success",
      EC: 0,
      DT: data,
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
const readProjectById = async (projectId) => {
  if (!projectId) {
    return {
      EM: "Missing projectId",
      EC: 1,
      DT: "",
    };
  }

  try {
    const project = await db.Project.findOne({
      where: {
        id: projectId,
      },

      attributes: [
        "id",
        "name",
        "description",
        "startDate",
        "endDate",
        "avatarUrl",
        "status",
        "createdBy",
      ],
      include: [
        {
          model: db.User,
          as: "users",
          attributes: ["id", "username", "email"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!project) {
      return {
        EM: "Project not found",
        EC: 1,
        DT: "",
      };
    }

    return {
      EM: "Get project success",
      EC: 0,
      DT: project,
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
const remove = async (projectId) => {
  try {
    if (!projectId) {
      return { EM: "Project not found", EC: 1, DT: "" };
    }
    const project = await db.Project.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return {
        EM: "Project not found",
        EC: 1,
        DT: "",
      };
    }
    if (project.avatarPublicId && typeof project.avatarPublicId === "string") {
      await cloudinary.uploader.destroy(project.avatarPublicId);
    }
    await db.Project.destroy({
      where: { id: projectId },
    });
    return {
      EM: "Delete project success",
      EC: 0,
      DT: null,
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
const update = async (data, projectId) => {
  const { name, description, startDate, endDate, status } = data;
  try {
    const project = await db.Project.findOne({ where: { id: projectId } });
    if (!project) {
      return { EM: "Projetc not found", EC: 1, DT: "" };
    }
    const oldPublicId = project.avatarPublicId;
    if (
      oldPublicId &&
      data.avatarPublicId &&
      data.avatarPublicId !== oldPublicId
    ) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
    const updateData = {
      name,
      description,
      startDate,
      endDate,
      status,
    };
    if (data.avatarPublicId) {
      updateData.avatarPublicId = data.avatarPublicId;
    }
    if (data.avatarUrl) {
      updateData.avatarUrl = data.avatarUrl;
    }
    await db.Project.update(updateData, {
      where: {
        id: projectId,
      },
    });
    return {
      EM: "Update the project success",
      EC: 0,
      DT: "",
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
export default { create, remove, update, read, readProjectById };
