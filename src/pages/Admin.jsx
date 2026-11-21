import { customizationSummary } from "../domain/customization";
import "../styles/admin.css";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
export default function Admin() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load(e) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function update(id, status) {
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setOrders((current) =>
        current.map((o) => (o.requestId === id ? { ...o, status } : o)),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section className="admin-page page-pad">
      <span className="eyebrow">ESPACE BOUTIQUE · ACCÈS PRIVÉ</span>
      <h1>
        Les demandes
        <br />
        de <em>retrait</em>
      </h1>
      {orders === null ? (
        <form className="admin-login" onSubmit={load}>
          <label htmlFor="admin-key">Clé de gestion</label>
          <input
            id="admin-key"
            type="password"
            required
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button className="button" disabled={busy}>
            {busy ? "Connexion…" : "Ouvrir les demandes"}
            <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <>
          <div className="admin-toolbar">
            <p>
              {orders.length} demande{orders.length > 1 ? "s" : ""} · Confirmez
              le tarif et le créneau par téléphone avant de changer le statut.
            </p>
            <button
              className="text-link"
              onClick={() => load()}
              disabled={busy}
            >
              Actualiser
            </button>
            <button
              className="text-link"
              onClick={() => {
                setOrders(null);
                setToken("");
              }}
            >
              Déconnexion
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="admin-empty">Aucune demande pour le moment.</p>
          ) : (
            <div className="admin-orders">
              {orders.map((o) => (
                <article key={o.requestId} className="admin-order">
                  <div className="admin-order-top">
                    <span className="eyebrow">{o.reference}</span>
                    <select
                      aria-label={`Statut ${o.reference}`}
                      value={o.status}
                      onChange={(e) => update(o.requestId, e.target.value)}
                    >
                      {[
                        "À confirmer",
                        "Confirmée",
                        "Prête",
                        "Retirée",
                        "Annulée",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <h2>{o.name}</h2>
                  <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`}>
                    {o.phone}
                  </a>
                  <p className="admin-date">
                    {o.date} · {o.slot}
                  </p>
                  <ul>
                    {o.items.map((x, i) => (
                      <li key={i}>
                        {x.quantity} × {x.name} · {x.option}
                        {x.customization && (
                          <p className="admin-note">
                            {customizationSummary(x.customization)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {o.note && <p className="admin-note">{o.note}</p>}
                </article>
              ))}
            </div>
          )}
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
