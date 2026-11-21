# Nettoyage du 21 novembre 2026

Périmètre : modifications depuis `616e9e8`, avec conservation du rendu existant avant nettoyage.

## Intégration

- Choix radio et actions d’achat mutualisés entre les formulaires.
- Aides, accompagnements et précisions séparés en composants dédiés ; styles inutilisés supprimés.
- Catalogue indexé et routes de redirection partagées entre navigateur et serveur.
- Limites de portions et commentaires communes au client et au serveur.
- Ajout groupé atomique : aucune variété perdue si une limite du panier est atteinte.
- Total calculé en centimes ; données corrompues ignorées sans perdre les autres lignes valides.
- Repositionnement des aides regroupé par frame ; hauteur des précisions recalculée au redimensionnement.
- Scripts de contrôle adaptés aux nouvelles pages ; serveurs de tests avec stockage temporaire et arrêt automatique.

## Vérifications exécutées

- `npm run check` : 22 tests, formatage et compilation réussis.
- `npm run test:browser` : navigation, filtres, panier persistant, retrait, récapitulatif, enregistrement, idempotence et gestion réussis.
- `npm run test:commerce` : Chromium et WebKit, 320/390/768/1440 px ; unités, précisions, aides, limites, assortiment raclette, tarifs fondue, persistance et enregistrement réussis.
- `node audit/prices-check.mjs` : prix à 320/390/1440 px et tarifs serveur réussis.
- Comparaison avant/après : 150 états mesurés sur six largeurs (320/390/768/1100/1440/1920 px), aucune différence de styles calculés ou de dimensions.

Références de comparaison : `/private/tmp/guichard-clean-review-snapshots`. L’émulation WebKit ne remplace pas un essai sur un iPhone physique. Aucun enregistrement de test dans le stockage de la boutique.
