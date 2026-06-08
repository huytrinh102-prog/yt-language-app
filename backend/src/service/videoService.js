import db from "../models/index.cjs";
import { Op } from "sequelize";
import youtubeService from "./youtubeService.js";

const create = async (data, userId) => {
  try {
    if (!data.youtubeVideoId) {
      return { EM: "Missing youtubeVideoId", EC: 1, DT: "" };
    }
    if (!data.languageId) {
      return { EM: "Please choose a language folder", EC: 1, DT: "" };
    }

    const {
      youtubeVideoId,
      title,
      description,
      thumbnailUrl,
      channelTitle,
      durationSeconds,
      language,
      languageId,
    } = data;
    const normalizedYoutubeVideoId =
      youtubeService.extractYoutubeVideoId(youtubeVideoId);

    const languageFolder = await db.UserLanguage.findOne({
      where: {
        id: languageId,
        userId,
      },
    });

    if (!languageFolder) {
      return { EM: "Language folder not found", EC: 1, DT: "" };
    }

    let youtubeMetadata = {};

    try {
      youtubeMetadata = await youtubeService.getYoutubeMetadata(
        normalizedYoutubeVideoId,
      );
    } catch (error) {
      console.log("Auto YouTube metadata failed:", error.message);
    }

    const [video, created] = await db.Video.findOrCreate({
      where: {
        youtubeVideoId: normalizedYoutubeVideoId,
        languageId,
        createdByUserId: userId,
      },
      defaults: {
        youtubeVideoId: normalizedYoutubeVideoId,
        title: title || youtubeMetadata.title || "",
        description: description || youtubeMetadata.description || "",
        thumbnailUrl: thumbnailUrl || youtubeMetadata.thumbnailUrl || "",
        channelTitle: channelTitle || youtubeMetadata.channelTitle || "",
        durationSeconds: durationSeconds || youtubeMetadata.durationSeconds || 0,
        language:
          language ||
          youtubeMetadata.language ||
          languageFolder.code ||
          languageFolder.name,
        languageId,
        createdByUserId: userId,
      },
    });

    return {
      EM: created ? "Create video success" : "Video already exists",
      EC: 0,
      DT: video,
    };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readById = async (id, userId) => {
  try {
    const video = await db.Video.findOne({
      where: {
        id,
        createdByUserId: userId,
      },
      include: [
        { model: db.UserLanguage, as: "languageFolder" },
        { model: db.Transcript, as: "transcripts" },
        {
          model: db.Note,
          as: "notes",
          where: { userId },
          required: false,
        },
        {
          model: db.VocabularyItem,
          as: "vocabularyItems",
          where: { userId },
          required: false,
        },
        {
          model: db.VideoProgress,
          as: "progress",
          where: { userId },
          required: false,
        },
      ],
      order: [
        [{ model: db.Note, as: "notes" }, "timeSec", "ASC"],
        [
          { model: db.VocabularyItem, as: "vocabularyItems" },
          "createdAt",
          "DESC",
        ],
      ],
    });

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    return { EM: "Get video success", EC: 0, DT: video };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const remove = async (id, userId) => {
  try {
    const video = await db.Video.findOne({
      where: {
        id,
        createdByUserId: userId,
      },
    });

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    await video.destroy();

    return { EM: "Delete video success", EC: 0, DT: "" };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const update = async (data, id, userId) => {
  try {
    const video = await db.Video.findOne({
      where: {
        id,
        createdByUserId: userId,
      },
    });

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    let nextLanguageId = video.languageId;
    let nextLanguage = video.language;

    if (data.languageId !== undefined) {
      const languageFolder = await db.UserLanguage.findOne({
        where: {
          id: data.languageId,
          userId,
        },
      });

      if (!languageFolder) {
        return { EM: "Language folder not found", EC: 1, DT: "" };
      }

      nextLanguageId = data.languageId;
      nextLanguage = data.language || languageFolder.code || languageFolder.name;
    }

    await video.update({
      title: data.title ?? video.title,
      description: data.description ?? video.description,
      thumbnailUrl: data.thumbnailUrl ?? video.thumbnailUrl,
      channelTitle: data.channelTitle ?? video.channelTitle,
      durationSeconds: data.durationSeconds ?? video.durationSeconds,
      language: data.language ?? nextLanguage,
      languageId: nextLanguageId,
    });

    return { EM: "Update video success", EC: 0, DT: video };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const read = async (
  userId,
  page = 1,
  limit = 5,
  search = "",
  sort = "id,desc",
  languageId = "",
) => {
  try {
    const offset = (+page - 1) * +limit;
    const [field, order] = sort.split(",");

    let whereCondition = {
      createdByUserId: userId,
    };
    if (languageId) {
      whereCondition.languageId = languageId;
    }
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { channelTitle: { [Op.like]: `%${search}%` } },
          { youtubeVideoId: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await db.Video.findAndCountAll({
      where: whereCondition,
      include: [{ model: db.UserLanguage, as: "languageFolder" }],
      offset,
      limit: +limit,
      order: [[field || "id", order || "desc"]],
    });

    return {
      EM: "Get videos success",
      EC: 0,
      DT: {
        totalRows: count,
        totalPages: Math.ceil(count / +limit),
        videos: rows,
      },
    };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

export default { create, update, remove, read, readById };
