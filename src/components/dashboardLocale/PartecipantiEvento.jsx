import { useEffect, useState } from "react";
import { Container, Spinner, Alert, Button, Card, Row, Col, Image } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router";

const PartecipantiEvento = () => {
  const [partecipanti, setPartecipanti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventoId = searchParams.get("eventoId");
  const titoloEvento = searchParams.get("titolo");

  useEffect(() => {
    const fetchPartecipanti = async () => {
      try {
        const res = await fetch(`http://localhost:8080/prenotazioni/evento/${eventoId}/partecipanti`);
        if (!res.ok) throw new Error("Errore nel caricamento dati");
        const data = await res.json();
        setPartecipanti(data);
      } catch (err) {
        setErrore(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventoId) fetchPartecipanti();
    else {
      setErrore("ID evento mancante nella querystring.");
      setLoading(false);
    }
  }, [eventoId]);

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (errore)
    return (
      <Alert variant="danger" className="mt-4 text-center">
        {errore}
      </Alert>
    );

  return (
    <Container className="mt-4">
      <Button variant="outline-primary" onClick={() => navigate("/dashboardLocale/eventiLocale")} className="mb-4">
        ← Torna ai tuoi eventi
      </Button>

      <h3 className="fw-bold mb-4 text-center">👥 Partecipanti a “{titoloEvento}”</h3>

      {partecipanti.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nessun partecipante registrato per questo evento.
        </Alert>
      ) : (
        <Row xs={1} sm={2} md={3} className="g-4">
          {partecipanti.map((p) => (
            <Col key={p.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <Image
                    src={p.avatar || "https://via.placeholder.com/60?text=👤"}
                    roundedCircle
                    className="mb-3"
                    style={{ width: 60, height: 60, objectFit: "cover" }}
                  />
                  <Card.Title className="fs-5 fw-semibold mb-1">{p.nomeSpettatore}</Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    📅 {new Date(p.dataOraPrenotazione).toLocaleDateString()} • 🪑 {p.numeroPostiPrenotati} posti
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PartecipantiEvento;
