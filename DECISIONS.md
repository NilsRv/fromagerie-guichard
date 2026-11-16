# Décisions — Fromagerie Guichard

## Périmètre et lancement

- Travail effectué seul dans le dossier fourni, sans remplacer les photos d’origine.
- Livraison d’un site local complet, prêt à lancer avec `npm run dev`, et d’une version de production avec `npm run build` puis `npm start`. Aucune publication publique ni commande à un service tiers.
- React + Vite pour l’interface, serveur Node/Express pour les demandes de retrait. Lenis installé et utilisé pour le défilement sur ordinateur ; défilement tactile natif sur mobile.
- Routes : `/`, `/plateaux`, `/fromages`, `/autres-produits`, `/a-propos`, `/contact`, `/informations`. Espace privé `/gestion`.

## Direction artistique

- Ivoire, lie-de-vin, nuances de papier et de bois. Typographie DM Serif Display (droite et italique), accompagnée de DM Sans. Polices hébergées localement, aucun appel Google Fonts lors des visites.
- Logotype typographique original « Fromagerie Guichard. », favicon G, sceau circulaire animé, photographie principale en arche et note éditoriale superposée.
- Mise en page de commerce de quartier : grand titre, vrais produits, plateaux, geste du fromager, boutique, avis, fonctionnement du retrait, adresse.
- Inspirations : générosité et naturalité du Pain Quotidien, clarté des catégories de Mimi Crèmerie, rythme éditorial de Bakery Co. Pas de reprise de textes, logos ou images de ces références.
- Photos des produits et de la boutique issues de `assets`. À la demande de l’utilisateur le 12 octobre 2026, la hero utilise une illustration photographique générée (`assets/hero-fromages-v3.webp`), dont le prompt est conservé à côté du fichier. Les photos d’origine sont conservées.
- Mouvements : entrée de la photo, révélations au défilement, bandeau continu, rotation très lente du sceau, zoom léger des photos, transitions des flèches et tiroir panier. Tous désactivés avec `prefers-reduced-motion`.

## Contenus et tarifs

- Nom, adresse et téléphone fournis conservés. Ville complétée : Cachan, 94230, confirmée par plusieurs annuaires publics.
- Les noms des trois plateaux et leurs formats sont des propositions éditoriales pour cette première version : ils ne prétendent pas reproduire un catalogue officiel.
- Les familles de produits s’appuient sur les photos : plateaux, Comté, chèvres, tommette corse, pâte de coing, pâtes de fruits, crèmerie.
- Aucun tarif, stock, label, histoire de famille ou origine non vérifiés n’a été inventé. Le prix et la composition sont confirmés par la boutique avant acceptation.
- Une photographie de comptoir illustre une famille de produits ; elle n’est pas une garantie de disponibilité. Les mentions de composition et d’allergènes invitent à vérifier auprès du fromager.

## Click & collect réellement enregistré

- Panier persistant sur l’appareil, variantes de quantité/convives, ajout, retrait, suppression et limite de quantité.
- Formulaire : nom, téléphone, date, matin/après-midi, commentaire facultatif et accord de contact.
- Le serveur valide les données indépendamment du navigateur et enregistre une demande dans `.data/orders/`. Aucun faux écran de confirmation : le succès ne s’affiche qu’après l’écriture serveur.
- Référence unique et protection contre les doublons lors d’un nouvel essai réseau. Enregistrement exclusif par identifiant de requête. Les données transmises pour les produits sont recoupées avec le catalogue serveur.
- Statut initial « À confirmer ». La boutique confirme par téléphone le prix, les disponibilités et l’horaire. Paiement sur place uniquement. Aucune livraison ni paiement en ligne.
- Retrait proposé entre J+2 et J+60. Lundi exclu ; dimanche et jeudi après-midi exclus par prudence d’après l’annuaire consulté. Ce sont des règles provisoires modifiables dans `server/validation.js` et `src/Checkout.jsx`, à valider avec l’exploitant.
- L’espace `/gestion` liste les demandes et permet de les passer à Confirmée, Prête, Retirée ou Annulée. Accès par clé privée locale, jamais incluse dans le JavaScript public. La clé peut être fournie via `ADMIN_TOKEN`.
- La boutique doit consulter cet espace : aucune notification SMS/e-mail n’est raccordée à un compte réel. Aucun e-mail marchand ou compte de paiement n’a été inventé.
- Le serveur local écoute par défaut sur `127.0.0.1`. Une mise en production nécessite un hébergement Node avec disque persistant, HTTPS et configuration de la clé de gestion. Un hébergement statique seul ne prendrait pas en charge les demandes.

