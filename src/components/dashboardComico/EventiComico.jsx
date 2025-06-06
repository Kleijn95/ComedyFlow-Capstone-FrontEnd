import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Container, Spinner, Button, Form, Modal } from "react-bootstrap";

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
        const res = await fetch(`${apiUrl}/eventi?comicoId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Errore nel recupero degli eventi");
        const data = await res.json();
        setEventi(data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchEventi();
  }, [user, apiUrl, token]);

  const eventiFiltrati = eventi.filter((e) => (filtroStato === "TUTTI" ? true : e.stato === filtroStato));

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const inviaEmailAlLocale = async () => {
    if (!eventoSelezionato || !messaggio) return alert("Compila tutti i campi.");
    const destinatario = usaEmailLocale ? eventoSelezionato.emailLocale : emailTest;
    if (!destinatario) return alert("Email destinatario non valida.");
    try {
      const res = await fetch(`${apiUrl}/email/contatta-locale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emailLocale: destinatario, messaggio }),
      });
      if (!res.ok) throw new Error("Errore invio email");
      alert("Email inviata con successo!");
      setShowEmailModal(false);
      setEmailTest("");
      setMessaggio("");
      setUsaEmailLocale(true);
    } catch (err) {
      alert("Errore nell'invio dell'email");
    }
  };

  const renderEvento = (evento) => (
    <li key={evento.id} className="evento-card">
      <strong>{evento.titolo}</strong>
      <div className={`badge-custom ${evento.stato.toLowerCase()}`}>{evento.stato}</div>
      <div className="small text-muted">Data evento: {formatDate(evento.dataOra)}</div>
      <div className="mb-1">
        Luogo: {evento.nomeLocale} ({evento.comuneNome})
      </div>
      <div className="mb-1">
        Posti: {evento.numeroPostiDisponibili} / {evento.numeroPostiTotali}
      </div>
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
    </li>
  );

  return (
    <div className="eventi-bg">
      <div className="eventi-wrapper">
        <h2 className="text-center fw-bold mb-4">I tuoi eventi, {user?.nome}!</h2>
        <div className="mb-4">
          <Form.Select value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)}>
            <option value="TUTTI">Tutti</option>
            <option value="IN_PROGRAMMA">In programma</option>
            <option value="TERMINATO">Terminato</option>
            <option value="ANNULLATO">Annullato</option>
          </Form.Select>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : eventiFiltrati.length === 0 ? (
          <p className="text-muted">Nessun evento trovato.</p>
        ) : (
          <ul className="lista-eventi">{eventiFiltrati.map(renderEvento)}</ul>
        )}
      </div>

      {/* Modal email */}
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
                checked={!usaEmailLocale}
                onChange={() => setUsaEmailLocale(false)}
              />
              <label className="form-check-label" htmlFor="usaTest">
                Inserisci email alternativa
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
    </div>
  );
}
