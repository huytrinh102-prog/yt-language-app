import db from "../models/index.cjs";
const read = async () => {
  try {
    let data = await db.Role.findAndCountAll({
      attributes: ["id", "url", "description"],
      order: [["id", "DESC"]],
    });
    if (data) {
      return {
        EM: "get roles succcess",
        EC: "0",
        DT: data.rows,
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
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};
const getRolesByGroupId = async (groupId) => {
  try {
    const data = await db.Group.findOne({
      where: { id: groupId },
      include: {
        model: db.Role,
        as: "roles",
        attributes: ["id", "url", "description"],
      },
    });
    if (!data) {
      return {
        EM: "Something wrongs from server...",
        EC: "1",
        DT: "",
      };
    }
    return {
      EM: "get roles succcess",
      EC: "0",
      DT: data.Roles,
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

const update = async (groupId, roleId) => {
  try {
    if (groupId === undefined || groupId === null || groupId === "") {
      return { EM: "Missing required parameter: groupId", EC: 1, DT: "" };
    }

    // Normalize roleId to an array of numeric ids (handles array, number, string, object)
    if (roleId === undefined) {
      return { EM: "Missing required parameter: roleId", EC: 1, DT: "" };
    }

    let roleIds = roleId;
    if (typeof roleIds === "string") {
      const trimmed = roleIds.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          roleIds = JSON.parse(trimmed);
        } catch {
          roleIds = trimmed;
        }
      }
      if (typeof roleIds === "string") {
        roleIds = trimmed === "" ? [] : trimmed.split(",").map((s) => s.trim());
      }
    } else if (
      roleIds &&
      typeof roleIds === "object" &&
      !Array.isArray(roleIds)
    ) {
      roleIds = Object.values(roleIds);
    }

    if (!Array.isArray(roleIds)) {
      roleIds = [roleIds];
    }

    roleIds = roleIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    const result = await db.sequelize.transaction(async (transaction) => {
      const currentRole = await db.GroupRole.findAll({
        where: { groupId: groupId },
        attributes: ["id", "RoleId"],
        raw: true,
        transaction,
      });

      const currentRoleIds = currentRole
        .map((item) => Number(item.RoleId))
        .filter((id) => Number.isFinite(id) && id > 0)
        .sort((a, b) => a - b);

      const nextRoleIds = [...roleIds].sort((a, b) => a - b);
      const isSame =
        currentRoleIds.length === nextRoleIds.length &&
        currentRoleIds.every((id, idx) => id === nextRoleIds[idx]);

      if (isSame) {
        const group = await db.Group.findOne({
          where: { id: groupId },
          transaction,
        });
        return { updated: false, group, roleIds: nextRoleIds, currentRole };
      }

      await db.GroupRole.destroy({ where: { groupId }, transaction });

      if (nextRoleIds.length > 0) {
        const data = nextRoleIds.map((rid) => ({
          groupId: groupId,
          RoleId: rid,
        }));
        await db.GroupRole.bulkCreate(data, { transaction });
      }

      const group = await db.Group.findOne({
        where: { id: groupId },
        transaction,
      });
      return {
        updated: true,
        group,
        roleIds: nextRoleIds,
        previousRoleIds: currentRoleIds,
      };
    });

    if (!result.updated) {
      return { EM: "nothing to update...", EC: 0, DT: result };
    }

    return { EM: "update group succcess", EC: 0, DT: result };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server...",
      EC: 1,
      DT: "",
    };
  }
};
export default { read, getRolesByGroupId, update };
