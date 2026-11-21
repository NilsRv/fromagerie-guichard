# Fromagerie Guichard

Démo responsive React/Vite avec catalogue, panier persistant et demandes de retrait enregistrées par Express. Paiement en boutique, sans paiement en ligne.

## Démarrer

Node.js **20.19 ou supérieur**.

```sh
npm install
npm run dev
```

Ouvrir **http://localhost:5173**. Pour servir la version compilée :

```sh
npm run build
npm start
```

Arrêter le serveur de développement avant de lancer la version compilée, ou choisir un autre `PORT`.

## Vérifier la démo

```sh
npm run check
npm run test:browser
npm run test:commerce
```

`check` lance les tests unitaires, vérifie le formatage et compile. Le scénario navigateur démarre son propre serveur avec un port libre et un stockage temporaire : il ne touche pas aux demandes de la boutique. Il vérifie les filtres, l’historique, le panier, les quantités, le retrait, le téléchargement du récapitulatif et l’espace de gestion. Captures dans `.playwright/`.

Les tests utilisent Chrome sur macOS si disponible, sinon Chromium de Playwright. `CHROME_PATH` permet de choisir un autre binaire. Pour installer les navigateurs de test :

```sh
npx playwright install chromium webkit
```

Contrôles complémentaires sur un aperçu déjà lancé :

```sh
AUDIT_URL=http://localhost:5173 node audit/motion-check.mjs
AUDIT_URL=http://localhost:5173 node audit/commerce-check.mjs
AUDIT_URL=http://localhost:5173 node audit/iphone-check.mjs
```

`test:commerce` lance un serveur isolé et vérifie les configurations, les aides, les précisions, les limites du panier et les prix enregistrés dans Chromium et WebKit. `test:quick-shop` reste un alias de compatibilité. `AUDIT_ENGINES=chromium` et `AUDIT_WIDTHS=390,1440` permettent de cibler un contrôle. L’émulation mobile ne remplace pas un essai sur un iPhone physique.

`audit/refactor-regression.mjs` compare les styles et les dimensions de 150 états, sur six largeurs. Exécuter une première fois avec `AUDIT_PHASE=before`, puis sans ce paramètre après modification. `AUDIT_SNAPSHOTS` définit le répertoire des références et captures.

## Sélections et préparation

La navigation propose Plateaux, Raclettes, Fondues et Épicerie. L’ancienne route `/fromages` redirige vers `/raclettes`.

Les plateaux proposent une préparation fin de repas (quelques coupes) ou dînatoire (tout prédécoupé). Les commentaires et accompagnements sont conservés par article, y compris dans le panier, la demande, l’espace boutique et le récapitulatif. Deux préparations ou commentaires différents restent deux lignes distinctes.

Les tarifs des plateaux et de l’épicerie restent ceux de la maquette. Les raclettes se composent avec un compteur par variété et un ajout groupé au panier. Les précisions restent réservées aux plateaux. Les raclettes sont proposées par portions de 250 g : Nature 6,90 €, Fumée 7,90 €, Ail des ours 8,90 €, Morbier 6,90 €, 5 baies 8 €. Les fondues se choisissent pour 4, 6 ou 10 personnes : Savoyarde 35/49/82 €, Suisse 38/54/90 €. La charcuterie est un complément sur demande, avec supplément à confirmer ; aucun plateau de charcuterie seul n’est proposé. Les photos saisonnières proviennent des photos existantes du comptoir.

`src/domain/customization.js` partage la validation des préférences et le calcul des accompagnements entre client et serveur. Les prix transmis par le client sont ignorés.

## Organisation du code

