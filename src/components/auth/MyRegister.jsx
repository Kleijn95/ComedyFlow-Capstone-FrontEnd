import React, { useState } from "react";
import { Button, CloseButton, Form } from "react-bootstrap";

function MyRegister({ inline = false, closeModal }) {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    avatar: "",
    username: "",
    password: "",
    ruoloRichiesto: "ROLE_SPETTATORE",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        if (res.status === 403 && data.message === "Accesso negato") {
          throw new Error("Email già in uso");
        }
        if (res.status === 400 && data.message?.toLowerCase().includes("username")) {
          throw new Error("Username già in uso");
        }
        throw new Error(data.message || "Errore nella registrazione");
      }

      setSuccess(true);
      if (inline && typeof closeModal === "function") {
        setTimeout(() => closeModal(), 1000);
      }
    } catch (err) {
      setError(err.message || "Registrazione fallita");
    }
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        onClick={closeModal}
        className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm border"
        style={{ zIndex: 10 }}
      >
        <CloseButton size={22} />
      </button>

      <Form onSubmit={handleSubmit} className="bg-white p-4 rounded-4 shadow-sm border border-light-subtle mt-4">
        <h4 className="text-center text-primary mb-4 fw-bold">Registrati su ComedyFlow</h4>

        {error && <div className="alert alert-danger small">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Registrazione completata! Controlla la mail per verificare l'indirizzo. Se hai richiesto un ruolo avanzato,
            attendi l'approvazione da parte dell'amministratore.
          </div>
        )}

        {["nome", "cognome", "email", "username", "password"].map((field) => (
          <Form.Group className="mb-3" key={field}>
            <Form.Label className="text-capitalize">{field}</Form.Label>
            <Form.Control
              type={field === "password" ? "password" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              className="rounded-pill px-3 py-2"
            />
          </Form.Group>
        ))}

        <Form.Group className="mb-3">
          <Form.Label>Ruolo</Form.Label>
          <Form.Select
            name="ruoloRichiesto"
            value={formData.ruoloRichiesto}
            onChange={handleChange}
            required
            className="rounded-pill px-3 py-2"
          >
            <option value="ROLE_SPETTATORE">Spettatore</option>
            <option value="ROLE_COMICO">Comico</option>
            <option value="ROLE_LOCALE">Locale</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" className="btn-comedy-fill w-100 rounded-pill py-2">
          Registrati
        </Button>

        {!inline && (
          <p className="mt-4 text-center small">
            Hai già un account?{" "}
            <span
              className="text-decoration-underline text-info fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() => window.location.assign("/login")}
            >
              Torna al login
            </span>
          </p>
        )}
      </Form>
    </div>
  );
}

export default MyRegister;
