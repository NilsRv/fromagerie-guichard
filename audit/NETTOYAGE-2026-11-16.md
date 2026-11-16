# Nettoyage de la démo — 16 novembre 2026

Le rendu validé est conservé. Aucun déploiement n’a été effectué et les demandes de la boutique n’ont pas été utilisées pour les tests.

## Structure

- `main.jsx` se limite au montage de React et au chargement des styles ; `App.jsx` compose les pages.
- Navigation et historique isolés dans un hook, sans fonction globale mutable. Les liens internes passent par un contexte React ; les liens vers un nouvel onglet et les téléchargements gardent leur comportement natif.
- Accueil, header, footer, panier et espace boutique séparés. L’accueil et le footer évitent les rendus inutiles lors des mises à jour du panier.
- Formulaire d’achat et informations de retrait partagés entre les sept fiches.
- Descriptions et tarifs regroupés dans le catalogue. Routes et limites de quantité partagées avec le serveur.
- Migration des anciens paniers, fusion des lignes et ajout de plusieurs unités regroupés dans des fonctions pures testées.
- Une fiche à photo unique affiche une image statique, sans observateur ni interactions de carrousel inutiles.

## Styles et ressources

- Plus de 140 sélecteurs inutilisés retirés, dont les anciens catalogues, fils d’Ariane, zooms et animations abandonnées.
- 42 déclarations CSS écrasées retirées. Feuilles de styles réparties entre base, panier, accueil, footer, pages, produits, quick shop et quantité ; ordre de chargement explicite.
- Typographie des chips centralisée dans une variable commune.
- Composant de lettres animées abandonné supprimé.
- Espace boutique et ses styles chargés uniquement à l’ouverture de `/gestion`.
- Polices actives converties en WOFF2, sans modification du dessin ni des métriques. Sources et anciennes polices conservées dans `assets/source-fonts/`, hors du build.
- Photo sans référence retirée du manifeste des ressources générées. Originaux conservés.
- Cache immuable d’un an pour les assets portant une empreinte. HTML revalidé ; API sans cache.

| Mesure | Avant | Après |
| --- | ---: | ---: |
| CSS chargé sur les pages publiques, non compressé | 78,16 Ko | 64,59 Ko |
| Fichiers des cinq polices actives | 700 680 octets | 227 612 octets |
| Fichier d’entrée React | 1 063 lignes | 5 lignes |

La réduction du CSS public est d’environ **17 %**. Les polices actives sont environ **67 % plus légères**. Ces mesures portent sur les fichiers, pas sur un score Lighthouse ou un gain de temps de chargement réseau simulé.

## Vérifications exécutées

- `npm run check` : dix tests unitaires, formatage et build réussis.
- `node tests/browser.mjs` : filtres, persistance, quantités, commande complète, téléchargement, idempotence serveur, connexion et statuts de gestion, navigation mobile et Échap.
- Quick shop : Chromium et WebKit à 390 et 1440 px, ajout direct à l’unité, coupes, sélecteur clavier, total, fusion et limite de 20, fermeture et focus.
- Galerie : flèches, curseur, glisser souris, navigation clavier, balayage tactile Chromium, accordéons réversibles et réduction des mouvements.
- Comparaison avant/après : **126 états**, à 320, 390, 768, 1100, 1440 et 1920 px, avec leurs styles calculés et dimensions. Aucune différence après normalisation des espaces dans les classes.
- Captures à 390 et 1440 px : aucune différence de dimensions ; écarts de pixels résiduels inférieurs à 0,09/255 RMS moyen par canal, compatibles avec la rasterisation des images et polices.
- Contrôle HTTP : assets empreintés avec cache immuable, polices WOFF2 servies avec le bon type, page valide en 200 et produit inconnu en 404.

Les navigateurs utilisent un lanceur commun compatible avec Chrome local ou Chromium Playwright. Les assertions de zoom supprimé ont été actualisées. Le README décrit uniquement le fonctionnement actuel de la démo ; les notes des anciennes itérations restent historiques.
