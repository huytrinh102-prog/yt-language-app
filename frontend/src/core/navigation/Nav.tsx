import "./nav.scss";
import { Container, Navbar, Nav, Dropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBookOpen, FaMoon, FaSun, FaUserCircle } from "react-icons/fa";

import { logout } from "../../redux/slices/authSlice";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { isAdminUser } from "../../utils/auth";
import { LogoutUser } from "../../services/ServiceApi";
const Navi = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = isAdminUser(user);

  const mode = useAppSelector((state) => state.theme.mode);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/users", label: "Users", adminOnly: true },
    { to: "/videos", label: "Videos" },
    { to: "/notes", label: "Notes" },
    { to: "/vocabulary", label: "Vocabulary" },
    { to: "/roles", label: "Roles", adminOnly: true },
    { to: "/group-role", label: "Group Role", adminOnly: true },
  ];
  // fc
  const handleLogout = async () => {
    localStorage.setItem("auth_logged_out", "true");
    try {
      await LogoutUser();
    } finally {
      localStorage.removeItem("access_token");
      dispatch(logout());
      navigate("/login");
    }
  };
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <Navbar expand="lg" className="custom-nav sticky-top">
      <Container>
        {/* LOGO */}
        <Navbar.Brand as={NavLink} to="/" className="brand-mark">
          <span className="brand-icon">
            <FaBookOpen />
          </span>
          <span>LinguaTube</span>
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse>
          {/* CENTER NAV */}
          <Nav className="mx-auto gap-2 align-items-center">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </Nav>

          {/* RIGHT */}
          <div className="d-flex align-items-center gap-3">
            {/* THEME BUTTON */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="btn btn-outline-secondary theme-toggle"
            >
              {mode === "light" ? <FaMoon /> : <FaSun />}
              <span>{mode === "light" ? "Dark" : "Light"}</span>
            </button>

            {/* USER DROPDOWN */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant={mode === "light" ? "light" : "dark"}
                className="account-toggle"
              >
                <FaUserCircle />
                <span>{user ? user.username : "Account"}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {user ? (
                  <>
                    <Dropdown.Item onClick={() => navigate("/profile")}>
                      Profile
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </>
                ) : (
                  <Dropdown.Item onClick={handleLogin}>Login</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navi;
