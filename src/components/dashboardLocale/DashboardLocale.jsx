import React from "react";
import { Card, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router";

const DashboardLocale = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-4">
      <h2 className="mb-4">Dashboard Locale</h2>

      <Card className="mb-4 shadow-sm p-3">
        <h5 className="mb-3">Cosa puoi fare:</h5>
        <ul>
          <li>Organizzare un nuovo evento</li>
          <li>Vedere la lista dei tuoi eventi</li>
          <li>Visualizzare le recensioni per ciascun evento</li>
          <li>Vedere i partecipanti registrati ad ogni evento</li>
          <li>Cercare comici da invitare, con valutazioni medie</li>
        </ul>
      </Card>

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
