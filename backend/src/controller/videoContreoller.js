import videoService from "../service/videoService.js";
const createVideo = async (req, res) => {
  try {
    const data = await videoService.create(req.body, req.user.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};
const getVideoById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await videoService.readById(id, req.user.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};
const updateVideo = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await videoService.update(req.body, id, req.user.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};
const deleteVideo = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await videoService.remove(id, req.user.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};
const getVideo = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 5;
    let search = req.query.search || "";
    let sort = req.query.sort || "id,desc";
    let languageId = req.query.languageId || "";
    const data = await videoService.read(
      req.user.id,
      page,
      limit,
      search,
      sort,
      languageId,
    );
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};
export default {
  createVideo,
  updateVideo,
  deleteVideo,
  getVideo,
  getVideoById,
};
