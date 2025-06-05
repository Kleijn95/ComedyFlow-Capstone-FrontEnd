import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import { LOGOUT } from "../../redux/actions";

const CredenzialiForm = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isComico = user?.appUser?.roles?.includes("ROLE_COMICO");
  const isLocale = user?.appUser?.roles?.includes("ROLE_LOCALE");
  const endpoint = isComico ? "comici" : isLocale ? "locali" : "spettatori";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    setMessage("");
    setError("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Inserisci la nuova password e confermala");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Le nuove password non coincidono");
      return;
    }

    try {
      const payload = {
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        avatar: user.avatar,
        username: user.appUser.username,
        password: formData.newPassword,
        ...(isComico && { bio: user.bio }),
        ...(isLocale && {
          nomeLocale: user.nomeLocale,
          descrizione: user.descrizione,
          via: user.via,
          comuneId: user.comune?.id,
        }),
      };

      const res = await fetch(`${apiUrl}/${endpoint}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Errore nell'aggiornamento");

      setMessage("Password aggiornata con successo! Verrai reindirizzato alla homepage...");
      setTimeout(() => {
        localStorage.removeItem("token");
        dispatch({ type: LOGOUT });
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Errore durante l'aggiornamento della password");
    }
  };

  return (
    <Card className="shadow-sm p-4">
      <Card.Title className="mb-3">Modifica Password</Card.Title>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Nuova Password</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Inserisci la nuova password"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Conferma Nuova Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Ripeti la nuova password"
          />
        </Form.Group>

        <div className="d-flex justify-content-center">
          <Button variant="warning" onClick={handleUpdate}>
            Cambia Password
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CredenzialiForm;
