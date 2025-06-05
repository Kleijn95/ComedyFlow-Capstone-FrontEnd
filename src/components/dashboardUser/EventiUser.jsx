import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Calendar from "react-calendar";

const EventiUser = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [eventi, setEventi] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newPosti, setNewPosti] = useState(1);
  const [filtroStato, setFiltroStato] = useState("TUTTI");
  const [recensioni, setRecensioni] = useState({});
  const [view, setView] = useState("LISTA");
  const [selectedDate, setSelectedDate] = useState(null);
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.user.user);

  const capitalize = (str) => str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const updateRecensione = (eventoId, tipo, campo, valore) => {
    const key = `${eventoId}-${tipo}`;
    setRecensioni((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [campo]: valore,
      },
    }));
  };

  const handleRecensioneSubmit = async (eventoId, tipo) => {
    const key = `${eventoId}-${tipo}`;
    const contenuto = recensioni[key]?.contenuto || "";
    const voto = recensioni[key]?.voto || 5;

    try {
      const res = await fetch(`${apiUrl}/recensioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventoId, contenuto, voto, tipo }),
      });

      if (!res.ok) throw new Error("Errore nell'invio della recensione");

      setRecensioni((prev) => ({
        ...prev,
        [key]: { contenuto: "", voto: 5, inviata: true },
      }));

      alert(`Recensione ${tipo.toLowerCase()} inviata con successo!`);
    } catch (err) {
      alert("Errore: " + err.message);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetch(`${apiUrl}/prenotazioni/mie`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Errore prenotazioni")))
      .then(setEventi)
      .catch(console.error);

    fetch(`${apiUrl}/recensioni/mie`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Errore recensioni")))
      .then((data) => {
        const map = {};
        data.forEach((r) => {
          const eventoId = r.eventoId ?? r.evento?.id;
          const key = `${eventoId}-${r.tipo}`;
          map[key] = { contenuto: r.contenuto, voto: r.voto, inviata: true };
        });
        setRecensioni(map);
      })
      .catch(console.error);
  }, [apiUrl, token]);

  const annullaPrenotazione = (id) => {
    if (!window.confirm("Sei sicuro di voler annullare la prenotazione?")) return;
    fetch(`${apiUrl}/prenotazioni/annulla/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setEventi((prev) => prev.filter((e) => e.id !== id));
      })
      .catch(() => alert("Errore durante l'annullamento"));
  };

  const modificaPrenotazione = (id) => {
    if (newPosti < 1 || newPosti > 5) return alert("Posti tra 1 e 5.");
    fetch(`${apiUrl}/prenotazioni/modifica/${id}?nuovoNumeroPosti=${newPosti}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setEventi((prev) => prev.map((e) => (e.id === id ? { ...e, numeroPostiPrenotati: newPosti } : e)));
        setEditingId(null);
      })
      .catch(() => alert("Errore nella modifica"));
  };

  const eventiFiltrati = eventi.filter((e) => filtroStato === "TUTTI" || e.statoEvento === filtroStato);

  const eventiPerData = eventi.reduce((acc, ev) => {
    const date = new Date(ev.dataOraEvento).toDateString();
    acc[date] = acc[date] ? [...acc[date], ev] : [ev];
    return acc;
  }, {});

  const eventiDelGiorno = selectedDate ? eventiPerData[selectedDate.toDateString()] || [] : [];

  const renderEvento = (evento) => {
    const prenotazioneId = evento.id;
    const eventoId = evento.eventoId ?? evento.evento?.id;
    const keyComico = `${eventoId}-COMICO`;
    const keyLocale = `${eventoId}-LOCALE`;
    const giàRecensitoComico = recensioni[keyComico]?.inviata;
    const giàRecensitoLocale = recensioni[keyLocale]?.inviata;

    return (
      <li key={prenotazioneId} className="evento-card">
        <strong>{evento.titoloEvento} </strong>
        <div className={`badge-custom ${evento.statoEvento.toLowerCase()}`}>{evento.statoEvento}</div>
        <div className="small text-muted">Data evento: {formatDate(evento.dataOraEvento)}</div>
        <div className="small text-muted">Prenotato il: {formatDate(evento.dataOraPrenotazione)}</div>
        <div className="mb-2">Luogo: {evento.nomeLocale}</div>
        {evento.statoEvento === "TERMINATO" && (
          <div className="mt-3">
            <div className="border rounded p-2 mb-3 bg-light">
              <h6 className="text-success">Recensione Comico</h6>
              {giàRecensitoComico ? (
                <p className="text-muted">Hai già recensito il comico.</p>
              ) : (
                <>
                  <input
                    className="form-control mb-1"
                    placeholder="Scrivi qualcosa sul comico"
                    value={recensioni[keyComico]?.contenuto || ""}
                    onChange={(e) => updateRecensione(eventoId, "COMICO", "contenuto", e.target.value)}
                  />
                  <select
                    className="form-select w-auto"
                    value={recensioni[keyComico]?.voto || 5}
                    onChange={(e) => updateRecensione(eventoId, "COMICO", "voto", parseInt(e.target.value, 10))}
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        ⭐ {v}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-outline-success btn-sm mt-2"
                    onClick={() => handleRecensioneSubmit(eventoId, "COMICO")}
                  >
                    Invia recensione comico
                  </button>
                </>
              )}
            </div>
            <div className="border rounded p-2 bg-light">
              <h6 className="text-primary">Recensione Locale</h6>
              {giàRecensitoLocale ? (
                <p className="text-muted">Hai già recensito il locale.</p>
              ) : (
                <>
                  <input
                    className="form-control mb-1"
                    placeholder="Scrivi qualcosa sul locale"
                    value={recensioni[keyLocale]?.contenuto || ""}
                    onChange={(e) => updateRecensione(eventoId, "LOCALE", "contenuto", e.target.value)}
                  />
                  <select
                    className="form-select w-auto"
                    value={recensioni[keyLocale]?.voto || 5}
                    onChange={(e) => updateRecensione(eventoId, "LOCALE", "voto", parseInt(e.target.value, 10))}
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        ⭐ {v}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => handleRecensioneSubmit(eventoId, "LOCALE")}
                  >
                    Invia recensione locale
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {evento.statoEvento === "IN_PROGRAMMA" && (
          <div className="mt-2">
            Prenotati:{" "}
            {editingId === prenotazioneId ? (
              <>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newPosti}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setNewPosti(val);
                  }}
                  className="form-control d-inline w-auto me-2"
                />
                <button onClick={() => modificaPrenotazione(prenotazioneId)} className="btn btn-success btn-sm me-1">
                  Salva
                </button>
                <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">
                  Annulla
                </button>
              </>
            ) : (
              <>
                {evento.numeroPostiPrenotati}
                <button
                  onClick={() => {
                    setEditingId(prenotazioneId);
                    setNewPosti(evento.numeroPostiPrenotati);
                  }}
                  className="btn btn-warning btn-sm ms-2"
                >
                  Modifica
                </button>
              </>
            )}
            <br />
            <button className="btn btn-danger btn-sm mt-2" onClick={() => annullaPrenotazione(prenotazioneId)}>
              Annulla prenotazione
            </button>
          </div>
        )}{" "}
      </li>
    );
  };

  return (
    <div className="eventi-bg">
      <div className="eventi-wrapper">
        <h2 className="text-center fw-bold mb-4">Le tue prenotazioni, {capitalize(user?.nome)}!</h2>
        <div className="text-center mb-4">
          <button
            className="btn btn-outline-primary"
            onClick={() => setView(view === "LISTA" ? "CALENDARIO" : "LISTA")}
          >
            Visualizzazione: {view === "LISTA" ? "Calendario" : "Lista"}
          </button>
        </div>
        {view === "LISTA" ? (
          <ul className="lista-eventi">{eventiFiltrati.map(renderEvento)}</ul>
        ) : (
          <div className="calendar-container">
            <div className="calendar-box">
              <Calendar
                onClickDay={setSelectedDate}
                tileContent={({ date }) => {
                  const giorno = date.toDateString();
                  const eventiDelGiorno = eventiPerData[giorno];
                  return eventiDelGiorno ? (
                    <ul className="calendar-event-list">
                      {eventiDelGiorno.map((e) => (
                        <li key={e.id} className="calendar-event-item">
                          • {e.titoloEvento}
                        </li>
                      ))}
                    </ul>
                  ) : null;
                }}
              />
            </div>
            <div className="eventi-giorno">
              <h5 className="mb-3">Eventi del giorno</h5>
              {eventiDelGiorno.length === 0 ? (
                <p className="text-muted">Nessun evento per questo giorno.</p>
              ) : (
                <ul className="lista-eventi">{eventiDelGiorno.map(renderEvento)}</ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventiUser;
