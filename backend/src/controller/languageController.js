import languageService from "../service/languageService.js";

const createLanguage = async (req, res) => {
  try {
    const data = await languageService.create(req.body, req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getLanguages = async (req, res) => {
  try {
    const data = await languageService.read(req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getLanguageById = async (req, res) => {
  try {
    const data = await languageService.readById(req.params.id, req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const data = await languageService.update(
      req.body,
      req.params.id,
      req.user.id,
    );
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteLanguage = async (req, res) => {
  try {
    const data = await languageService.remove(req.params.id, req.user.id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

export default {
  createLanguage,
  getLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
};
