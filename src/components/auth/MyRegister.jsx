import React, { useState } from "react";
import { Button } from "react-bootstrap";

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
    <div>
      <h2 className="text-center">Registrati</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <div className="alert alert-success">
          Registrazione completata! Controlla la mail per verificare l'indirizzo. Se hai richiesto un ruolo avanzato,
          attendi l'approvazione da parte dell'amministratore.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {["nome", "cognome", "email", "username", "password"].map((field) => (
          <div key={field} className="my-2">
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="form-control"
              value={formData[field]}
              onChange={handleChange}
              required={field !== "avatar"}
            />
          </div>
        ))}

        <div className="my-2">
          <select
            name="ruoloRichiesto"
            className="form-control"
            value={formData.ruoloRichiesto}
            onChange={handleChange}
            required
          >
            <option value="ROLE_SPETTATORE">Spettatore</option>
            <option value="ROLE_COMICO">Comico</option>
            <option value="ROLE_LOCALE">Locale</option>
          </select>
        </div>

        <div className="d-flex justify-content-between my-2">
          <Button type="submit" variant="outline-success">
            Registrati
          </Button>
          {!inline && (
            <Button variant="outline-secondary" onClick={() => window.location.assign("/login")}>
              Torna al login
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MyRegister;
