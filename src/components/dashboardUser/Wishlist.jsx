import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Row, Col, Modal, Form, Container, ListGroup } from "react-bootstrap";

const Wishlist = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const userId = useSelector((state) => state.user.user?.id);

  const [wishlist, setWishlist] = useState([]);
  const [eventiComico, setEventiComico] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [posti, setPosti] = useState(1);

  useEffect(() => {
    if (userId) fetchWishlist();
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${apiUrl}/wishlist?utenteId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlist(data);

      const comiciSalvati = data.filter((w) => w.comicoId).map((w) => w.comicoId);
      comiciSalvati.forEach(async (id) => {
        const res = await fetch(`${apiUrl}/eventi?comicoId=${id}`);
        const data = await res.json();
        setEventiComico((prev) => ({ ...prev, [id]: data.content || [] }));
      });
    } catch (err) {
      console.error("Errore nel caricamento della wishlist", err);
    }
  };

  const toggleWishlist = async ({ eventoId, comicoId }) => {
    const url = eventoId
      ? `${apiUrl}/wishlist/evento/${eventoId}?utenteId=${userId}`
      : `${apiUrl}/wishlist/comico/${comicoId}?utenteId=${userId}`;
    try {
      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist();
    } catch (err) {
      console.error("Errore nella rimozione dalla wishlist", err);
    }
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
    } catch (err) {
      console.error(err);
      alert("Errore durante la prenotazione");
    }
  };

  const eventi = wishlist.filter((w) => w.eventoId);
  const comici = wishlist.filter((w) => w.comicoId);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">La tua Wishlist</h2>

      {/* Eventi salvati */}
      <h4 className="mb-3">Eventi salvati</h4>
      {eventi.length === 0 ? (
        <p className="text-muted">Nessun evento salvato.</p>
      ) : (
        <Row xs={1} md={2} className="g-4 mb-5">
          {eventi.map((e) => (
            <Col key={e.id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>{e.titoloEvento}</Card.Title>
                  <Card.Text>
                    <strong>Descrizione:</strong> {e.descrizioneEvento}
                    <br />
                    <strong>Data:</strong> {new Date(e.dataEvento).toLocaleString("it-IT")}
                    <br />
                    <strong>Posti disponibili:</strong> {e.postiDisponibili}
                    <br />
                    <strong>Stato:</strong> {e.statoEvento}
                    <br />
                    <strong>Comico:</strong> {e.nomeComico} {e.cognomeComico}
                    <br />
                    {e.avatarComico && (
                      <img src={e.avatarComico} alt="avatar comico" width={50} className="rounded-circle my-2" />
                    )}
                    <br />
                    <strong>Locale:</strong> {e.nomeLocale} ({e.indirizzoLocale})
                  </Card.Text>
                  <Button variant="outline-danger" size="sm" onClick={() => toggleWishlist({ eventoId: e.eventoId })}>
                    ❤️ Rimuovi
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Comici seguiti */}
      <h4 className="mb-3">Comici seguiti</h4>
      {comici.length === 0 ? (
        <p className="text-muted">Nessun comico seguito.</p>
      ) : (
        comici.map((c) => (
          <div key={c.id} className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">
                {c.nomeComico} {c.cognomeComico}
              </h5>
              <Button variant="outline-danger" size="sm" onClick={() => toggleWishlist({ comicoId: c.comicoId })}>
                ❤️ Rimuovi
              </Button>
            </div>
            {eventiComico[c.comicoId]?.length > 0 ? (
              <ListGroup>
                {eventiComico[c.comicoId].map((ev) => (
                  <ListGroup.Item key={ev.id} className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{ev.titolo}</strong> - {new Date(ev.dataOra).toLocaleDateString("it-IT")}
                      <br />
                      {ev.descrizione}
                      <br />
                      Posti disponibili: {ev.numeroPostiDisponibili}
                      <br />
                      Stato: {ev.stato}
                      <br />
                      <strong>Locale:</strong> {ev.nomeLocale}
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      className="ms-2"
                      onClick={() => {
                        setSelectedEvento(ev);
                        setPosti(1);
                        setShowModal(true);
                      }}
                    >
                      Prenota
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">Nessun evento futuro di questo comico.</p>
            )}
          </div>
        ))
      )}

      {/* Modale prenotazione */}
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
    </Container>
  );
};

export default Wishlist;
