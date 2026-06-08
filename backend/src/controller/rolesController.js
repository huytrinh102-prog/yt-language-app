import rolesApiService from "../service/rolesAipService.js";

const createRoles = async (req, res) => {
  try {
    let data = await rolesApiService.create(req.body);

    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};
const getRoles = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 5;
    let keyword = req.query.search || "";
    let order = req.query.sort || "id,asc";
    let data = await rolesApiService.read(page, limit, keyword, order);
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

const updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    if (!req.body.url) {
      return res.status(200).json({
        EM: "Missing required parameters",
        EC: 1,
        DT: "",
      });
    }
    const data = await rolesApiService.update(req.body, id);
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

const deleteRole = async (req, res) => {
  try {
    let id = req.params.id;
    const data = await rolesApiService.remove(id);
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

export default { createRoles, getRoles, updateRole, deleteRole };
