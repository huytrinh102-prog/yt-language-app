import "./Users.scss";
import {
  GetAllUsers,
  DeleteUser,
  GetAllGroups,
} from "../../services/ServiceApi";
import type { Group, UserFormData, UserItem } from "../../utils/types/user";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ModalCreateUpdateUser from "./ModalCreateUpdateUser";
import { useSearchParams } from "react-router-dom";
import type { ChangeEvent } from "react";
import { Dropdown } from "react-bootstrap";

const defaultUserData: UserFormData = {
  email: "",
  password: "",
  username: "",
  phone: "",
  sex: "MALE",
  groupId: 1,
};

const User = () => {
  const [listUser, setListUser] = useState<UserItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [ModalData, setModalData] = useState<UserItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [listGroups, setListGroups] = useState<Group[]>([]);
  const [modal, setModal] = useState<"CREATE" | "UPDATE" | "">("");

  const [userDataSubmit, setUserDataSubmit] = useState(defaultUserData);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 1);
  const keyword = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "id,desc";

  useEffect(() => {
    const fetchAllGroups = async () => {
      const res = await GetAllGroups();
      if (res && +res?.EC === 0) {
        setListGroups(res.DT);
      }
    };
    fetchAllGroups();
  }, []);

  const fetchListUsers = async () => {
    try {
      const res = await GetAllUsers(currentPage, 5, keyword, sort);
      if (res && +res.EC === 0) {
        setListUser(res.DT.users);
        console.log(res);
        setTotalPages(res.DT.totalPages);
      }
    } catch (error) {
      console.log(error);
      // axios interceptor will toast
    }
  };

  const goToPage = (page: number) => {
    setSearchParams({
      page: String(page),
      search: keyword,
      sort,
    });
  };

  const handleRefresh = async () => {
    setSearchParams({ page: "1", search: "", sort: "id,asc" });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ page: "1", search: e.target.value, sort });
  };

  const handleSort = (field: string) => {
    const [currentField, currentDirection] = sort.split(",");

    if (field === currentField) {
      const nextDirection = currentDirection === "asc" ? "desc" : "asc";
      setSearchParams({
        page: "1",
        search: keyword,
        sort: `${field},${nextDirection}`,
      });
    } else {
      setSearchParams({
        page: "1",
        search: keyword,
        sort: `${field},asc`,
      });
    }
  };
  const handleDeleteUser = async (id: number, email: string) => {
    const confirmDelete = window.confirm(`Delete this user? : ${email}`);
    if (!confirmDelete) return;
    const res = await DeleteUser(id);
    if (res && +res?.EC === 0) {
      toast.success(res.EM);
      fetchListUsers();
    } else {
      toast.error(res.EM);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchListUsers();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, currentPage, sort]);

  return (
    <>
      <main className="users-page">
        <div className="container">
          <div className="users-header">
            <div>
              <h1>Users</h1>
              <p>Manage accounts, access groups, and profile details.</p>
            </div>
            <button
              className="btn btn-primary users-create-btn"
              onClick={() => {
                setModalData(null);
                setShowModal(true);
                setModal("CREATE");
              }}
            >
              + Create user
            </button>
          </div>

          <div className="users-toolbar">
            <input
              className="form-control users-search"
              placeholder="Search email/username..."
              value={keyword}
              onChange={handleSearchChange}
            />

            <div className="users-toolbar-actions">
              <Dropdown>
                <Dropdown.Toggle
                  className="sort-btn"
                  variant="outline-secondary"
                >
                  <span className="sort-icon">^v</span>
                  <span>Sort: {sort.replace(",", " ")}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => handleSort("id")}>
                    ID
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort("username")}>
                    Name
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort("createdAt")}>
                    Date created
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <button
                className="btn btn-outline-secondary"
                onClick={handleRefresh}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="user-table-wrap">
            <div className="user-table-meta">
              <span>{listUser.length} users on this page</span>
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Email</th>
                    <th scope="col">Username</th>
                    <th scope="col">Group</th>
                    <th scope="col" className="user-action-heading">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listUser.length > 0 ? (
                    listUser.map((item) => (
                      <tr key={item.id}>
                        <th scope="row">#{item.id}</th>
                        <td>{item.email}</td>
                        <td>{item.username || "-"}</td>
                        <td>
                          <span className="user-group">
                            {item.Group?.name || "Unassigned"}
                          </span>
                        </td>
                        <td>
                          <div className="user-action">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => {
                                setShowModal(true);
                                setModalData(item);
                                setModal("UPDATE");
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteUser(item.id, item.email)
                              }
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="users-empty" colSpan={5}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <nav className="listUser-footer" aria-label="Users pagination">
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
                    <button
                      className="page-link"
                      onClick={() => goToPage(page)}
                    >
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
      <ModalCreateUpdateUser
        onSuccess={fetchListUsers}
        listGroups={listGroups}
        setShow={setShowModal}
        ModalData={ModalData}
        show={showModal}
        userDataSubmit={userDataSubmit}
        setUserDataSubmit={setUserDataSubmit}
        modal={modal}
        userData={defaultUserData}
      />
    </>
  );
};

export default User;
