import React, { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";

const CreaEvento = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [searchParams] = useSearchParams();
  const comicoId = searchParams.get("comicoId");

  const [comici, setComici] = useState([]);
  const [formData, setFormData] = useState({
    titolo: "",
    dataOra: "",
    descrizione: "",
    numeroPostiTotali: 0,
    comicoId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchComiciConValutazioni = async () => {
      try {
        const res = await fetch(`${apiUrl}/comici`);
        const comiciBase = await res.json();

        const comiciConMedia = await Promise.all(
          comiciBase.map(async (comico) => {
            try {
              const resRec = await fetch(`${apiUrl}/recensioni/comico/${comico.id}`);
              const recensioni = await resRec.json();

              const voti = recensioni.map((r) => r.voto);
              const media = voti.length > 0 ? voti.reduce((a, b) => a + b, 0) / voti.length : null;

              return { ...comico, mediaValutazioni: media };
            } catch {
              return { ...comico, mediaValutazioni: null };
            }
          })
        );

        setComici(comiciConMedia);

        // 👉 Se c'è un comicoId nei parametri, impostalo nel form
        if (comicoId) {
          setFormData((prev) => ({ ...prev, comicoId }));
        }
      } catch {
        setError("Errore nel caricamento dei comici");
      }
    };

    fetchComiciConValutazioni();
  }, [apiUrl, comicoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const eventoRequest = {
      titolo: formData.titolo,
      dataOra: formData.dataOra,
      descrizione: formData.descrizione,
      numeroPostiTotali: parseInt(formData.numeroPostiTotali),
      numeroPostiDisponibili: parseInt(formData.numeroPostiTotali),
      localeId: user?.id,
      comicoId: parseInt(formData.comicoId),
    };

    try {
      const res = await fetch(`${apiUrl}/eventi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(eventoRequest),
      });

      if (!res.ok) throw new Error("Errore nella creazione dell'evento");

      setSuccess(true);
      setTimeout(() => navigate("/dashboardLocale"), 1000);
    } catch (err) {
      setError(err.message || "Errore imprevisto");
    }
  };

  return (
    <Container className="py-4">
      <h2>Crea un nuovo evento</h2>
      {error && <p className="text-danger">{error}</p>}
      {success && <p className="text-success">Evento creato con successo!</p>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Titolo</Form.Label>
          <Form.Control type="text" name="titolo" value={formData.titolo} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Data e ora</Form.Label>
          <Form.Control
            type="datetime-local"
            name="dataOra"
            value={formData.dataOra}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descrizione</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descrizione"
            value={formData.descrizione}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Numero posti totali</Form.Label>
          <Form.Control
            type="number"
            name="numeroPostiTotali"
            value={formData.numeroPostiTotali}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Seleziona comico</Form.Label>
          <Form.Select name="comicoId" value={formData.comicoId || comicoId || ""} onChange={handleChange} required>
            <option value="">-- Seleziona un comico --</option>
            {comici.map((comico) => (
              <option key={comico.id} value={comico.id}>
                {comico.nome} {comico.cognome} - ⭐ {comico.mediaValutazioni?.toFixed(1) || "N.D."}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="success" type="submit">
          Crea evento
        </Button>
      </Form>
    </Container>
  );
};

export default CreaEvento;
