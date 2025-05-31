import { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Button } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router";

const PartecipantiEvento = () => {
  const [partecipanti, setPartecipanti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventoId = searchParams.get("eventoId");
  const titoloEvento = searchParams.get("titolo"); // 🆕 otteniamo il titolo dalla querystring

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

  if (loading) return <Spinner animation="border" />;
  if (errore) return <Alert variant="danger">{errore}</Alert>;

  return (
    <Container className="mt-4">
      <Button variant="outline-primary" onClick={() => navigate("/dashboardLocale")} className="mb-3">
        ← Torna alla Dashboard
      </Button>

      {partecipanti.length === 0 ? (
        <Alert variant="info" className="mt-3">
          Nessun partecipante registrato per questo evento.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Nome spettatore</th>
              <th>Posti prenotati</th>
              <th>Data prenotazione</th>
            </tr>
          </thead>
          <tbody>
            {partecipanti.map((p) => (
              <tr key={p.id}>
                <td>{p.nomeSpettatore}</td>
                <td>{p.numeroPostiPrenotati}</td>
                <td>{new Date(p.dataOraPrenotazione).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PartecipantiEvento;
