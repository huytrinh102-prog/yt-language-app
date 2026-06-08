import * as userApiService from "../service/userApiService.js";
import cloudinary from "../config/cloudinary.js";
const getUsers = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 5;
    let search = req.query.search || "";
    let sort = req.query.sort || "id,desc";
    let data = await userApiService.read(page, limit, search, sort);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (!req.body.phone) {
      return res.status(200).json({
        EM: "Missing required parameters",
        EC: 1,
        DT: "",
      });
    }
    if (req.body.phone.length < 8) {
      return res.status(200).json({
        EM: "Your phone number must have at least 8 digits",
        EC: 1,
        DT: "",
      });
    }
    console.log("UPDATE DATA:", req.body);
    const data = await userApiService.update(req.body, id);
    return res.status(200).json({ EM: data.EM, EC: data.EC, DT: "" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const creatUser = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.phone) {
      return res.status(200).json({
        EM: "Missing required parameters",
        EC: 1,
        DT: "",
      });
    }
    if (String(req.body.password || "").length < 8) {
      return res.status(200).json({
        EM: "Your password must have at least 8 characters",
        EC: 1,
        DT: "",
      });
    }
    console.log("UPDATE DATA:", req.body);
    const data = await userApiService.create(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: "",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    let id = req.params.id;
    const data = await userApiService.remove(id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const getGroups = async (req, res) => {
  try {
    let data = await userApiService.getGroups();
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const getAccountData = async (req, res) => {
  try {
    const data = await userApiService.getAccountProfile(req.user.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = await userApiService.updateProfile(req.body, req.user.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};

const userAvatar = async (req, res) => {
  try {
    const folder = "avatars";
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder,
    };
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET,
    );
    if (!req.user) {
      return res.status(401).json({ EC: 1, EM: "Unauthorized" });
    }
    return res.status(200).json({
      EC: 0,
      EM: "ok",
      DT: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        signature,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ EC: -1, EM: "sign failed", DT: "" });
  }
};
export default {
  getUsers,
  deleteUser,
  updateUser,
  creatUser,
  getGroups,
  getAccountData,
  updateProfile,
  userAvatar,
};