## Avis Google : limitation vérifiée

- Fiche fournie : https://share.google/83ThgcITq5lAPjdMK
- Le lien a été ouvert via la recherche web, par HTTP et dans un navigateur de test. Google renvoie une vérification anti-robot ; je n’ai pas tenté de la contourner.
- Les sources publiques secondaires affichent des valeurs incompatibles (Cylex : 4,91/79 ; BonFromager : 5,0/67 ; anciens annuaires sous « Chez Thom » : 4,9/58). Elles ne permettent pas de présenter une note Google actuelle vérifiée.
- Décision : une vraie section « Les mots du quartier » avec photo et lien vers les avis officiels, sans note inventée ni citation attribuée à tort. L’affichage des avis dans le site reste à alimenter depuis un accès autorisé à la fiche ou des extraits vérifiés.
- Sources consultées le 9 octobre 2026 :
  - https://www.cylex-locale.fr/entreprises/fromagerie-guichard-13901699.html
  - https://bonfromager.fr/94/
  - https://www.mimicremerie.fr/
  - https://www.lepainquotidien.com/fr/en/menu
  - https://bakery-co-wbs.framer.website/

## Confidentialité et exploitation

- Pas de publicité, de cookies de suivi, de carte Google embarquée ou d’analytics.
- Coordonnées limitées au nom et au téléphone, nécessaires pour la demande de retrait. Gestion privée et récapitulatif téléchargeable.
- Suppression automatique des demandes de plus de 90 jours, vérifiée au démarrage puis quotidiennement.
- Une page d’information explique le traitement. Les mentions juridiques officielles de l’exploitant et de l’hébergeur devront être complétées avant une publication commerciale ; je n’ai pas attribué à l’entreprise des identifiants juridiques non confirmés.
- `.data`, `.env`, dépendances, résultats de tests et fichiers de build exclus du versionnement. L’espace de stockage doit être sauvegardé par l’exploitant.

## Vérifications

- Compilation de production.
- Tests de validation serveur : catalogue, quantités, contact, consentement, dates et créneaux.
- Parcours navigateur : pages, filtres, panier persistant, quantités, formulaire, enregistrement réel isolé, idempotence, récapitulatif, accès privé et statut.
- Contrôle des débordements aux largeurs 320, 390, 768 et 1440 pixels, navigation mobile, fermeture clavier des dialogues, captures d’écran.

## Révision du 9–10 octobre 2026 — direction crème, bleu et jaune

Ces décisions remplacent les choix de couleur et de présentation de la première version.

