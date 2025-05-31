import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router";
import { fetchUserDetails } from "../../redux/actions";
import DashboardUser from "../dashboardUser/DashboardUser";
import DashboardComico from "../dashboardComico/DashBoardComico";
import DashboardLocale from "../dashboardLocale/DashboardLocale";
import { Container, Card } from "react-bootstrap";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserDetails(token));
    }
  }, [dispatch, token, user]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!user || !user.appUser) {
    return (
      <Container className="text-center py-5">
        <p>Caricamento in corso...</p>
      </Container>
    );
  }

  const role = user.appUser.roles?.[0]; // Prendiamo il primo ruolo per semplificare

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        Benvenuto, {user.nome} {user.cognome}!
      </h2>

      {role === "ROLE_SPETTATORE" && (
        <>
          <Card className="mb-4 shadow-sm p-3">
            <h5 className="mb-2">Cosa puoi fare:</h5>
            <ul>
              <li>Visualizzare i tuoi eventi prenotati</li>
              <li>Ricercare nuovi eventi</li>
              <li>Contattare i locali per informazioni</li>
              <li>Lasciare recensioni ai comici e locali dopo gli eventi</li>
            </ul>
          </Card>
          <DashboardUser />
        </>
      )}

      {role === "ROLE_COMICO" && (
        <>
          <Card className="mb-4 shadow-sm p-3">
            <h5 className="mb-2">Cosa puoi fare:</h5>
            <ul>
              <li>Vedere tutti gli eventi in cui ti esibirai</li>
              <li>Contattare i locali dove ti esibirai</li>
              <li>Visualizzare le recensioni ricevute</li>
            </ul>
          </Card>
          <DashboardComico />
        </>
      )}

      {role === "ROLE_LOCALE" && (
        <>
          <Card className="mb-4 shadow-sm p-3">
            <h5 className="mb-2">Cosa puoi fare:</h5>
            <ul>
              <li>Creare e gestire eventi nel tuo locale</li>
              <li>Contattare i comici per collaborazioni</li>
              <li>Visualizzare le recensioni lasciate dai partecipanti</li>
              <li>Gestire le prenotazioni e visualizzare i partecipanti</li>
            </ul>
          </Card>
          <DashboardLocale />
        </>
      )}

      {role === "ROLE_ADMIN" && (
        <Card className="mt-3 p-3">
          <h5>Sezione Admin</h5>
          <p>Accesso completo alla gestione di utenti, eventi e sistema.</p>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;
