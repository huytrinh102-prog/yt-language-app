import db from "../models/index.cjs";

const create = async (data, userId) => {
  try {
    if (!data.name) {
      return { EM: "Missing language name", EC: 1, DT: "" };
    }

    const [language, created] = await db.UserLanguage.findOrCreate({
      where: {
        userId,
        name: data.name,
      },
      defaults: {
        userId,
        name: data.name,
        code: data.code || "",
        description: data.description || "",
        color: data.color || "",
      },
    });

    return {
      EM: created ? "Create language success" : "Language already exists",
      EC: 0,
      DT: language,
    };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const read = async (userId) => {
  try {
    const languages = await db.UserLanguage.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.Video,
          as: "videos",
          attributes: ["id"],
        },
      ],
    });

    return { EM: "Get languages success", EC: 0, DT: languages };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readById = async (id, userId) => {
  try {
    const language = await db.UserLanguage.findOne({
      where: { id, userId },
    });

    if (!language) {
      return { EM: "Language not found", EC: 1, DT: "" };
    }

    return { EM: "Get language success", EC: 0, DT: language };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const update = async (data, id, userId) => {
  try {
    const language = await db.UserLanguage.findOne({
      where: { id, userId },
    });

    if (!language) {
      return { EM: "Language not found", EC: 1, DT: "" };
    }

    await language.update({
      name: data.name ?? language.name,
      code: data.code ?? language.code,
      description: data.description ?? language.description,
      color: data.color ?? language.color,
    });

    return { EM: "Update language success", EC: 0, DT: language };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const remove = async (id, userId) => {
  try {
    const language = await db.UserLanguage.findOne({
      where: { id, userId },
    });

    if (!language) {
      return { EM: "Language not found", EC: 1, DT: "" };
    }

    const videoCount = await db.Video.count({
      where: {
        languageId: id,
        createdByUserId: userId,
      },
    });

    if (videoCount > 0) {
      return {
        EM: "Please delete or move videos before deleting this language",
        EC: 1,
        DT: "",
      };
    }

    await language.destroy();

    return { EM: "Delete language success", EC: 0, DT: "" };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

export default { create, read, readById, update, remove };
