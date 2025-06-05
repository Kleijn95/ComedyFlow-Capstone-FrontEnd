// BottomNav aggiornata in stile moderno ComedyFlow con design ispirato a Freezy
import { useNavigate } from "react-router-dom";
import { HouseDoorFill, PersonCircle, Speedometer, BoxArrowRight, BoxArrowInRight } from "react-bootstrap-icons";
import { useSelector, useDispatch } from "react-redux";
import { LOGOUT } from "../../redux/actions";

const BottomNav = ({ openLoginModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: LOGOUT });
    navigate("/");
  };

  const goToDashboard = () => {
    if (!user) return navigate("/");
    const roles = user.appUser?.roles || [];
    if (roles.includes("ROLE_COMICO")) return navigate("/dashboardComico");
    if (roles.includes("ROLE_LOCALE")) return navigate("/dashboardLocale");
    if (roles.includes("ROLE_SPETTATORE")) return navigate("/dashboardUser");
    navigate("/dashboard");
  };

  return (
    <div
      className="position-fixed bottom-0 start-50 translate-middle-x shadow rounded-pill px-4 py-2 d-flex justify-content-between align-items-center d-md-none"
      style={{
        maxWidth: "360px",
        width: "90%",
        zIndex: 999,
        backgroundColor: "rgb(255, 247, 252)",
        marginBottom: "12px",
      }}
    >
      <button className="btn btn-link text-dark d-flex flex-column align-items-center" onClick={() => navigate("/")}>
        <HouseDoorFill size={22} />
        <small className="mt-1">Home</small>
      </button>

      <button className="btn btn-link text-dark d-flex flex-column align-items-center" onClick={goToDashboard}>
        <Speedometer size={22} />
        <small className="mt-1">Dashboard</small>
      </button>

      <button
        className="btn btn-link text-dark d-flex flex-column align-items-center"
        onClick={() => navigate("/profile")}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <PersonCircle size={22} />
        )}
        <small className="mt-1">Profilo</small>
      </button>

      {isLoggedIn ? (
        <button className="btn btn-link text-danger d-flex flex-column align-items-center" onClick={handleLogout}>
          <BoxArrowRight size={22} />
          <small className="mt-1">Logout</small>
        </button>
      ) : (
        <button className="btn btn-link text-primary d-flex flex-column align-items-center" onClick={openLoginModal}>
          <BoxArrowInRight size={22} />
          <small className="mt-1">Login</small>
        </button>
      )}
    </div>
  );
};

export default BottomNav;
