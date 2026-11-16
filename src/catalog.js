// Fromages et épicerie : tarifs fictifs de maquette.
export const products = [
  {
    id: "plateau",
    category: "plateaux",
    name: "Le plateau de fromages",
    detail:
      "Un plateau composé à la boutique selon les fromages du moment, vos envies et le nombre de personnes. Composition et créneau confirmés par téléphone avant préparation.",
    image: "plateau1.webp",
    tag: "À partager",
    options: ["4/5 personnes", "6/8 personnes", "10/12 personnes"],
    prices: { "4/5 personnes": 35, "6/8 personnes": 60, "10/12 personnes": 80 },
    allergens:
      "Lait. Garnitures et autres allergènes à préciser avec la boutique.",
  },
  {
    id: "comte",
    usage: "À la coupe · Lait de vache",
    description:
      "Une pâte pressée cuite, à choisir à la coupe. Demandez au fromager l’affinage disponible au comptoir.",
    category: "fromages",
    name: "Comté",
    detail:
      "Une pâte pressée cuite à découvrir à la coupe. Affinage, quantité disponible et prix au kilo sont confirmés par votre fromager.",
    image: "vitrine-exterieur2.webp",
    tag: "Vache",
    options: ["250 g", "500 g", "1 kg"],
    pricePerKg: 32,
    prices: { "250 g": 8, "500 g": 16, "1 kg": 32 },
    allergens: "Lait.",
  },
  {
    id: "chevre",
    usage: "À la pièce · Lait de chèvre",
    description:
      "Frais, crémeux ou plus affinés. Indiquez ce que vous aimez, nous vous conseillerons parmi les chèvres du moment.",
    category: "fromages",
    name: "Les chèvres du comptoir",
    detail:
      "Frais, crémeux ou plus affinés : indiquez votre préférence, nous vous orienterons vers les chèvres disponibles au comptoir.",
    image: "comptoir2.webp",
    tag: "Chèvre",
    options: ["1 pièce", "2 pièces", "4 pièces"],
    prices: { "1 pièce": 6, "2 pièces": 12, "4 pièces": 24 },
    allergens: "Lait.",
  },
  {
    id: "tomme",
    usage: "À la coupe",
    description:
      "Une tommette corse à découvrir au comptoir. La boutique vous précise la sélection et vous conseille sur la portion.",
    category: "fromages",
    name: "Tommette corse",
    detail:
      "Une tommette à retrouver au comptoir. La boutique vous précisera la sélection disponible et vous conseillera sur la portion.",
    image: "fromages4.webp",
    tag: "À découvrir",
    options: ["250 g", "500 g"],
    pricePerKg: 40,
    prices: { "250 g": 10, "500 g": 20 },
    allergens: "Lait.",
  },
  {
    id: "coing",
    usage: "Avec le fromage",
    description:
      "Une touche fruitée à servir avec vos pâtes pressées. À ajouter à votre plateau ou à garder pour la prochaine dégustation.",
    category: "autres-produits",
    name: "Pâte de coing",
    detail:
      "Une touche fruitée pour accompagner les pâtes pressées et prolonger la dégustation. Format et prix à confirmer avec la boutique.",
    image: "pate-de-coing.webp",
    tag: "Epicerie",
    options: ["1 portion", "2 portions"],
    prices: { "1 portion": 5, "2 portions": 10 },
    allergens:
      "Composition et éventuelles traces à vérifier auprès de la boutique.",
  },
  {
    id: "fruits",
    usage: "Pour la touche sucrée",
    description:
      "Un assortiment de douceurs fruitées pour terminer le repas. Les parfums varient selon les disponibilités.",
    category: "autres-produits",
    name: "Pâtes de fruits",
    detail:
      "Des douceurs fruitées pour les petites faims ou pour finir le repas. Parfums et formats selon les disponibilités.",
    image: "pates-de-fruits.webp",
    tag: "Douceurs",
    options: ["1 assortiment", "2 assortiments"],
    prices: { "1 assortiment": 9, "2 assortiments": 18 },
    allergens:
      "Composition et éventuelles traces à vérifier auprès de la boutique.",
  },
  {
    id: "cremerie",
    usage: "Au quotidien",
    description:
      "Crème, fromage frais : précisez votre envie lors de la demande de retrait. La boutique vous confirme les produits disponibles.",
    category: "autres-produits",
    name: "Côté crèmerie",
    detail:
      "Une envie de crème ou de fromage frais ? Précisez votre souhait en commentaire et nous vous confirmerons les produits du jour.",
    image: "autres.webp",
    tag: "Crèmerie",
    options: ["1 produit", "2 produits"],
    prices: { "1 produit": 4, "2 produits": 8 },
    allergens: "Lait. Composition complète à vérifier selon le produit.",
  },
];
export const googleUrl = "https://share.google/83ThgcITq5lAPjdMK";

export const legacyPlateauIds = [
  "plateau-apero",
  "plateau-table",
  "plateau-decouverte",
];
export const plateauProductPaths = ["plateau", ...legacyPlateauIds].map(
  (id) => `/produit/${id}`,
);

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
export const formatPrice = (value) => priceFormatter.format(value);
export const legacyPlateauOptions = {
  "4 personnes": "4/5 personnes",
  "6 personnes": "6/8 personnes",
  "8 personnes": "6/8 personnes",
  "12 personnes": "10/12 personnes",
};
