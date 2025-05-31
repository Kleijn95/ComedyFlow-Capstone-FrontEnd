import React, { useEffect, useState } from "react";
import { Container, Card, Form, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";

const RecensioniLocale = () => {
  const user = useSelector((state) => state.user.user);
  const apiUrl = import.meta.env.VITE_API_URL;

  const [recensioni, setRecensioni] = useState([]);
  const [filtroVoto, setFiltroVoto] = useState("TUTTI");
  const [filtroEvento, setFiltroEvento] = useState("TUTTI");
  const [errore, setErrore] = useState("");
  const [eventi, setEventi] = useState([]);
  const [eventoTop, setEventoTop] = useState(null);

  useEffect(() => {
    const fetchRecensioni = async () => {
      try {
        const res = await fetch(`${apiUrl}/recensioni/locale/${user.id}`);
        const data = await res.json();
        setRecensioni(data);

        // Crea lista eventi unici
        const eventiUnici = [
          ...new Map(data.map((r) => [r.eventoId, { eventoId: r.eventoId, titolo: r.titoloEvento }])).values(),
        ];
        setEventi(eventiUnici);

        // Calcola evento con media più alta
        const mediaPerEvento = {};
        data.forEach((r) => {
          if (!mediaPerEvento[r.eventoId]) mediaPerEvento[r.eventoId] = { somma: 0, count: 0, titolo: r.titoloEvento };
          mediaPerEvento[r.eventoId].somma += r.voto;
          mediaPerEvento[r.eventoId].count++;
        });
        const ordinati = Object.entries(mediaPerEvento).sort(
          (a, b) => b[1].somma / b[1].count - a[1].somma / a[1].count
        );
        if (ordinati.length > 0) {
          const top = ordinati[0][1];
          setEventoTop({ titolo: top.titolo, media: (top.somma / top.count).toFixed(2) });
        }
      } catch (err) {
        setErrore("Errore nel caricamento delle recensioni");
      }
    };

    if (user?.id) fetchRecensioni();
  }, [user]);

  const recensioniFiltrate = recensioni.filter((r) => {
    const votoMatch = filtroVoto === "TUTTI" || r.voto === parseInt(filtroVoto);
    const eventoMatch = filtroEvento === "TUTTI" || r.eventoId === parseInt(filtroEvento);
    return votoMatch && eventoMatch;
  });

  return (
    <Container className="py-4">
      <h2>Recensioni ricevute</h2>
      {errore && <p className="text-danger">{errore}</p>}

      {eventoTop && (
        <Card className="mb-3 border-success">
          <Card.Body>
            <strong>🎉 Evento con più successo:</strong> {eventoTop.titolo} con media {eventoTop.media} ★
          </Card.Body>
        </Card>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Filtra per voto</Form.Label>
        <Form.Select value={filtroVoto} onChange={(e) => setFiltroVoto(e.target.value)}>
          <option value="TUTTI">Tutti</option>
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {v} stelle
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Filtra per evento</Form.Label>
        <Form.Select value={filtroEvento} onChange={(e) => setFiltroEvento(e.target.value)}>
          <option value="TUTTI">Tutti gli eventi</option>
          {eventi.map((e) => (
            <option key={e.eventoId} value={e.eventoId}>
              {e.titolo}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {recensioniFiltrate.length === 0 && <p>Nessuna recensione trovata per il filtro selezionato.</p>}

      {recensioniFiltrate.map((rec) => (
        <Card key={rec.id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>
              Evento: <strong>{rec.titoloEvento}</strong>
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Da: {rec.autore} |{" "}
              <Badge bg="warning" text="dark">
                {rec.voto} ★
              </Badge>
            </Card.Subtitle>
            <Card.Text>{rec.contenuto}</Card.Text>
            <small className="text-muted">{new Date(rec.data).toLocaleDateString()}</small>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default RecensioniLocale;
