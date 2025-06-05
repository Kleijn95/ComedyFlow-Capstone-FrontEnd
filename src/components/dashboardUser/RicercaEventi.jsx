import { useEffect, useState, useRef } from "react";
import { Modal, Button, Form, Row, Col, Card, Badge } from "react-bootstrap";
import EventiUser from "./EventiUser";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";

const RicercaEventi = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const location = useLocation();

  const [eventi, setEventi] = useState([]);
  const [provincia, setProvincia] = useState("");
  const [comico, setComico] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [posti, setPosti] = useState(1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTest, setEmailTest] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [usaEmailLocale, setUsaEmailLocale] = useState(true);
  const [mostraPrenotazioni, setMostraPrenotazioni] = useState(false);
  const eventiUserRef = useRef(null);
  const [refreshPrenotazioni, setRefreshPrenotazioni] = useState(false);
  const userId = useSelector((state) => state.user.user?.id);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchEventi();
      fetchWishlist();
    }
  }, [page, userId]);

  const fetchEventi = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, size: 6, sortBy: "id,asc" });
    if (provincia) params.append("prov", provincia);
    if (comico) params.append("comico", comico);
    if (dataEvento) params.append("data", dataEvento);

    fetch(`${apiUrl}/eventi?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel recupero eventi");
        return res.json();
      })
      .then((data) => {
        setEventi(data.content || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${apiUrl}/wishlist?utenteId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore nel recupero wishlist");
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFiltro = () => {
    setPage(0);
    fetchEventi();
  };

  const handleReset = () => {
    setProvincia("");
    setComico("");
    setDataEvento("");
    setPage(0);
    fetchEventi();
  };

  const apriPrenotazione = (evento) => {
    setSelectedEvento(evento);
    setPosti(1);
    setShowModal(true);
  };

  const confermaPrenotazione = async () => {
    if (!selectedEvento) return;
    try {
      const res = await fetch(`${apiUrl}/prenotazioni/evento/${selectedEvento.id}?numeroPosti=${posti}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore nella prenotazione");
      alert("Prenotazione effettuata!");
      setShowModal(false);
      setRefreshPrenotazioni((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert("Errore durante la prenotazione");
    }
  };

  const isComicoInWishlist = (comicoId) => wishlist.some((item) => item.comicoId === comicoId);

  const toggleComicoWishlist = async (comicoId) => {
    if (!comicoId) return;
    const presente = isComicoInWishlist(comicoId);
    const url = `${apiUrl}/wishlist/comico/${comicoId}?utenteId=${userId}`;
    try {
      await fetch(url, {
        method: presente ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist();
    } catch (err) {
      console.error("Errore wishlist comico", err);
    }
  };

  const inviaEmailAlLocale = async () => {
    if (!selectedEvento || !messaggio) return alert("Compila tutti i campi.");
    const destinatario = usaEmailLocale ? selectedEvento.emailLocale : emailTest;
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

  const isInWishlist = (eventoId) => wishlist.some((item) => item.eventoId === eventoId);

  const toggleWishlist = async (eventoId) => {
    const presente = isInWishlist(eventoId);
    const url = `${apiUrl}/wishlist/evento/${eventoId}?utenteId=${userId}`;
    try {
      await fetch(url, {
        method: presente ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist();
    } catch (err) {
      console.error("Errore wishlist", err);
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="outline-dark"
          className="d-none d-xxl-block"
          onClick={() => setMostraPrenotazioni(!mostraPrenotazioni)}
        >
          {mostraPrenotazioni ? "Nascondi le tue prenotazioni" : "Vedi le tue prenotazioni"}
        </Button>
      </div>

      <Row>
        {mostraPrenotazioni && (
          <Col md={3} className="bg-light border-end" style={{ height: "85vh", overflowY: "auto" }}>
            <h5 className="mt-3 px-3">Le tue prenotazioni</h5>
            <div className="px-3">
              <EventiUser key={refreshPrenotazioni} isSidebar={true} />
            </div>
          </Col>
        )}

        <Col md={mostraPrenotazioni ? 9 : 12}>
          <h2 className="mb-4 fw-bold">Ricerca Eventi</h2>
          <div className="d-flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Provincia"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              className="form-control w-auto"
            />
            <input
              type="text"
              placeholder="Comico"
              value={comico}
              onChange={(e) => setComico(e.target.value)}
              className="form-control w-auto"
            />
            <input
              type="date"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              className="form-control w-auto"
            />
            <Button variant="primary" onClick={handleFiltro}>
              Filtra
            </Button>
            <Button variant="outline-secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {loading ? (
            <p>Caricamento...</p>
          ) : eventi.length === 0 ? (
            <p>Nessun evento trovato.</p>
          ) : (
            <Row xs={1} md={2} className="g-4">
              {eventi.map((evento) => (
                <Col key={evento.id}>
                  <Card className="shadow-sm h-100">
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-start">
                        <span>{evento.titolo}</span>
                        <Button variant="link" onClick={() => toggleWishlist(evento.id)} title="Aggiungi ai preferiti">
                          {isInWishlist(evento.id) ? "❤️" : "🤍"}
                        </Button>
                      </Card.Title>
                      <Card.Text>{evento.descrizione}</Card.Text>
                      <Badge bg="info" className="mb-2">
                        {new Date(evento.dataOra).toLocaleString("it-IT")}
                      </Badge>
                      <Card.Text>
                        <strong>Luogo:</strong> {evento.nomeLocale} - {evento.provincia}
                      </Card.Text>
                      <Card.Text>
                        <strong>Comico:</strong> {evento.nomeComico}{" "}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => toggleComicoWishlist(evento.comicoId)}
                        >
                          {isComicoInWishlist(evento.comicoId) ? "❤️" : "🤍"}
                        </Button>
                      </Card.Text>
                      <Card.Text>
                        <strong>Posti:</strong> {evento.numeroPostiDisponibili} / {evento.numeroPostiTotali}
                      </Card.Text>
                      <div className="d-flex flex-wrap gap-2">
                        {new Date(evento.dataOra) > new Date() && (
                          <Button variant="success" size="sm" onClick={() => apriPrenotazione(evento)}>
                            Prenota
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedEvento(evento);
                            setShowEmailModal(true);
                          }}
                        >
                          Contatta ✉️
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
            <Button variant="outline-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Indietro
            </Button>
            <span>
              Pagina {page + 1} di {totalPages}
            </span>
            <Button variant="outline-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Avanti →
            </Button>
          </div>
        </Col>
      </Row>

      {/* MODALE PRENOTAZIONE */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Prenota per {selectedEvento?.titolo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Numero posti (max 5):</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={5}
            value={posti}
            onChange={(e) => setPosti(Number(e.target.value))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annulla
          </Button>
          <Button variant="success" onClick={confermaPrenotazione}>
            Conferma
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODALE EMAIL */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contatta il locale - {selectedEvento?.nomeLocale}</Modal.Title>
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
                Email del locale: <strong>{selectedEvento?.emailLocale || "non disponibile"}</strong>
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
    </div>
  );
};

export default RicercaEventi;
