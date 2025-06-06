import { useEffect, useState } from "react";
import { Card, Container, Button, Spinner, Alert, Collapse, ListGroup, Row, Col, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { StarFill, Star } from "react-bootstrap-icons";

const CercaComici = () => {
  const [comici, setComici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");
  const [recensioni, setRecensioni] = useState({});
  const [aperto, setAperto] = useState(null);
  const [modaleComico, setModaleComico] = useState(null);
  const [messaggio, setMessaggio] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchComici = async () => {
      try {
        const res = await fetch(`${apiUrl}/comici`);
        if (!res.ok) throw new Error("Errore nel caricamento comici");
        const data = await res.json();
        setComici(data);

        // Fetch recensioni di tutti i comici
        const recensioniTotali = {};
        for (const comico of data) {
          try {
            const r = await fetch(`${apiUrl}/recensioni/comico/${comico.id}`);
            const rData = await r.json();
            recensioniTotali[comico.id] = rData;
          } catch {
            recensioniTotali[comico.id] = [];
          }
        }
        setRecensioni(recensioniTotali);
      } catch (err) {
        setErrore(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComici();
  }, []);

  const toggleRecensioni = async (comicoId) => {
    if (aperto === comicoId) {
      setAperto(null);
      return;
    }
    if (!recensioni[comicoId]) {
      try {
        const res = await fetch(`${apiUrl}/recensioni/comico/${comicoId}`);
        if (!res.ok) throw new Error("Errore nel caricamento recensioni");
        const data = await res.json();
        setRecensioni((prev) => ({ ...prev, [comicoId]: data }));
      } catch (err) {
        setRecensioni((prev) => ({
          ...prev,
          [comicoId]: [{ contenuto: "Errore nel caricamento", voto: 0 }],
        }));
      }
    }
    setAperto(comicoId);
  };

  const renderStelle = (voto) =>
    Array.from({ length: 5 }, (_, i) =>
      i < Math.round(voto) ? <StarFill key={i} className="text-warning" /> : <Star key={i} className="text-muted" />
    );

  const handleContatta = (comico) => {
    setModaleComico(comico);
    setMessaggio("");
  };
  const calcolaMedia = (lista) => (lista.length > 0 ? lista.reduce((acc, r) => acc + r.voto, 0) / lista.length : null);

  const inviaMessaggio = () => {
    // Qui potresti fare una fetch per inviare il messaggio
    alert(`Messaggio inviato a ${modaleComico.nome}:\n\n${messaggio}`);
    setModaleComico(null);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (errore)
    return (
      <Alert variant="danger" className="text-center">
        {errore}
      </Alert>
    );

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-primary fw-bold text-center">🔍 Cerca Comici</h2>
      <Row xs={1} className="g-4">
        {comici.map((comico) => {
          const media = calcolaMedia(recensioni[comico.id] || []);

          return (
            <Col className="col-6" key={comico.id}>
              <Card className="h-100 text-center shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fs-5 fw-bold">
                    {comico.nome} {comico.cognome}
                    {media && <div className="mt-1">{renderStelle(media)}</div>}
                  </Card.Title>
                  <Card.Text className="text-muted mb-3">📧 {comico.email}</Card.Text>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => navigate(`/dashboardLocale/nuovoEvento?comicoId=${comico.id}`)}
                    >
                      🎤 Crea evento
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => handleContatta(comico)}
                    >
                      ✉️ Contatta
                    </Button>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => toggleRecensioni(comico.id)}
                    >
                      {aperto === comico.id ? "Nascondi Recensioni" : "Mostra Recensioni"}
                    </Button>
                  </div>
                </Card.Body>

                <Collapse in={aperto === comico.id}>
                  <div className="px-3 pb-3">
                    {recensioni[comico.id] ? (
                      <ListGroup className="mt-3 text-start">
                        {recensioni[comico.id].length === 0 ? (
                          <ListGroup.Item>Nessuna recensione disponibile</ListGroup.Item>
                        ) : (
                          recensioni[comico.id].map((r, index) => (
                            <ListGroup.Item key={index} className="d-flex align-items-start gap-2">
                              <div>{renderStelle(r.voto)}</div>
                              <div className="text-muted small">{r.contenuto}</div>
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    ) : (
                      <Spinner animation="border" size="sm" />
                    )}
                  </div>
                </Collapse>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal show={!!modaleComico} onHide={() => setModaleComico(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contatta {modaleComico?.nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Messaggio</Form.Label>
              <Form.Control as="textarea" rows={4} value={messaggio} onChange={(e) => setMessaggio(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModaleComico(null)}>
            Annulla
          </Button>
          <Button variant="primary" onClick={inviaMessaggio}>
            Invia
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CercaComici;
