import learningService from "../service/learningService.js";

const send = (res, data) => {
  return res.status(200).json({
    EM: data.EM,
    EC: data.EC,
    DT: data.DT,
  });
};

const getYoutubeMetadata = async (req, res) => {
  try {
    const data = await learningService.getYoutubeMetadata(
      req.query.url || req.query.videoId,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const syncYoutubeMetadata = async (req, res) => {
  try {
    const data = await learningService.syncYoutubeMetadata(
      req.params.videoId,
      req.user.id,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const importTranscript = async (req, res) => {
  try {
    const data = await learningService.importTranscript(
      req.params.videoId,
      req.user.id,
      req.body.language,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const saveManualTranscript = async (req, res) => {
  try {
    const data = await learningService.saveManualTranscript(
      req.params.videoId,
      req.user.id,
      req.body,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getTranscripts = async (req, res) => {
  try {
    const data = await learningService.readTranscripts(
      req.params.videoId,
      req.user.id,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getNotes = async (req, res) => {
  try {
    const data = await learningService.readNotes(req.params.videoId, req.user.id);
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const data = await learningService.readAllNotes(
      req.user.id,
      req.query.page || 1,
      req.query.limit || 10,
      req.query.search || "",
      req.query.sort || "createdAt,desc",
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const createNote = async (req, res) => {
  try {
    const data = await learningService.createNote(
      req.params.videoId,
      req.user.id,
      req.body,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateNote = async (req, res) => {
  try {
    const data = await learningService.updateNote(
      req.params.id,
      req.user.id,
      req.body,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const data = await learningService.removeNote(req.params.id, req.user.id);
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getVocabulary = async (req, res) => {
  try {
    const data = await learningService.readVocabulary(
      req.params.videoId,
      req.user.id,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getAllVocabulary = async (req, res) => {
  try {
    const data = await learningService.readAllVocabulary(
      req.user.id,
      req.query.page || 1,
      req.query.limit || 12,
      req.query.search || "",
      req.query.status || "",
      req.query.sort || "createdAt,desc",
      req.query.languageId || "",
      req.query.videoId || "",
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const createVocabulary = async (req, res) => {
  try {
    const data = await learningService.createVocabulary(
      req.params.videoId,
      req.user.id,
      req.body,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateVocabulary = async (req, res) => {
  try {
    const data = await learningService.updateVocabulary(
      req.params.id,
      req.user.id,
      req.body,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteVocabulary = async (req, res) => {
  try {
    const data = await learningService.removeVocabulary(
      req.params.id,
      req.user.id,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getProgress = async (req, res) => {
  try {
    const data = await learningService.readProgress(
      req.params.videoId,
      req.user.id,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateProgress = async (req, res) => {
  try {
    const data = await learningService.updateProgress(
      req.params.videoId,
      req.user.id,
      req.body,
    );
    return send(res, data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

export default {
  getYoutubeMetadata,
  syncYoutubeMetadata,
  importTranscript,
  saveManualTranscript,
  getTranscripts,
  getNotes,
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  getVocabulary,
  getAllVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getProgress,
  updateProgress,
};
