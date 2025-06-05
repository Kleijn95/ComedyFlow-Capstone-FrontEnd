// Login Form con stile ComedyFlow
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Button, CloseButton } from "react-bootstrap";
import { fetchLogin, fetchUserDetails } from "../../redux/actions";

const MyLogin = ({ inline, closeModal, onSuccess, openRegisterModal }) => {
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
      await dispatch(fetchUserDetails(localStorage.getItem("token")));
      onSuccess?.();
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
        <h4 className="text-center text-primary mb-4 fw-bold">Accedi a ComedyFlow</h4>

        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="rounded-pill px-3 py-2"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="rounded-pill px-3 py-2"
          />
        </Form.Group>

        {erroreRuolo && (
          <div className="mt-2">
            <div className="alert alert-warning rounded-3 p-2 small">
              Il tuo ruolo avanzato non è stato ancora approvato dall'amministratore.
            </div>
            <Button variant="outline-warning" size="sm" onClick={handleSollecito} disabled={sollecitoInviato}>
              {sollecitoInviato ? "Sollecito già inviato ✅" : "Invia sollecito"}
            </Button>
            {sollecitoInviato && <div className="small text-muted mt-1">{tempoRimanente}</div>}
          </div>
        )}

        {error && <div className="alert alert-danger mt-3 small">{error}</div>}

        <Button type="submit" className="btn-comedy-fill w-100 rounded-pill mt-3 py-2">
          Accedi
        </Button>

        <p className="mt-4 text-center small">
          Non hai un account?{" "}
          <span
            className="text-decoration-underline text-info fw-bold"
            style={{ cursor: "pointer" }}
            onClick={openRegisterModal}
          >
            Registrati
          </span>
        </p>
      </Form>
    </div>
  );
};

export default MyLogin;
