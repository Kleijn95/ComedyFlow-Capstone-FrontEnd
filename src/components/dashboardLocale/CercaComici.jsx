import { useEffect, useState } from "react";
import { Card, Container, Button, Spinner, Alert, Collapse, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router";

const CercaComici = () => {
  const [comici, setComici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");
  const [recensioni, setRecensioni] = useState({});
  const [aperto, setAperto] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchComici = async () => {
      try {
        const res = await fetch(`${apiUrl}/comici`);
        if (!res.ok) throw new Error("Errore nel caricamento comici");
        const data = await res.json();
        setComici(data);
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
        setRecensioni((prev) => ({ ...prev, [comicoId]: [{ contenuto: "Errore nel caricamento", voto: 0 }] }));
      }
    }

    setAperto(comicoId);
  };

  if (loading) return <Spinner animation="border" />;
  if (errore) return <Alert variant="danger">{errore}</Alert>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Cerca Comici</h2>
      {comici.map((comico) => (
        <Card key={comico.id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>
              {comico.nome} {comico.cognome}{" "}
              {recensioni[comico.id] && recensioni[comico.id].length > 0 && (
                <span className="text-warning">
                  ⭐{" "}
                  {(recensioni[comico.id].reduce((acc, r) => acc + r.voto, 0) / recensioni[comico.id].length).toFixed(
                    1
                  )}
                </span>
              )}
            </Card.Title>

            <Card.Text>Email: {comico.email}</Card.Text>

            <div className="d-flex gap-2 mb-2">
              <Button
                variant="outline-success"
                onClick={() => toggleRecensioni(comico.id)}
                aria-expanded={aperto === comico.id}
              >
                {aperto === comico.id ? "Nascondi Recensioni" : "Mostra Recensioni"}
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => navigate(`/dashboardLocale/nuovoEvento?comicoId=${comico.id}`)}
              >
                Crea evento con questo comico
              </Button>
            </div>

            <Collapse in={aperto === comico.id}>
              <div>
                {recensioni[comico.id] ? (
                  <ListGroup>
                    {recensioni[comico.id].length === 0 ? (
                      <ListGroup.Item>Nessuna recensione disponibile</ListGroup.Item>
                    ) : (
                      recensioni[comico.id].map((r, index) => (
                        <ListGroup.Item key={index}>
                          <strong>⭐ {r.voto}</strong> – {r.contenuto}
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default CercaComici;
