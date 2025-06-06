import React, { useEffect, useState } from "react";
import { Container, Card, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { StarFill, Star } from "react-bootstrap-icons";

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

        const eventiUnici = [
          ...new Map(data.map((r) => [r.eventoId, { eventoId: r.eventoId, titolo: r.titoloEvento }])).values(),
        ];
        setEventi(eventiUnici);

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
          setEventoTop({
            id: parseInt(ordinati[0][0]), // ← eventoId come chiave
            titolo: top.titolo,
            media: (top.somma / top.count).toFixed(2),
          });
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

  const renderStelle = (voto) =>
    Array.from({ length: 5 }, (_, i) =>
      i < voto ? <StarFill key={i} className="text-warning star-anim" /> : <Star key={i} className="text-muted" />
    );

  return (
    <div className="eventi-bg">
      <Container className="eventi-wrapper">
        <h2 className="text-center fw-bold mb-4">⭐ Recensioni ricevute</h2>

        {errore && <p className="text-danger text-center">{errore}</p>}

        {eventoTop && (
          <Card className="mb-4 border-success shadow-sm bg-success-subtle">
            <Card.Body className="text-success fw-semibold">
              🎉 Evento con più successo:{" "}
              <a
                href={`/dashboardLocale/eventiLocale?eventoId=${eventoTop.id}`}
                className="text-decoration-underline fw-bold text-success"
              >
                {eventoTop.titolo}
              </a>
              <br />
              <div className="d-flex align-items-center mt-1">
                {Array.from({ length: 5 }, (_, i) =>
                  i < Math.round(eventoTop.media) ? (
                    <StarFill key={i} className="text-warning me-1" />
                  ) : (
                    <Star key={i} className="text-muted me-1" />
                  )
                )}
                <span className="ms-2">({eventoTop.media})</span>
              </div>
            </Card.Body>
          </Card>
        )}

        <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
          <Form.Select value={filtroVoto} onChange={(e) => setFiltroVoto(e.target.value)} style={{ maxWidth: "180px" }}>
            <option value="TUTTI">Tutti i voti</option>
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v} ★
              </option>
            ))}
          </Form.Select>

          <Form.Select
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
            style={{ maxWidth: "220px" }}
          >
            <option value="TUTTI">Tutti gli eventi</option>
            {eventi.map((e) => (
              <option key={e.eventoId} value={e.eventoId}>
                {e.titolo}
              </option>
            ))}
          </Form.Select>
        </div>

        {recensioniFiltrate.length === 0 && (
          <p className="text-muted text-center">Nessuna recensione trovata per il filtro selezionato.</p>
        )}

        {recensioniFiltrate.map((rec) => (
          <Card
            key={rec.id}
            className="mb-3 shadow-sm recensione-card"
            style={{ transition: "transform 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <h5 className="mb-1">
                    Evento: <strong>{rec.titoloEvento}</strong>
                  </h5>
                  <p className="mb-1 text-muted">Da: {rec.autore}</p>
                </div>
                <div className="text-end">{renderStelle(rec.voto)}</div>
              </div>
              <p className="mb-2">{rec.contenuto}</p>
              <small className="text-muted">{new Date(rec.data).toLocaleDateString("it-IT")}</small>
            </Card.Body>
          </Card>
        ))}
      </Container>
    </div>
  );
};

export default RecensioniLocale;