- Suppression du bandeau supérieur. Navbar bordée en cases, marque au centre, navigation répartie de part et d’autre ; position sticky conservée sur toute la page. Sur petit écran, la barre reste sticky et le menu devient un panneau déroulant.
- Nouvelle palette : crème `#fbf6e9`, bleu `#284d78`, jaune beurre `#edc557`. La palette s’applique aussi au catalogue, panier, formulaires et espace boutique. Favicon et couleur du navigateur actualisés.
- Vidéo fournie analysée en 16 images, puis structure de la page Le Pain Quotidien inspectée. Le mouvement est un empilement de panneaux sticky, et non un carousel ou une parallaxe : chaque panneau se bloque sous la barre, puis le suivant le recouvre.
- Section produits refaite en trois panneaux 50/50 alternant photo et texte, avec cadres fins, titres condensés et légendes manuscrites. Les images proviennent exclusivement du dossier assets. Barlow Condensed et Caveat hébergées localement.
- Empilement actif sur ordinateur. Sur mobile, sur écrans très courts et en mode réduction des animations, les panneaux restent dans le flux pour conserver le texte et les liens accessibles.
- Avis Google : accès finalement possible en ouvrant le lien public direct des avis dans la session Chrome habituelle, sans changer les réglages de sécurité. Capture et lecture visuelle de la fiche le 9 octobre 2026 : **4,9/5, 65 avis**.
- Un avis effectivement lu, de **Sutanya**, cinq étoiles, visite en mars, a été intégré sous forme d’extrait court attribué. Aucun autre auteur ou texte n’a été inventé. La section affiche cet avis et un lien vers les 65 avis ; ce n’est pas un flux automatique. Ajouter d’autres avis exigera de les lire et vérifier également.
- Données et provenance dans `src/reviews.js`. Source : https://www.google.com/maps/place/Fromagerie+Guichard/data=!4m7!3m6!1s0x47e671ae02df1f9d:0x4c066f81589ba48b!8m2!3d48.794184!4d2.3365526!9m1!1b1?hl=fr

## Révision du 10 octobre 2026 — cadre continu et hero

- Référence : composition de https://drinkmeli.com/ et capture fournie. Deux filets bleus prolongent les côtés de la navbar sur toutes les pages jusqu’au footer. Les sections sont contenues dans ce cadre ; le comportement sticky et Lenis sont conservés.
- Hero remplacée par une photo réelle de `assets/plateau1.webp`, en plein cadre avec voile sombre pour la lisibilité. Aucun badge, légende, adresse ou élément décoratif supplémentaire.
- Titre fixe « du fromage pour » et expressions manuscrites locales Caveat : « une raclette », « un apéro », « une fondue », « se retrouver ». Rotation toutes les quatre secondes avec apparition douce. Largeur réservée pour éviter les déplacements des éléments ; titre sur deux lignes sur mobile.
- Rotation suspendue hors écran, dans un onglet masqué, au survol ou lorsque les liens ont le focus. Respect de la préférence de réduction des animations. Libellé accessible stable pour éviter les annonces répétées.
- Deux liens soulignés : « Choisir mon plateau » et « Trouver la fromagerie ». Conservation de la palette crème, bleu et jaune et du bandeau existant sous la hero.
- Ajustement des titres À propos et visite sur petits écrans pour tenir dans le nouveau cadre.

## Ajustement de la hero — typographies et hauteur

- Rotation toutes les 3 secondes, mêmes pauses et préférence de réduction des animations.
- « du fromage pour » utilise Sorts Mill Goudy Regular, téléchargée depuis le dépôt officiel Google Fonts et hébergée localement avec sa licence OFL.
- Expressions en Biró Script Regular : version d’essai Reduced officielle téléchargée chez ingoFonts pour cet aperçu local. Elle est limitée aux lettres non accentuées ; « un repas » remplace « un apéro ». Le fichier complet avec licence web devra remplacer `public/fonts/biro-script-trial.otf` avant publication commerciale. Aucun achat effectué. Licence jointe dans `public/fonts/biro-script-EULA.rtf`.
- Source Biro : https://www.ingofonts.de/en/product-page/kopie-von-bir%C3%B3-script-paket-nur-regular-bold
- Hero à hauteur d’écran, navbar et marge supérieure comprises. Bandeau défilant supprimé du rendu.
- Build validé ; contrôle Chrome : rotation à 3 secondes, absence du bandeau, bas de hero aligné au bas du viewport et absence de débordement aux largeurs 320, 390, 768 et 1440 px.

## Correction du rythme et généralisation de Sorts Mill Goudy

