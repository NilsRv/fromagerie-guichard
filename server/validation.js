import { MAX_QUANTITY, MAX_CART_LINES } from "../src/domain/constants.js";
import { products } from "../src/catalog.js";
export function validateOrder(body, now = new Date()) {
  const fail = (message) => ({ ok: false, message });
  if (!body || typeof body !== "object")
    return fail("La demande est invalide.");
  if (
    typeof body.requestId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(body.requestId)
  )
    return fail("Veuillez réessayer depuis votre panier.");
  if (
    typeof body.name !== "string" ||
    body.name.trim().length < 2 ||
    body.name.length > 100
  )
    return fail("Indiquez votre nom (2 à 100 caractères).");
  if (
    typeof body.phone !== "string" ||
    !/^\+?[\d\s().-]{8,25}$/.test(body.phone) ||
    body.phone.replace(/\D/g, "").length < 9
  )
    return fail("Indiquez un numéro de téléphone valide.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date || ""))
    return fail("Choisissez un jour de retrait.");
  const date = new Date(body.date + "T12:00:00Z");
  const current = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const days = (date - new Date(current + "T12:00:00Z")) / 86400000;
  if (
    Number.isNaN(days) ||
    date.toISOString().slice(0, 10) !== body.date ||
    days < 2 ||
    days > 60
  )
    return fail(
      "Choisissez une date entre 2 et 60 jours à partir d’aujourd’hui.",
    );
  if (date.getUTCDay() === 1)
    return fail("La boutique est fermée le lundi. Choisissez un autre jour.");
  if (
    !["Matin", "Après-midi"].includes(body.slot) ||
    ([0, 4].includes(date.getUTCDay()) && body.slot === "Après-midi")
  )
    return fail("Choisissez un créneau de retrait proposé.");
  if (body.consent !== true)
    return fail("Votre accord est nécessaire pour traiter votre demande.");
  if (typeof body.note !== "string" || body.note.length > 500)
    return fail("Votre commentaire doit contenir au plus 500 caractères.");
  if (
    !Array.isArray(body.items) ||
    !body.items.length ||
    body.items.length > MAX_CART_LINES
  )
    return fail("Votre sélection doit contenir entre 1 et 30 articles.");
  const items = [];
  for (const item of body.items) {
    if (!item || typeof item !== "object")
      return fail("Un article de votre panier est invalide.");
    const product = products.find((p) => p.id === item.id);
    if (
      !product ||
      !product.options.includes(item.option) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY
    )
      return fail("Un article de votre panier est invalide.");
    items.push({
      id: product.id,
      name: product.name,
      option: item.option,
      quantity: item.quantity,
      ...(product.prices?.[item.option] !== undefined
        ? { unitPrice: product.prices[item.option] }
        : {}),
    });
  }
  return {
    ok: true,
    value: {
      name: body.name.trim(),
      phone: body.phone.trim(),
      date: body.date,
      slot: body.slot,
      note: body.note.trim(),
      items,
      consent: true,
      requestId: body.requestId,
    },
  };
}
