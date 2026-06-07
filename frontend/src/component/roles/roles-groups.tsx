import "./Roles.scss";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  GetAllGroups,
  GetGroupsRoles,
  GetRolesbyGroup,
  UpdateRolesbyGroup,
} from "../../services/ServiceApi";
import type { Role } from "../../utils/types/role";
import type { Group } from "../../utils/types/user";

const GroupRole = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [checkedRoleIds, setCheckedRoleIds] = useState<Set<number>>(new Set());

  const selectedGroup = useMemo(() => {
    return groups.find((g) => String(g.id) === String(selectedGroupId));
  }, [groups, selectedGroupId]);

  const loadGroups = async () => {
    const res = await GetAllGroups();
    if (res && +res.EC === 0) setGroups(res.DT || []);
    else toast.error(res?.EM || "Load groups failed");
  };

  const loadRoles = async () => {
    const res = await GetGroupsRoles();
    if (res && +res.EC === 0) {
      setRoles(res.DT || []);
    } else toast.error(res?.EM || "Load roles failed");
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([loadGroups(), loadRoles()]);
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    let ignore = false;

    const loadGroupRoles = async () => {
      const res = await GetRolesbyGroup(Number(selectedGroupId));
      if (ignore) return;

      if (res && +res.EC === 0) {
        setCheckedRoleIds(new Set((res.DT || []).map((role) => role.id)));
      } else {
        toast.error(res?.EM || "Load group roles failed");
      }
    };

    void loadGroupRoles();

    return () => {
      ignore = true;
    };
  }, [selectedGroupId]);

  const toggleRole = (roleId: number) => {
    setCheckedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedGroupId) {
      toast.error("Please choose a group");
      return;
    }
    const payload = {
      groupId: +selectedGroupId,
      roleId: Array.from(checkedRoleIds),
    };
    const res = await UpdateRolesbyGroup(payload);
    if (res && +res.EC === 0) toast.success(res.EM || "Updated");
    else toast.error(res?.EM || "Update failed");
  };

  return (
    <main className="roles-page group-role-page">
      <div className="container">
        <div className="roles-header">
          <div>
            <h1>Group Role</h1>
            <p>Choose a group and assign the API roles it can access.</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            Save changes
          </button>
        </div>

        <div className="roles-panel">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-6">
              <label className="form-label">Select group</label>
              <select
                className="form-select"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <option value="">Choose group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name || g.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label">Info</label>
              <div className="group-role-info">
                <span>
                  {selectedGroup
                    ? selectedGroup.name || `Group #${selectedGroup.id}`
                    : "No group selected"}
                </span>
                <strong>{checkedRoleIds.size} selected</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="role-table-wrap">
          <div className="role-table-meta">
            <span>Roles</span>
            <span>{roles.length} available</span>
          </div>

          <div className="group-role-grid">
            {roles?.length ? (
              roles.map((r) => {
                const checked = checkedRoleIds.has(r.id);

                return (
                  <div
                    className={`group-role-card ${checked ? "is-checked" : ""}`}
                    key={r.id}
                  >
                  <input
                    className="form-check-input group-role-check"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(r.id)}
                    id={`role-${r.id}`}
                  />
                    <label
                      className="group-role-content"
                      htmlFor={`role-${r.id}`}
                    >
                      <span className="group-role-title">
                        {r.url || `Role #${r.id}`}
                      </span>
                      <span className="group-role-desc">
                        {r.description || "No description"}
                      </span>
                  </label>
                </div>
                );
              })
            ) : (
              <div className="roles-empty">No roles found.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default GroupRole;
