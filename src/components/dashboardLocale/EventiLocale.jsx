import React, { useEffect, useState } from "react";
import { Button, Container, Form, Card, Modal, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

const EventiLocale = () => {
  const user = useSelector((state) => state.user.user);
  const apiUrl = import.meta.env.VITE_API_URL;

  const [eventi, setEventi] = useState([]);
  const [filtro, setFiltro] = useState("TUTTI");
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [comici, setComici] = useState([]);
  const [showContattaAdmin, setShowContattaAdmin] = useState(false);
  const [messaggioAdmin, setMessaggioAdmin] = useState("");
  const navigate = useNavigate();

  const fetchEventi = async () => {
    try {
      const res = await fetch(`${apiUrl}/eventi?localeId=${user.id}&page=0&size=100`);
      const data = await res.json();
      setEventi(data.content || []);
    } catch (err) {
      setError("Errore nel caricamento degli eventi");
    }
  };

  const fetchComici = async () => {
    const res = await fetch(`${apiUrl}/comici`);
    const data = await res.json();
    setComici(data);
  };

  useEffect(() => {
    if (user?.id) {
      fetchEventi();
      fetchComici();
    }
  }, [user]);

  const handleAnnulla = async (id) => {
    if (!window.confirm("L'evento verrà annullato. Una mail sarà inviata agli spettatori e al comico. Confermi?"))
      return;

    try {
      const res = await fetch(`${apiUrl}/eventi/${id}/annulla`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error();
      fetchEventi();
    } catch {
      alert("Errore nell'annullamento dell'evento");
    }
  };

  const handleEdit = (evento) => {
    setSelectedEvento({ ...evento });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`${apiUrl}/eventi/${selectedEvento.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          titolo: selectedEvento.titolo,
          dataOra: selectedEvento.dataOra,
          descrizione: selectedEvento.descrizione,
          numeroPostiTotali: selectedEvento.numeroPostiTotali,
          numeroPostiDisponibili: selectedEvento.numeroPostiDisponibili,
          localeId: selectedEvento.localeId,
          comicoId: selectedEvento.comicoId,
        }),
      });
      if (!res.ok) throw new Error();
      setShowEditModal(false);
      fetchEventi();
      alert("Modifica salvata. Verrà inviata una mail agli spettatori e al comico.");
    } catch {
      alert("Errore nella modifica");
    }
  };

  const handleContattaAdmin = async () => {
    try {
      const res = await fetch(`${apiUrl}/email/contatta-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ messaggio: messaggioAdmin }),
      });

      if (!res.ok) throw new Error();
      setShowContattaAdmin(false);
      setMessaggioAdmin("");
      alert("Richiesta inviata all'amministratore.");
    } catch {
      alert("Errore nell'invio della richiesta.");
    }
  };

  const eventiFiltrati = filtro === "TUTTI" ? eventi : eventi.filter((ev) => ev.stato === filtro);

  return (
    <Container className="py-4">
      <h2>I tuoi eventi</h2>
      {error && <p className="text-danger">{error}</p>}

      <Form.Group className="mb-3">
        <Form.Label>Filtra per stato</Form.Label>
        <Form.Select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="TUTTI">Tutti</option>
          <option value="IN_PROGRAMMA">In programma</option>
          <option value="TERMINATO">Terminato</option>
          <option value="ANNULLATO">Annullato</option>
        </Form.Select>
      </Form.Group>

      {eventiFiltrati.map((evento) => (
        <Card key={evento.id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>{evento.titolo}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{new Date(evento.dataOra).toLocaleString()}</Card.Subtitle>
            <Badge bg={evento.stato === "ANNULLATO" ? "danger" : "info"} className="mb-2">
              {evento.stato}
            </Badge>
            <Card.Text>{evento.descrizione}</Card.Text>
            <ul>
              <li>
                <strong>Comico:</strong> {evento.nomeComico}
              </li>
              <li>
                <strong>Posti:</strong> {evento.numeroPostiDisponibili}/{evento.numeroPostiTotali}
              </li>
              <li>
                <strong>Indirizzo:</strong> {evento.viaLocale} - {evento.comuneNome}
              </li>
              <li>
                <strong>Email locale:</strong> {evento.emailLocale}
              </li>
            </ul>
            <div className="d-flex gap-2 mt-3">
              {evento.stato !== "ANNULLATO" && (
                <>
                  <Button variant="outline-primary" onClick={() => handleEdit(evento)}>
                    Modifica
                  </Button>
                  <Button variant="outline-warning" onClick={() => handleAnnulla(evento.id)}>
                    Annulla
                  </Button>
                </>
              )}
              <Button variant="outline-danger" onClick={() => setShowContattaAdmin(true)}>
                Contatta Admin
              </Button>
              <Button
                variant="outline-success"
                onClick={() =>
                  navigate(
                    `/dashboardLocale/partecipanti?eventoId=${evento.id}&titolo=${encodeURIComponent(evento.titolo)}`
                  )
                }
              >
                Visualizza partecipanti
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvento && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Titolo</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedEvento.titolo}
                  onChange={(e) => setSelectedEvento({ ...selectedEvento, titolo: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Data e ora</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={selectedEvento.dataOra?.slice(0, 16)}
                  onChange={(e) => setSelectedEvento({ ...selectedEvento, dataOra: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedEvento.descrizione}
                  onChange={(e) => setSelectedEvento({ ...selectedEvento, descrizione: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Posti Totali</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedEvento.numeroPostiTotali}
                  onChange={(e) =>
                    setSelectedEvento({ ...selectedEvento, numeroPostiTotali: parseInt(e.target.value) })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Posti Disponibili</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedEvento.numeroPostiDisponibili}
                  onChange={(e) =>
                    setSelectedEvento({ ...selectedEvento, numeroPostiDisponibili: parseInt(e.target.value) })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Comico</Form.Label>
                <Form.Select
                  value={selectedEvento.comicoId}
                  onChange={(e) => setSelectedEvento({ ...selectedEvento, comicoId: parseInt(e.target.value) })}
                >
                  <option value="">-- Seleziona un comico --</option>
                  {comici.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.cognome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <p className="me-auto text-muted small">📧 Sarà inviata una mail al comico e agli spettatori.</p>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annulla
          </Button>
          <Button variant="success" onClick={handleEditSubmit}>
            Salva
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showContattaAdmin} onHide={() => setShowContattaAdmin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contatta l'amministratore</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Se hai bisogno di <strong>cancellare</strong> o <strong>riattivare</strong> un evento, scrivi una richiesta
            all'amministratore.
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Messaggio</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Es. Vorrei riattivare l'evento annullato per errore..."
                value={messaggioAdmin}
                onChange={(e) => setMessaggioAdmin(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleContattaAdmin}>
              Invia richiesta
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EventiLocale;
