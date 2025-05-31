import { useEffect, useState } from "react";

const MieRecensioni = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [recensioni, setRecensioni] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetch(`${apiUrl}/recensioni/mie`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Errore caricamento recensioni")))
      .then(setRecensioni)
      .catch((err) => console.error(err));
  }, [apiUrl, token]);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const base = isoString.split(".")[0];
    return new Date(base).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h2>Le mie recensioni</h2>
      {recensioni.length === 0 ? (
        <p>Non hai ancora lasciato recensioni.</p>
      ) : (
        <ul className="list-group">
          {recensioni.map((r) => (
            <li key={r.id} className="list-group-item">
              <strong>{r.titoloEvento}</strong> - {r.tipo === "COMICO" ? "Recensione Comico" : "Recensione Locale"}
              <br />
              <span>Voto: {r.voto} ⭐</span>
              <br />
              <span>Contenuto: {r.contenuto}</span>
              <br />
              <small className="text-muted">Data: {formatDate(r.data)}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MieRecensioni;
