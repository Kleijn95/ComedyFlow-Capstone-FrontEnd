// Navbar aggiornata in stile moderno ComedyFlow con design ispirato al mockup
import { Container, Nav, Navbar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { fetchUserDetails, LOGOUT } from "../../redux/actions";
import logo from "../../assets/logo.png";

function MyNavBar({ openLoginModal, openRegisterModal }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserDetails(token));
    }
  }, [token, user, dispatch]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getDashboardPath = () => {
    if (!user?.appUser?.roles) return "/dashboard";
    if (user.appUser.roles.includes("ROLE_COMICO")) return "/dashboardComico";
    if (user.appUser.roles.includes("ROLE_SPETTATORE")) return "/dashboardUser";
    if (user.appUser.roles.includes("ROLE_LOCALE")) return "/dashboardLocale";
    if (user.appUser.roles.includes("ROLE_ADMIN")) return "/dashboard";
    return "/dashboard";
  };

  return (
    <Navbar expand="lg" className="px-4 py-2 shadow-sm d-none d-md-flex" style={{ backgroundColor: "#fff7fc" }}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <img src={logo} alt={logo} width="100" height="100" className="d-inline-block align-top rounded-circle" />
          <span style={{ color: "#51a7e1" }}>Comedy</span>
          <span style={{ color: "#8661eb" }}>Flow</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center gap-3">
            <Nav.Link as={NavLink} to="/" className="fw-medium">
              Home
            </Nav.Link>
            {user && (
              <Nav.Link as={NavLink} to={getDashboardPath()} className="fw-medium">
                Dashboard
              </Nav.Link>
            )}
            {user ? (
              <>
                <Nav.Link as={NavLink} to="/profile" className="fw-bold d-flex align-items-center gap-2">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      width="30"
                      height="30"
                      className="rounded-circle border"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  {user.appUser?.roles?.includes("ROLE_LOCALE")
                    ? user.nomeLocale
                    : `${capitalize(user.nome)} ${capitalize(user.cognome)}`}
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    localStorage.removeItem("token");
                    dispatch({ type: LOGOUT });
                    navigate("/");
                  }}
                  className="text-danger"
                >
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link className="btn btn-comedy-outline px-3 py-1 rounded-pill" onClick={openLoginModal}>
                  Login
                </Nav.Link>
                <Nav.Link className="btn btn-comedy-fill px-3 py-1 rounded-pill" onClick={openRegisterModal}>
                  Registrati
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavBar;
