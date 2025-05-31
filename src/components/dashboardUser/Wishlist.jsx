import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Row, Col, Modal, Form } from "react-bootstrap";

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

      // carica eventi per i comici salvati
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
    <div className="container py-4">
      <h2 className="mb-4">La tua Wishlist</h2>

      <h4>Eventi salvati</h4>
      {eventi.length === 0 ? (
        <p>Nessun evento salvato.</p>
      ) : (
        <Row className="mb-5">
          {eventi.map((e) => (
            <Col md={6} key={e.id} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{e.titoloEvento}</Card.Title>
                  <Button variant="outline-danger" size="sm" onClick={() => toggleWishlist({ eventoId: e.eventoId })}>
                    ❤️ Rimuovi
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <h4>Comici seguiti</h4>
      {comici.length === 0 ? (
        <p>Nessun comico seguito.</p>
      ) : (
        comici.map((c) => (
          <div key={c.id} className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h5>{c.nomeComico}</h5>
              <Button variant="outline-danger" size="sm" onClick={() => toggleWishlist({ comicoId: c.comicoId })}>
                ❤️ Rimuovi
              </Button>
            </div>
            {eventiComico[c.comicoId]?.length > 0 ? (
              <ul className="list-group mt-2">
                {eventiComico[c.comicoId].map((ev) => (
                  <li key={ev.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{ev.titolo}</strong> - {new Date(ev.dataOra).toLocaleDateString("it-IT")}
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        setSelectedEvento(ev);
                        setPosti(1);
                        setShowModal(true);
                      }}
                    >
                      Prenota
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Nessun evento futuro di questo comico.</p>
            )}
          </div>
        ))
      )}

      {/* MODALE */}
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
    </div>
  );
};

export default Wishlist;
