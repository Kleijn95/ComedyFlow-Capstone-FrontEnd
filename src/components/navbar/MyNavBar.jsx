import { Container, Nav, Navbar, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router";
import { fetchUserDetails, LOGOUT } from "../../redux/actions";
import MyLogin from "../auth/MyLogin";
import MyRegister from "../auth/MyRegister";

function MyNavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate(getDashboardPath());
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    navigate("/login");
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary d-none d-lg-block">
        <Container>
          <Navbar.Brand as={Link} to="/">
            ComedyFlow
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" active={window.location.pathname === "/"}>
                Home
              </Nav.Link>
              {user && (
                <Nav.Link as={Link} to={getDashboardPath()} active={window.location.pathname === getDashboardPath()}>
                  Dashboard
                </Nav.Link>
              )}
            </Nav>

            {user ? (
              <Nav className="d-flex align-items-center gap-3">
                <Nav.Link as={NavLink} to="/profile" className="d-flex align-items-center gap-2 fw-bold">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      width="32"
                      height="32"
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
                    navigate("/"); // Sposta subito via dalla Dashboard
                    localStorage.removeItem("token");
                    dispatch({ type: LOGOUT });
                  }}
                >
                  Logout
                </Nav.Link>
              </Nav>
            ) : (
              <Nav className="d-flex gap-3">
                <Nav.Link onClick={() => setShowLogin(true)}>Login</Nav.Link>
                <Nav.Link onClick={() => setShowRegister(true)}>Registrati</Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MyLogin inline={true} closeModal={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
        </Modal.Body>
      </Modal>

      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registrazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MyRegister inline={true} closeModal={() => setShowRegister(false)} onSuccess={handleRegisterSuccess} />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MyNavBar;
