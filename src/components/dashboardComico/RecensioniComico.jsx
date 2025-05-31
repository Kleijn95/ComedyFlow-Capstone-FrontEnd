import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Container, Card, Spinner, Row, Col, Form, Button } from "react-bootstrap";
import { StarFill, Star } from "react-bootstrap-icons";

export default function RecensioniComico() {
  const [recensioni, setRecensioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votoMinimo, setVotoMinimo] = useState("");
  const [evento, setEvento] = useState("");
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchRecensioni = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (votoMinimo) params.append("votoMinimo", votoMinimo);
      if (evento) params.append("titoloEvento", evento);

      const res = await fetch(`${apiUrl}/recensioni/comico/${user.id}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore nel caricamento delle recensioni");
      const data = await res.json();
      setRecensioni(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchRecensioni();
  }, [user]);

  const renderStelle = (voto) =>
    Array.from({ length: 5 }, (_, i) =>
      i < voto ? <StarFill key={i} className="text-warning" /> : <Star key={i} className="text-muted" />
    );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Recensioni ricevute</h2>

      {/* 🔍 FILTRI */}
      <Form className="mb-4 d-flex gap-3 flex-wrap">
        <Form.Control
          placeholder="Filtra per titolo evento"
          value={evento}
          onChange={(e) => setEvento(e.target.value)}
        />
        <Form.Select value={votoMinimo} onChange={(e) => setVotoMinimo(e.target.value)}>
          <option value="">Tutti i voti</option>
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              Almeno {v} stelle
            </option>
          ))}
        </Form.Select>
        <Button onClick={fetchRecensioni} variant="primary">
          Filtra
        </Button>
      </Form>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : recensioni.length === 0 ? (
        <p className="text-muted">Nessuna recensione trovata.</p>
      ) : (
        recensioni.map((recensione) => (
          <Card key={recensione.id} className="mb-3 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5 className="mb-1">
                    <strong>Autore:</strong> {recensione.autore}
                  </h5>
                  <p className="text-muted mb-2">
                    <strong>Evento:</strong> {recensione.titoloEvento}
                    <br />
                    <strong>Data Recensione:</strong> {new Date(recensione.data).toLocaleDateString("it-IT")}
                  </p>
                </Col>
                <Col
                  md={6}
                  className="d-flex justify-content-md-end justify-content-start align-items-start gap-1 mt-2 mt-md-0"
                >
                  {renderStelle(recensione.voto)}
                </Col>
              </Row>
              <hr />
              <p className="mb-0">
                <strong>Contenuto:</strong>
                <br />
                {recensione.contenuto}
              </p>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}
