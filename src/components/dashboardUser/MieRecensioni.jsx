import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";

const MieRecensioni = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [recensioni, setRecensioni] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/recensioni/mie`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Errore caricamento recensioni")))
      .then(setRecensioni)
      .catch((err) => console.error(err));
  }, [apiUrl, token]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const base = isoString.split(".")[0];
    return new Date(base).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Le mie recensioni</h2>
      {recensioni.length === 0 ? (
        <p className="text-center text-muted">Non hai ancora lasciato recensioni.</p>
      ) : (
        <Row xs={1} md={2} className="g-4 justify-content-center">
          {recensioni.map((r) => (
            <Col key={r.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-2">{r.titoloEvento}</Card.Title>
                  <Badge bg={r.tipo === "COMICO" ? "warning" : "secondary"} className="mb-3">
                    {r.tipo === "COMICO" ? "Recensione Comico" : "Recensione Locale"}
                  </Badge>
                  <Card.Text>
                    <strong>Voto:</strong> {r.voto} ⭐
                  </Card.Text>
                  <Card.Text>
                    <strong>Contenuto:</strong> {r.contenuto}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="text-muted small">{formatDate(r.data)}</Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MieRecensioni;
