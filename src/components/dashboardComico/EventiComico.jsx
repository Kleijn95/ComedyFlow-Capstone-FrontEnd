import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, Container, Spinner, Button, Form, Modal } from "react-bootstrap";

export default function EventiComico() {
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState("TUTTI");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTest, setEmailTest] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [usaEmailLocale, setUsaEmailLocale] = useState(true);
  const [eventoSelezionato, setEventoSelezionato] = useState(null);

  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEventi = async () => {
      try {
        const response = await fetch(`${apiUrl}/eventi?comicoId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Errore nel recupero degli eventi");
        const data = await response.json();
        setEventi(data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchEventi();
  }, [user, apiUrl, token]);

  const eventiFiltrati = eventi.filter((evento) => {
    if (filtroStato === "TUTTI") return true;
    return evento.stato === filtroStato;
  });

  const inviaEmailAlLocale = async () => {
    if (!eventoSelezionato || !messaggio) {
      alert("Compila tutti i campi.");
      return;
    }
    const destinatario = usaEmailLocale ? eventoSelezionato.emailLocale : emailTest;
    if (!destinatario) {
      alert("Email destinatario non valida.");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/email/contatta-locale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emailLocale: destinatario, messaggio }),
      });
      if (!res.ok) throw new Error("Errore durante l'invio dell'email");
      alert("Email inviata con successo!");
      setShowEmailModal(false);
      setEmailTest("");
      setMessaggio("");
      setUsaEmailLocale(true);
    } catch (err) {
      console.error(err);
      alert("Errore nell'invio dell'email");
    }
  };

  return (
    <Container className="py-4">
      <h2>I miei eventi</h2>

      <Form.Group className="mb-3">
        <Form.Label>Filtra per stato:</Form.Label>
        <Form.Select value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)}>
          <option value="TUTTI">Tutti</option>
          <option value="IN_PROGRAMMA">In programma</option>
          <option value="TERMINATO">Terminato</option>
          <option value="ANNULLATO">Annullato</option>
        </Form.Select>
      </Form.Group>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : eventiFiltrati.length === 0 ? (
        <p className="text-muted">Nessun evento trovato.</p>
      ) : (
        eventiFiltrati.map((evento) => (
          <Card key={evento.id} className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>{evento.titolo}</Card.Title>
              <Card.Text>
                <strong>Data:</strong> {new Date(evento.dataOra).toLocaleString("it-IT")}
                <br />
                <strong>Luogo:</strong> {evento.nomeLocale} ({evento.comuneNome})<br />
                <strong>Posti:</strong> {evento.numeroPostiDisponibili} / {evento.numeroPostiTotali}
                <br />
                <strong>Stato:</strong>{" "}
                <span
                  className={`badge ${
                    evento.stato === "TERMINATO"
                      ? "bg-secondary"
                      : evento.stato === "ANNULLATO"
                      ? "bg-danger"
                      : "bg-success"
                  }`}
                >
                  {evento.stato}
                </span>
                <br />
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setEventoSelezionato(evento);
                    setShowEmailModal(true);
                  }}
                >
                  Contatta locale ✉️
                </Button>
              </Card.Text>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contatta il locale - {eventoSelezionato?.nomeLocale}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Destinatario</Form.Label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="usaLocale"
                name="emailChoice"
                checked={usaEmailLocale}
                onChange={() => setUsaEmailLocale(true)}
              />
              <label className="form-check-label" htmlFor="usaLocale">
                Email del locale: <strong>{eventoSelezionato?.emailLocale || "non disponibile"}</strong>
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="radio"
                id="usaTest"
                name="emailChoice"
                checked={!usaEmailLocale}
                onChange={() => setUsaEmailLocale(false)}
              />
              <label className="form-check-label" htmlFor="usaTest">
                Inserisci un’email alternativa
              </label>
            </div>
            {!usaEmailLocale && (
              <Form.Control
                type="email"
                placeholder="esempio@email.com"
                className="mt-2"
                value={emailTest}
                onChange={(e) => setEmailTest(e.target.value)}
              />
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Messaggio</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={messaggio}
              onChange={(e) => setMessaggio(e.target.value)}
              placeholder="Scrivi qui la tua richiesta..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Chiudi
          </Button>
          <Button variant="primary" onClick={inviaEmailAlLocale}>
            Invia email
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