| Emplacement                                                              | Responsabilité                                                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `src/main.jsx`                                                           | Montage React et chargement des styles                                                              |
| `src/App.jsx`                                                            | Composition des pages et du panier                                                                  |
| `src/routes.js`                                                          | Routes partagées par le client et le serveur                                                        |
| `src/hooks/useShopNavigation.js`                                         | Historique, positions de défilement et transitions                                                  |
| `src/hooks/usePageMetadata.js`                                           | Titres, descriptions et focus de navigation                                                         |
| `src/hooks/useCart.js`, `src/domain/cart.js`                             | Persistance, migration et mises à jour du panier                                                    |
| `src/domain/constants.js`                                                | Limites communes au client et au serveur                                                            |
| `src/catalog.js`                                                         | Produits, descriptions, formats et prix                                                             |
| `src/pages/`                                                             | Accueil, catalogues, fiches et pages éditoriales                                                    |
| `src/components/ProductPurchaseForm.jsx`                                 | Formulaire partagé par les fiches produit et Plateaux                                               |
| `src/components/FormatOption.jsx`, `PurchaseActions.jsx`                 | Choix radio et actions d’achat communs                                                              |
| `src/components/MealPreferences.jsx`, `MealHelp.jsx`, `PlateauNotes.jsx` | Accompagnements, aides et précisions                                                                |
| `src/components/RaclettePurchaseForm.jsx`                                | Composition et ajout atomique de l’assortiment                                                      |
| `src/components/ProductInformation.jsx`                                  | Composition, allergènes et retrait                                                                  |
| `src/components/ProductGallery.jsx`                                      | Galerie à balayage ; photo statique sans logique de carrousel pour une image unique                 |
| `src/components/QuickShop.jsx`, `QuantitySelect.jsx`                     | Choix du poids, quantité et achat rapide                                                            |
| `src/components/Header.jsx`, `Footer.jsx`, `Cart.jsx`                    | Navigation, pied de page et panier                                                                  |
| `src/styles/index.css`                                                   | Ordre explicite des feuilles de styles                                                              |
| `src/styles/`                                                            | Styles regroupés par responsabilité : base, panier, accueil, navigation, produits, quick shop, etc. |
| `src/pages/Admin.jsx`                                                    | Gestion chargée à la demande, avec sa propre feuille de styles                                      |
| `server/validation.js`                                                   | Validation des demandes et prix issus du catalogue                                                  |
| `server/index.js`                                                        | API, stockage et service de la démo                                                                 |

## Comportements conservés

- Un plateau, trois formats : **4/5 personnes à 35 €**, **6/8 à 60 €**, **10/12 à 80 €**.
- Épicerie : ajout direct des produits à l’unité. Les anciennes fiches de fromages à la coupe restent accessibles ; leur choix de poids et le quick shop sont conservés pour compatibilité. Les quantités restent modifiables dans le panier.
- Panier conservé localement, fusion des formats identiques, limite de 20 par ligne. Les anciens paniers et liens de plateaux sont convertis.
- Fond crème, encre brune, bordures en petits points et marges communes à la navigation, au contenu et au footer. Pas de fil d’Ariane ni de zoom produit.
- Animations adaptées à la réduction des mouvements ; clavier, focus et fermeture des modals pris en charge.

Les tarifs des six produits Fromages/Épicerie sont **fictifs** : Comté 32 €/kg, tommette 40 €/kg, chèvre 6 € la pièce, pâte de coing 5 € la portion, pâtes de fruits 9 € l’assortiment, crèmerie 4 € le produit. Les prix des cartes, fiches, paniers et demandes proviennent du même catalogue. La sélection et le créneau restent à confirmer par la boutique.

## Configuration et demandes

| Variable      | Valeur par défaut                                       |
| ------------- | ------------------------------------------------------- |
| `PORT`        | `5173`                                                  |
| `HOST`        | `127.0.0.1`                                             |
| `DATA_DIR`    | `.data`                                                 |
| `ADMIN_TOKEN` | Clé créée au premier lancement dans `.data/admin-token` |

Ouvrir **/gestion** pour consulter et modifier les statuts des demandes. La clé reste privée ; elle n’est pas intégrée au code client. Les demandes sont conservées dans `.data/orders/` et sont aussi consultables avec `npm run orders`. Aucun e-mail ni SMS automatique n’est envoyé.

Les tests et audits doivent utiliser un répertoire temporaire s’ils lancent un serveur de test. Ne pas utiliser le stockage de la boutique pour les vérifications.

## Ressources

Les photographies originales sont conservées dans `assets/`. Les cinq polices utilisées sont distribuées en WOFF2 depuis `public/fonts/`, avec leurs licences. Les sources TTF et les anciennes polices sont conservées dans `assets/source-fonts/`, en dehors des fichiers publics et du build.

Les assets Vite portent une empreinte et sont servis avec un cache immuable d’un an. L’espace boutique et ses styles ne sont chargés qu’à l’ouverture de sa route.

Les relevés et captures des précédentes itérations restent dans `audit/` et `DECISIONS.md`. Ils documentent des versions historiques ; ce README décrit le fonctionnement actuel. La section Google de l’accueil présente un extrait attribué et une note relevée le 9 octobre 2026, sans actualisation automatique.
