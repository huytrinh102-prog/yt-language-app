import GroupRoleApiService from "../service/GroupRoleApiService.js";
const getAllRoles = async (req, res) => {
  try {
    let data = await GroupRoleApiService.read();
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
const getRolesByGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    let data = await GroupRoleApiService.getRolesByGroupId(groupId);
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

const updateRolesbyGroup = async (req, res) => {
  try {
    const groupId = req.body.GroupId ?? req.body.groupId;
    const roleId = req.body.RoleId ?? req.body.roleId;
    console.log(groupId, roleId);
    if (!groupId) {
      return res.status(200).json({
        EM: "Missing required parameter: groupId",
        EC: 1,
        DT: "",
      });
    }
    let data = await GroupRoleApiService.update(groupId, roleId);
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
export default { getAllRoles, getRolesByGroup, updateRolesbyGroup };
