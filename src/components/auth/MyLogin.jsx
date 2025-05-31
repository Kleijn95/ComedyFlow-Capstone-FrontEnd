import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { fetchLogin, fetchUserDetails } from "../../redux/actions";

const MyLogin = ({ inline, closeModal, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [erroreRuolo, setErroreRuolo] = useState(false);
  const [sollecitoInviato, setSollecitoInviato] = useState(false);
  const [tempoRimanente, setTempoRimanente] = useState("");
  const [mailNonVerificata, setMailNonVerificata] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(fetchLogin(formData.username, formData.password));
    if (result.success) {
      await dispatch(fetchUserDetails(localStorage.getItem("token"))); // 👈 qui recuperi i dati utente
      onSuccess?.(); // chiudi modale o reindirizza
    } else {
      setError(result.error);
      setErroreRuolo(result.ruoloNotApproved || false);
      setMailNonVerificata(result.mailNotVerified || false);
    }
  };

  const handleSollecito = async () => {
    try {
      const now = Date.now();
      localStorage.setItem("ultimoSollecito", now);
      const res = await fetch(`${apiUrl}/api/auth/sollecito-approvazione?username=${formData.username}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Errore HTTP");
      setSollecitoInviato(true);
    } catch (err) {
      alert("Errore nell'invio del sollecito.");
      console.error("Errore sollecito:", err);
    }
  };

  useEffect(() => {
    const ultimo = localStorage.getItem("ultimoSollecito");
    if (ultimo) {
      const diff = Date.now() - Number(ultimo);
      const tempoRimanenteMS = 12 * 60 * 60 * 1000 - diff;
      if (tempoRimanenteMS > 0) {
        setSollecitoInviato(true);
        aggiornaCountdown(tempoRimanenteMS);

        const interval = setInterval(() => {
          const newDiff = Date.now() - Number(ultimo);
          const newTempo = 12 * 60 * 60 * 1000 - newDiff;
          if (newTempo <= 0) {
            setSollecitoInviato(false);
            setTempoRimanente("");
            clearInterval(interval);
          } else {
            aggiornaCountdown(newTempo);
          }
        }, 60000);

        return () => clearInterval(interval);
      }
    }
  }, []);

  const aggiornaCountdown = (ms) => {
    const ore = Math.floor(ms / (1000 * 60 * 60));
    const minuti = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    setTempoRimanente(`Puoi riprovare tra ${ore}h ${minuti}m`);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
      </Form.Group>

      {erroreRuolo && (
        <div className="mt-2">
          <div className="alert alert-warning p-2">
            Il tuo ruolo avanzato non è stato ancora approvato dall'amministratore.
          </div>
          <Button variant="outline-warning" size="sm" onClick={handleSollecito} disabled={sollecitoInviato}>
            {sollecitoInviato ? "Sollecito già inviato ✅" : "Invia sollecito all'amministratore"}
          </Button>
          {sollecitoInviato && <div className="small text-muted mt-1">{tempoRimanente}</div>}
        </div>
      )}

      <Button type="submit" variant="primary mt-3">
        Accedi
      </Button>
    </Form>
  );
};

export default MyLogin;