- La pause au survol et au focus empêchait la rotation lorsque la souris restait sur la hero. Suppression de ces deux conditions : changement toutes les 3 secondes, même au survol et pendant la navigation clavier. Les pauses hors écran, onglet masqué et préférence de réduction des animations sont conservées.
- Variable serif globale remplacée par Sorts Mill Goudy ; variante italique officielle ajoutée localement. Biro Script reste réservée aux expressions de la hero.
- Compilation validée. Contrôle navigateur du changement au survol et au focus, police des titres et absence de débordement sur six pages à 320, 390, 768 et 1440 px.

## Navbar sans décalage au scroll

- La marge initiale utilise désormais `--nav-top`, identique au décalage sticky, à toutes les tailles d’écran : suppression du déplacement de 6/4/2 pixels au début du scroll.
- Navbar et masque crème supérieur placés devant les filets du cadre pour empêcher les lignes de dépasser au-dessus de la barre.
- Hauteur de hero recalculée avec cette même variable pour conserver le premier écran complet.
- Build validé ; position de navbar identique à 0, 3, 30, 600 et 1800 px de scroll sur quatre largeurs (320, 390, 768, 1440 px). Capture contrôlée après scroll.

## Palette demandée — brun et crème

- Bleu principal et encre remplacés par `#513A31`, crème par `#F3F2E9`, y compris les panneaux produits, cartes d’avis, favicon et couleur du navigateur.
- Déclinaisons bleutées secondaires et états de survol harmonisés en brun ; transparences conservées.

## Police sans-serif Poppins

- Poppins remplace les polices sans-serif précédentes, y compris les titres des panneaux produits. Taille de ces titres adaptée à sa chasse plus large.
- Graisses 400, 500, 600, 700 et 800 hébergées localement, téléchargées depuis le dépôt Google Fonts avec leur licence OFL.
- Compilation validée ; chargement de Poppins et absence de débordement contrôlés sur six routes et quatre largeurs d’écran.

## Dimensions de la navbar et logo

- Navbar de 64 px à tous les breakpoints via `--nav-height`, avec adaptation automatique de la hero et des panneaux sticky.
- Les deux parties du logo de navbar utilisent Poppins 800, 18 px ; disposition mobile sur deux lignes conservée.
- Compilation et dimensions calculées vérifiées dans Chrome à 320, 390, 768, 1024, 1440 et 1920 px.

## Marges latérales réduites

- Cadre commun : `--frame-inset: max(1vw, 8px)`, soit une largeur de 98vw tant que les marges dépassent 8 px, puis une largeur de `100vw - 16px` en dessous de 800 px.
- Suppression des anciennes marges spécifiques tablette et mobile. Navbar, filets verticaux, contenu et footer restent alignés.
- Build validé et dimensions contrôlées aux largeurs 320, 390, 768, 800, 1440 et 1920 px, sans débordement horizontal.

## Graisses légères de Poppins pour essais

- Ajout des fichiers officiels Poppins Thin (100), ExtraLight (200) et Light (300), hébergés localement et déclarés dans `src/style.css`.
- Disponibles avec `font-family: Poppins` et `font-weight: 100`, `200` ou `300`. Aucun changement des graisses actuellement appliquées.

## Typographie des textes de navigation

- Liens de navigation, libellé Panier et compteur en Sorts Mill Goudy 400, 16 px, y compris le menu mobile.
- Wordmark conservé en Poppins 800, 18 px.
- Textes de navigation désormais en italique (Sorts Mill Goudy Italic 400, 16 px), hors wordmark.

## Parallaxe et recouvrement de la hero

- Hero maintenue sous la navbar pendant son recouvrement par la section produits, avec une zone sticky bornée pour ne pas persister derrière le reste du site.
- Photo légèrement agrandie et déplacée de 50 px au maximum suivant le scroll ; mise à jour via requestAnimationFrame, compatible avec Lenis.
- Section suivante opaque au premier plan, sans saut de mise en page. Mode réduction des animations : défilement normal sans parallaxe ni maintien sticky de la hero.
- Build et vérifications Chrome desktop/mobile validés : position sticky, section au premier plan, déplacement de photo, absence de débordement et mode réduction des animations.

