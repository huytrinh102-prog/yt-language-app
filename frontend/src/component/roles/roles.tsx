import "./Roles.scss";
import { toast } from "react-toastify";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CreateRoles,
  DeleteRoles,
  GetRoles,
  UpdateRoles,
} from "../../services/ServiceApi";
import type { Role } from "../../utils/types/role";

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 1) || 1;
  const keyword = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "id,desc";

  const [form, setForm] = useState({ url: "", description: "" });
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const fetchRoles = async () => {
    const res = await GetRoles(currentPage, 10, keyword, sort);
    if (res?.DT) {
      setRoles(res.DT?.roles || []);
      setTotalPages(res.DT?.totalPages || 1);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchRoles(), 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, keyword, sort]);

  const goToPage = (page: number) => {
    setSearchParams({ page: String(page), search: keyword, sort });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ page: "1", search: e.target.value, sort });
  };

  const handleToggleSortId = () => {
    const [field, direction] = sort.split(",");
    if (field !== "id") {
      setSearchParams({ page: "1", search: keyword, sort: "id,asc" });
      return;
    }
    const next = direction === "asc" ? "desc" : "asc";
    setSearchParams({ page: "1", search: keyword, sort: `id,${next}` });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.url) {
      toast.error("Role url is required");
      return;
    }
    if (editingRoleId !== null) {
      const res = await UpdateRoles(form, editingRoleId);
      if (res && +res.EC === 0) toast.success(res.EM || "Updated");
      else toast.error(res?.EM || "Update failed");
    } else {
      const res = await CreateRoles(form);
      if (res && +res.EC === 0) toast.success(res.EM || "Created");
      else toast.error(res?.EM || "Create failed");
    }
    setForm({ url: "", description: "" });
    setEditingRoleId(null);
    fetchRoles();
  };

  const handleEdit = (r: Role) => {
    setEditingRoleId(r.id);
    setForm({ url: r.url || "", description: r.description || "" });
  };

  const handleDelete = async (roleId: number) => {
    const ok = window.confirm("Delete this role?");
    if (!ok) return;
    const res = await DeleteRoles(roleId);
    if (res && +res.EC === 0) toast.success(res.EM || "Deleted");
    else toast.error(res?.EM || "Delete failed");
    fetchRoles();
  };

  return (
    <main className="roles-page">
      <div className="container">
        <div className="roles-header">
          <div>
            <h1>Roles</h1>
            <p>Manage API permissions and endpoint descriptions.</p>
          </div>
        </div>

        <div className="roles-toolbar">
          <input
            className="form-control role-search"
            placeholder="Search role..."
            value={keyword}
            onChange={handleSearchChange}
          />

          <div className="roles-toolbar-actions">
            <button
              className="btn btn-outline-secondary sort-btn"
              onClick={handleToggleSortId}
            >
              <span className="sort-icon">^v</span>
              <span>Sort: {sort.replace(",", " ")}</span>
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                setSearchParams({ page: "1", search: "", sort: "id,desc" })
              }
            >
              Reset
            </button>
          </div>
        </div>

        <div className="roles-panel">
          <form className="row g-2 role-form" onSubmit={handleSubmit}>
            <div className="col-12 col-lg-4">
              <label className="form-label">URL</label>
              <input
                className="form-control"
                placeholder="ex: /api/v1/read"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label">Description</label>
              <input
                className="form-control"
                placeholder="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-lg-2 d-grid">
              <button className="btn btn-primary" type="submit">
                {editingRoleId !== null ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>

        <div className="role-table-wrap">
          <div className="role-table-meta">
            <span>{roles.length} roles on this page</span>
            <span>
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>URL</th>
                  <th>Description</th>
                  <th className="role-action-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles?.length ? (
                  roles.map((r) => (
                    <tr key={r.id}>
                      <th scope="row">#{r.id}</th>
                      <td>
                        <code className="role-url">{r.url || "-"}</code>
                      </td>
                      <td className="role-description">
                        {r.description || "-"}
                      </td>
                      <td>
                        <div className="role-action">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="roles-empty">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <nav className="roles-footer" aria-label="Roles pagination">
          <ul className="pagination">
            <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                &lt; Previous
              </button>
            </li>

            {Array.from({ length: totalPages || 1 }, (_, index) => {
              const page = index + 1;

              return (
                <li
                  className={`page-item ${page === currentPage ? "active" : ""}`}
                  key={`page-${page}`}
                >
                  <button className="page-link" onClick={() => goToPage(page)}>
                    {page}
                  </button>
                </li>
              );
            })}

            <li
              className={`page-item ${
                currentPage >= totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next &gt;
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
};
export default Roles;
