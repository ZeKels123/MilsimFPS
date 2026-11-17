# Liste d'améliorations (établie le 17 novembre 2026, après la v58)

## A. Contenu : nouveaux assets (≥ 10, CC0 / CC-BY uniquement, crédits dans docs/CREDITS_ASSETS.md)
Décor de camp et de champ de bataille : tentes de commandement, cantine/table, générateur, antenne radio, projecteur, épaves (voiture, char), citerne, palettes, caisses de munitions variées, drapeaux, bâches de camouflage, filets, véhicule de transport, hélicoptère posé, containers. Les mettre en place dans les camps / zones (placement hors route et hors eau), avec collision et blocage des balles (matériau balistique).

## B. Combat, effets, véhicules (restes de v57 et v58)
1. Calibre .50 absent de l'inventaire (CALS/CIDX/CKG/CST) : Signal 50 et HMG affichent 7.62.
2. `dstBlast` : ni hauteur ni ligne de vue ; explosions de véhicules créditées au joueur (`owner:null`).
3. Plafond de grenades au ramassage (inventory.js) ; claymore en cône horizontal ; grenade des bots sans `nadeSafePos`.
4. `pPool` (600) partagé entre feux d'herbe et fumée ; deux systèmes de balle frôlée qui se recouvrent.
5. `hbxUpdate` recalculé pour des bots hors champ ; cellules de navigation de la jeep restées bloquées.
6. Revue du combat non finie : feu, pièges, barils, véhicules, mêlée, interactions entre systèmes.

## C. Immersion, IA, monde
1. Eau : roseaux et sable aux abords, bruit de pas différencié dans l'eau, test de bot ou joueur coincé dans une berge.
2. Bots : clip de marche accroupie et couché, respiration à l'arrêt, rechargement accroupi, blessure à l'avant-bras visible.
3. Mirador : tireur couché derrière la rambarde, plus de bots qui l'occupent, test de visée en hauteur.
4. `bld()` des bâtiments monolithique (pic résiduel 50–100 ms) ; mesures de performance réelles avant/après.
5. Confirmer en jeu que les bots ne restent plus figés (cause trouvée par lecture seulement).

## D. Plus tard
Dégâts des portes par les bots, ricochets sur crêtes, lumières dynamiques des phares, sons de moteur par AOUT, nouveau mode de jeu (défense de position, évacuation).
