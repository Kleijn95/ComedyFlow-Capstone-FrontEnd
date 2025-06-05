import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Container, Card } from "react-bootstrap";
import CredenzialiForm from "./CredenzialiForm";
import { fetchUserDetails, fetchComuni } from "../../redux/actions";

const MyProfile = () => {
  const user = useSelector((state) => state.user.user);
  const comuni = useSelector((state) => state.comuni);
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const isLocale = user?.appUser?.roles?.includes("ROLE_LOCALE");
  const isComico = user?.appUser?.roles?.includes("ROLE_COMICO");
  const endpointBase = isLocale ? "locali" : isComico ? "comici" : "spettatori";

  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    password: "",
    bio: "",
    nomeLocale: "",
    via: "",
    descrizione: "",
    comuneId: 0,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    dispatch(fetchComuni(token));
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    setFormData({
      nome: user.nome || "",
      cognome: user.cognome || "",
      email: user.email || "",
      password: "hidden-password",
      bio: user.bio || "",
      nomeLocale: user.nomeLocale || "",
      via: user.via || "",
      descrizione: user.descrizione || "",
      comuneId: user.comune?.id || 0,
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    const form = new FormData();
    form.append("file", selectedFile);

    try {
      const res = await fetch(`${apiUrl}/${endpointBase}/${user.id}/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error();
      alert("Avatar aggiornato!");
      dispatch(fetchUserDetails(token));
    } catch {
      alert("Errore upload avatar");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${apiUrl}/${endpointBase}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      alert("Profilo aggiornato!");
      dispatch(fetchUserDetails(token));
    } catch {
      alert("Errore salvataggio");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "750px" }}>
      <h3 className="mb-4 text-center">Modifica Profilo</h3>
      <Card className="shadow-sm p-4">
        <Form>
          {isLocale ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nome del locale</Form.Label>
                <Form.Control type="text" name="nomeLocale" value={formData.nomeLocale} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descrizione"
                  value={formData.descrizione}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Via</Form.Label>
                <Form.Control type="text" name="via" value={formData.via} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Comune</Form.Label>
                <Form.Select name="comuneId" value={formData.comuneId} onChange={handleChange}>
                  <option value={0}>-- Seleziona comune --</option>
                  {comuni.map((comune) => (
                    <option key={comune.id} value={comune.id}>
                      {comune.nome} ({comune.provinciaSigla})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
            </>
          ) : isComico ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cognome</Form.Label>
                <Form.Control type="text" name="cognome" value={formData.cognome} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Biografia</Form.Label>
                <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} />
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cognome</Form.Label>
                <Form.Control type="text" name="cognome" value={formData.cognome} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
            </>
          )}

          <div className="d-flex justify-content-center mt-3">
            <Button variant="primary" onClick={handleSave}>
              Salva modifiche
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="my-4 shadow-sm p-4">
        <Card.Title className="mb-3">Avatar</Card.Title>
        <Form.Group>
          <Form.Label>Carica immagine</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleFileUpload} />
        </Form.Group>
        <Button variant="secondary" className="mt-2" onClick={handleUploadAvatar}>
          Carica Avatar
        </Button>
      </Card>

      {user && <CredenzialiForm userId={user.id} usernameAttuale={user.appUser.username} />}
    </Container>
  );
};

export default MyProfile;
