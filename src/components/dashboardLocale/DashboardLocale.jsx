import React from "react";
import { Card, Container, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

const DashboardLocale = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return (
    <Container className="py-4">
      <h2 className="mb-4">Dashboard {capitalize(user?.nomeLocale)}</h2>

      <div className="d-flex flex-column gap-3">
        <Button variant="outline-primary" onClick={() => navigate("/dashboardLocale/nuovoEvento")}>
          Organizza un nuovo evento
        </Button>
        <Button variant="outline-secondary" onClick={() => navigate("/dashboardLocale/eventiLocale")}>
          Gestisci i tuoi eventi
        </Button>
        <Button variant="outline-success" onClick={() => navigate("/dashboardLocale/RecensioniLocale")}>
          Recensioni degli eventi
        </Button>
        <Button variant="outline-info" onClick={() => navigate("/dashboardLocale/cercaComici")}>
          Cerca comici (con valutazioni)
        </Button>
      </div>
    </Container>
  );
};

export default DashboardLocale;
