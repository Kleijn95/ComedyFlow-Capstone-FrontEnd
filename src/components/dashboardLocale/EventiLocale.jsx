import React, { useEffect, useState } from "react";
import { Button, Container, Form, Card, Modal } from "react-bootstrap";
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [eventoDaAnnullare, setEventoDaAnnullare] = useState(null);

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
    try {
      const res = await fetch(`${apiUrl}/eventi/${id}/annulla`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  const getBadgeClass = (stato) => {
    switch (stato) {
      case "IN_PROGRAMMA":
        return "bg-primary";
      case "TERMINATO":
        return "bg-secondary";
      case "ANNULLATO":
        return "bg-danger";
      default:
        return "bg-light text-dark";
    }
  };

  return (
    <div className="eventi-bg">
      <Container className="eventi-wrapper">
        <h2 className="text-center fw-bold mb-4">Gestisci i tuoi eventi</h2>

        {error && <p className="text-danger text-center">{error}</p>}

        <Form.Group className="mb-4 text-center">
          <Form.Select
            className="form-select-lg w-auto mx-auto"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="TUTTI">Tutti</option>
            <option value="IN_PROGRAMMA">In programma</option>
            <option value="TERMINATO">Terminato</option>
            <option value="ANNULLATO">Annullato</option>
          </Form.Select>
        </Form.Group>

        {eventiFiltrati.length === 0 ? (
          <p className="text-center text-muted">Nessun evento trovato.</p>
        ) : (
          eventiFiltrati.map((evento) => (
            <div key={evento.id} className="evento-card">
              <h5 className="fw-bold">{evento.titolo}</h5>
              <div className="text-muted small">
                {new Date(evento.dataOra).toLocaleString("it-IT")}
                {" • "}
                <span className={`badge ${getBadgeClass(evento.stato)} ms-2`}>{evento.stato}</span>
              </div>
              <p className="mt-2">{evento.descrizione}</p>
              <ul className="mb-2">
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

              <div className="d-flex flex-wrap gap-2 mt-3">
                {evento.stato === "IN_PROGRAMMA" && new Date(evento.dataOra) > new Date() && (
                  <>
                    <Button variant="outline-primary" onClick={() => handleEdit(evento)} className="btn-action">
                      ✏️ Modifica
                    </Button>
                    <Button
                      variant="outline-warning"
                      onClick={() => {
                        setEventoDaAnnullare(evento);
                        setShowConfirmDelete(true);
                      }}
                      className="btn-action"
                    >
                      ❌ Annulla
                    </Button>
                  </>
                )}

                <Button variant="outline-danger" onClick={() => setShowContattaAdmin(true)} className="btn-action">
                  🛠️ Contatta Admin
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() =>
                    navigate(
                      `/dashboardLocale/partecipanti?eventoId=${evento.id}&titolo=${encodeURIComponent(evento.titolo)}`
                    )
                  }
                  className="btn-action"
                >
                  👥 Partecipanti
                </Button>
              </div>
            </div>
          ))
        )}

        {/* Modifica Evento */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>✏️ Modifica evento</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-white">
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
          <Modal.Footer className="bg-light d-flex justify-content-between align-items-center">
            <small className="text-muted">📧 Verrà inviata una mail a comico e spettatori.</small>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Chiudi
              </Button>
              <Button variant="success" onClick={handleEditSubmit}>
                Salva
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Contatta Admin */}
        <Modal show={showContattaAdmin} onHide={() => setShowContattaAdmin(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>📩 Contatta l'amministratore</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-white">
            <p>
              Se hai bisogno di <strong>cancellare</strong> o <strong>riattivare</strong> un evento, scrivi una
              richiesta all'amministratore.
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
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowContattaAdmin(false)}>
              Chiudi
            </Button>
            <Button variant="primary" onClick={handleContattaAdmin}>
              Invia richiesta
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
          <Modal.Header closeButton className="bg-warning-subtle">
            <Modal.Title>Conferma annullamento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Sei sicuro di voler <strong>annullare</strong> l'evento <strong>{eventoDaAnnullare?.titolo}</strong>?
              <br />
              Verrà inviata una mail agli spettatori e al comico.
            </p>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
              Annulla
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                handleAnnulla(eventoDaAnnullare.id);
                setShowConfirmDelete(false);
              }}
            >
              Conferma annullamento
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default EventiLocale;