## Navigation — poids demandé 300

- Déclaration CSS des liens, du libellé panier et du compteur passée à `font-weight: 300`, en conservant Sorts Mill Goudy italique 16 px et le wordmark existant.
- Les fichiers Sorts Mill Goudy disponibles sont en graisse 400 : le navigateur sélectionne cette graisse pour une demande 300. Pas de variante Light inventée ni de modification artificielle des contours.

## Lissage des textes de navigation

- Comparaison avec le CSS public de Meli : sa racine applique `-webkit-font-smoothing: antialiased`, contre `auto` sur notre site.
- Chrome confirme que nos liens utilisent réellement SortsMillGoudy-Italic, sans ombre ni contour ajouté. La différence de lissage peut expliquer un rendu plus épais sur macOS ; les captures seules ne permettent pas de quantifier les autres effets de zoom/résolution.
- Même lissage appliqué aux textes de navigation, avec équivalent Firefox macOS. Wordmark inchangé. Graisse CSS demandée 300 conservée (fichier réel 400).
- Source : https://drinkmeli.com/cdn/shop/t/13/assets/custom-styles.css

## Lissage global hors wordmark

- Lissage `antialiased` appliqué à la racine et hérité par tous les textes ; équivalent `grayscale` pour Firefox sur macOS.
- Exception explicite pour `.wordmark` et ses descendants (navbar et footer), conservés en lissage `auto`.

## Titres des panneaux de sélection

- `.selection-copy h3` utilise Sorts Mill Goudy en graisse native 400, en conservant les tailles responsive et les majuscules existantes.

## Liens de hero : pointillés et survol

- Pointillés de 2 px avec espacement vertical resserré sous le texte, en remplacement de la bordure fine de 1 px. Référence publique Meli : soulignements pointillés de 2 px.
- Survol et focus : léger déplacement du texte de 3 px vers le haut sur 380 ms ; les pointillés restent fixes et la couleur reste crème. Suppression du jaune et du trait plein.
- Réduction des animations respectée. Build et comportement au survol vérifiés dans Chrome.

## Animation typographique des liens de hero

- Défilement vertical lettre par lettre : chaque caractère est remplacé par sa copie dans un masque, sur 650 ms avec décalage de 12 ms entre caractères et courbe de décélération douce. Retour réversible à la sortie du pointeur.
- Pointillés fixes et couleur crème conservés. Animation également au focus clavier, sans effet de survol persistant sur écran tactile.
- Libellé accessible unique ; copies décoratives masquées aux lecteurs d’écran. Mots insécables, retour à la ligne entre mots sur petits écrans. Réduction des animations respectée.
- Build et contrôles navigateur de survol, retour, mobile et réduction des animations validés.

## Essai de palette House of Honey — 11 octobre 2026

- Référence inspectée : https://www.houseofhoney.com/ et sa feuille de style publique. Plusieurs thèmes présents ; choix du duo principal brun profond `#331917` / rose poudré `#EDCCBE`, avec ivoire `#FFF8EF`.
- Fond clair et navbar rose poudré, encre et cadres brun profond ; introduction des sélections et section avis en brun avec texte rose. Carte d’avis claire. Texte de hero ivoire pour conserver sa lisibilité sur photo.
- Harmonisation des anciens accents jaunes vers des tons blush ; favicon et theme-color mis à jour. Typographies et interactions conservées.
- Ancienne palette : brun `#513A31`, crème `#F3F2E9`. Essai réversible. Build validé et captures de contrôle réalisées.

## Annulation de l’essai House of Honey

- À la demande de l’utilisateur, restauration exacte de la feuille de style sauvegardée avant l’essai : brun `#513A31`, crème `#F3F2E9`, sections et accents précédents.
- Favicon et couleur navigateur restaurés. Animations, typographies et autres ajustements conservés.

## Navbar au bord supérieur

