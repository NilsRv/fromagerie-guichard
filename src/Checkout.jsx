import { useState, useRef } from "react";
import { Phone, Check, Download } from "lucide-react";
export function dateOffset(days) {
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const d = new Date(local + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function Checkout({ cart, onBack, onSubmitted }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("Matin");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useRef(crypto.randomUUID());
  const day = date ? new Date(date + "T12:00:00Z").getUTCDay() : null;
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (day === 1) {
      setError("La boutique est fermée le lundi. Choisissez un autre jour.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id.current,
          name,
          phone,
          date,
          slot,
          note,
          consent,
          items: cart,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Une erreur est survenue.");
      onSubmitted({ ...result, date, slot, items: cart, note });
    } catch (e) {
      setError(
        e.name === "TimeoutError"
          ? "La réponse prend trop de temps. Réessayez : votre demande ne sera pas enregistrée deux fois."
          : e.message === "Failed to fetch"
            ? "Connexion interrompue. Réessayez ou appelez le 01 46 64 26 10."
            : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="checkout" onSubmit={submit}>
      <button type="button" className="back-link" onClick={onBack}>
        {" "}
        Revenir à ma sélection
      </button>
      <div className="checkout-step">
        <span>01</span>
        <div>
          <h3>Vos coordonnées</h3>
          <p>
            La boutique vous contacte pour confirmer votre sélection et son
            prix.
          </p>
        </div>
      </div>
      <label htmlFor="customer-name">Votre nom</label>
      <input
        autoComplete="name"
        id="customer-name"
        required
        minLength="2"
        maxLength="100"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="customer-phone">Votre téléphone</label>
      <input
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        id="customer-phone"
        required
        minLength="9"
        maxLength="25"
        placeholder="06 12 34 56 78"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <div className="checkout-step">
        <span>02</span>
        <div>
          <h3>Votre retrait</h3>
          <p>
            Prévoyez au moins deux jours. Le créneau sera confirmé par la
            boutique.
          </p>
        </div>
      </div>
      <div className="checkout-fields">
        <div>
          <label htmlFor="pickup-date">Jour souhaité</label>
          <input
            type="date"
            id="pickup-date"
            min={dateOffset(2)}
            max={dateOffset(60)}
            required
            aria-invalid={day === 1 || undefined}
            aria-describedby={
              day === 1 ? "pickup-date-error" : "pickup-date-hint"
            }
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlot("Matin");
            }}
          />
        </div>
        <div>
          <label htmlFor="pickup-slot">Créneau souhaité</label>
          <select
            id="pickup-slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            <option>Matin</option>
            {![0, 4].includes(day) && <option>Après-midi</option>}
          </select>
        </div>
      </div>
      {day === 1 && (
        <p id="pickup-date-error" className="field-error" role="alert">
          La boutique est fermée le lundi. Choisissez un autre jour.
        </p>
      )}
      <p className="field-hint" id="pickup-date-hint">
        Pas de retrait le lundi. Horaire précis convenu ensemble.
      </p>
      <label htmlFor="pickup-note">
        Une envie particulière ? <span>(facultatif)</span>
      </label>
      <textarea
        id="pickup-note"
        rows="3"
        maxLength="500"
        placeholder="Un fromage préféré, une occasion…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <label className="consent">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          J’accepte d’être contacté·e pour cette demande. Le prix, la
          disponibilité et le retrait seront confirmés par la boutique.
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button" disabled={busy || day === 1}>
        {busy ? "Enregistrement…" : "Demander mon retrait"}{" "}
      </button>
      <p className="checkout-notice">
        Aucun paiement en ligne. Règlement en boutique après confirmation. Vos
        coordonnées servent uniquement au traitement de votre demande.{" "}
        <a href="/informations" target="_blank" rel="noreferrer">
          Confidentialité
        </a>
        .
      </p>
    </form>
  );
}
export function Receipt({ receipt, products, onClose }) {
  function download() {
    const text = `FROMAGERIE GUICHARD\nDemande ${receipt.reference} — À confirmer\nRetrait souhaité : ${receipt.date}, ${receipt.slot}\n\n${receipt.items.map((x) => `${x.quantity} × ${products.find((p) => p.id === x.id)?.name} — ${x.option}`).join("\n")}\n${receipt.note ? `\nNote : ${receipt.note}` : ""}\n\nDisponibilité, prix et horaire à confirmer avec la boutique.\n18 rue Guichard, 94230 Cachan — 01 46 64 26 10\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `guichard-${receipt.reference}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="receipt">
      <span className="receipt-check">
        <Check size={30} />
      </span>
      <span className="eyebrow">{receipt.reference}</span>
      <h3>
        Votre demande
        <br />
        est <em>enregistrée</em>
      </h3>
      <p>
        La boutique doit encore confirmer la disponibilité, le prix et l’heure
        de votre retrait. Vous n’avez rien à régler pour le moment.
      </p>
      <div className="receipt-date">
        <span>RETRAIT SOUHAITÉ</span>
        <strong>
          {new Date(receipt.date + "T12:00:00").toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}{" "}
          · {receipt.slot}
        </strong>
      </div>
      <a href="tel:+33146642610" className="text-link">
        Un renseignement ? Appelez-nous <Phone size={16} />
      </a>
      <button className="download-selection" onClick={download}>
        <Download size={17} /> Télécharger mon récapitulatif
      </button>
      <button className="button" onClick={onClose}>
        Continuer la visite{" "}
      </button>
    </div>
  );
}