- Suppression de l’espace supérieur via `--nav-top: 0px` sur tous les écrans, dès le chargement et au scroll.
- Marges latérales conservées. Hauteur de hero et positions sticky ajustées automatiquement par la variable commune.
- Build validé ; position initiale et après scroll contrôlée à 320, 390, 768 et 1440 px.
- Bordure supérieure de la navbar supprimée maintenant qu’elle est au bord de l’écran ; hauteur de 64 px et autres bordures conservées.

## Répartition de l’espace dans la navbar

- Case du wordmark réduite d’environ 37,5 % à 28 % de la largeur desktop (minimum 280 px pour préserver le nom).
- Groupe des trois entrées produits élargi d’environ 33 % à 42 % ; informations et panier regroupés dans les 30 % restants. « Autres produits » dispose d’un peu plus de largeur pour son intitulé.
- Modification limitée aux proportions : typographies, séparations et hauteur conservées ; composition mobile existante conservée.
- Build validé, capture desktop contrôlée et absence de texte coupé vérifiée sur sept largeurs de 320 à 1920 px.

## Navbar ouverte en trois zones

- Suppression des séparations internes, y compris entre logo, panier et menu mobile ; cadre extérieur et bordure basse conservés.
- Desktop : wordmark à gauche, cinq pages centrées dans le viewport, panier à droite. Colonnes latérales égales, espacements fluides. Menu mobile conservé.
- Build et centrage vérifiés ; aucun chevauchement sur sept largeurs de 320 à 1920 px.

## États des liens de navigation

- Suppression du fond jaune au survol et sur la page active, également pour le panier.
- Soulignement pointillé de 2 px, décalé de 6 px, dans la couleur du texte. Apparition douce au survol et au focus, maintien sur la page active ; aucun déplacement de mise en page.

## Animation partagée navbar / hero

- Composant de lettres animé partagé entre les liens de hero, les pages de la navbar et le libellé Panier. Wordmark inchangé.
- Même durée, décalage et courbe de mouvement ; pointillés indépendants des lettres, fixes et maintenus sur la page active.
- Libellés accessibles préservés et réduction des animations respectée. Build et contrôles navigateur validés.

## Correction des débords italiques dans les liens animés

- Le masque de chaque lettre coupait les débords latéraux du « f » italique. Remplacement de `overflow: hidden` par un masque vertical avec marge latérale de 0,35 em.
- Largeurs et espacement des lettres conservés ; copies de l’animation toujours masquées verticalement.

## Nettoyage du code — 11 octobre 2026

- Suppression de 134 règles CSS inutilisées (ancienne hero, bandeau, anciennes cartes et avis) et des déclarations écrasées ; regroupement des règles communes.
- Navbar réécrite autour de sa composition actuelle, sans anciennes grilles, couleurs de survol ni tailles contradictoires. Styles isolés dans `src/styles/navigation.css`.
- Hero, polices et animation des lettres regroupées dans `src/styles/hero.css`, `fonts.css` et `rolling-label.css`. Un seul comportement de mouvement partagé entre hero et navbar, y compris la réduction des animations.
- Composant `RollingLabel` extrait dans `src/components/`, imports inutilisés supprimés. Anciennes polices non utilisées retirées ; toutes les graisses Poppins demandées conservées. Préchargement HTML corrigé pour Sorts Mill Goudy.
- Code JSX, serveur, catalogue et tests mis en forme avec Prettier ; commandes `npm run format` et `npm run format:check` ajoutées. Documentation de structure mise à jour.
- CSS de production réduit de 56,14 à 42,68 ko (environ 24 %). Comparaison des styles calculés de sept pages sur six largeurs : aucun changement des propriétés comparées, hors variation de timing des classes d’apparition.
- Tests serveur, compilation, formatage et parcours navigateur complet validés. Contrôles complémentaires : animations au survol et au retour, parallaxe, navbar sticky, menu mobile ouvert sur toute la largeur. Sélecteur du test mobile actualisé pour accepter la casse actuelle des libellés.
