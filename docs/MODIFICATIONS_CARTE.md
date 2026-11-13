# Modifications de la carte (v12)

Photo de dessus : `captures/v12/carte_dessus.png` (rectangle rouge = ville, trait blanc = route nord-sud).

| | Avant | Après |
|---|---|---|
| Taille | 300 × 300 m | **1500 × 1500 m** |
| Bâtiments | environ 25 | **108 hors ville** + 1 ville de 250 × 250 m |
| Rivières | s'arrêtaient à ±150 m | prolongées jusqu'au bord de la carte |
| Ponts | 3 | 4 (nouveau pont sur la route nord-sud, vers x = 224, z = −20) |
| Végétation | 560 pins, 190 arbres, 520 buissons | 5400 pins, 1860 arbres, 5100 buissons (esprit campagne : beaucoup de prairie) |

## La ville (x 100..348, z −348..−100)
- Plateforme plane (le relief est aplani autour), grille de 4 × 4 îlots séparés par 3 rues nord-sud et 3 rues est-ouest ; deux avenues de 14 m se croisent au centre (224, −224).
- Îlots : immeubles d'habitation (5-6 étages), tours de bureaux (7-9 étages) au centre, hôtels, commerces (2-3 étages), restaurants, et un parc avec fontaine, bancs et arbres.
- Rez-de-chaussée accessible (porte côté rue, porte arrière, vitrines vitrées pour commerces/restaurants) avec mobilier : étagères (commerces), tables et chaises (restaurants), bureaux et canapés (autres). Les étages et le toit ne sont pas accessibles.
- Voitures garées, lampadaires le long des avenues. Les bots ont des points de patrouille dans la ville.

## Route nord-sud
- Bande d'asphalte de 8 m à x = 224, de la ville jusqu'aux deux bords de la carte, qui suit le terrain. Pas de maisons posées sur son tracé.

## Villages de campagne
- Maisons isolées et petits groupes de 1-2 maisons tous les ~120 m environ, reliées aux sentiers, en évitant les rivières, la route et la ville.

## Changements techniques
- Grille du relief plafonnée à 1000 × 1000 (relief un peu plus grossier, environ 1,5 m par case) ; grille de navigation des bots à 0,75 m ; texture du sol et plan lointain adaptés à la nouvelle taille.

## Points à surveiller
- Chargement long (environ 2 min 30 dans mon environnement de test sans carte graphique ; probablement plus court chez toi, non mesuré).
- Le jeu est surtout testé sur la zone centrale ; je n'ai pas parcouru la ville à pied ni la route.
- Les bots, le butin et les points d'intérêt restent concentrés vers le centre, hors points ajoutés dans la ville.

## v13 — Ville 350×350 au nord-est, étages et assets importés

- **Position** : la ville occupe maintenant x 150…500, z −700…−350 (nord-est). L'ancienne zone (x 100…348, z −348…−100) redevient campagne (villages, route). Plateau terrassé et blocs de collision des maisons adaptés (`relief.js`, `props_rest.js`, `bld_calls.js`).
- **Route nord-sud** : elle traverse la ville par l'avenue x = 224 (la rue centrale de la ville est dans son prolongement).
- **Plan** : 3 rues nord-sud (x 224 / 330 / 420) × 3 rues est-ouest (z −420 / −525 / −630), 16 îlots (tours de bureaux, hôtels, immeubles, commerces, restaurants, un parc avec fontaine).
- **Bâtiments** : étages réellement accessibles (bureaux/hôtels 4 niveaux, immeubles 3, commerces/restaurants 2), escaliers alternés avec trémie dans les dalles, cloison centrale avec portes, mobilier par type (bureaux + chaises, lits, armoires, tables de restaurant, rayonnages). Au-dessus, bloc plein à façade texturée pour les tours.
- **Vitres** : toutes les fenêtres de tous les niveaux sont cassables (2 impacts, éclats, passage possible une fois cassées).
- **Assets importés** (convertis en pleine résolution (triangles identiques dédupliqués), matériaux PBR par pièce (carrosserie, chrome, caoutchouc, vitres) ; texture image sur la table, `src/parts/models.js`) : table, chaise de bureau, Mustang, Mazda CX-7, vélo. Voitures garées (mélange Mustang/Mazda/caisses), vélos devant les îlots et dans le parc.
- **Non utilisés** : herbe et iPhone (trop lourds / sans usage), tracteur et scène « volna » (pas de place dans la ville ; le tracteur peut aller dans les villages).
- **Attention** : chargement plus long (≈ 200 s en test headless sur machine sans GPU).
- **Voitures (v13b)** : jantes chromées + pneus noirs sur la Mustang et la Mazda, vitres teintées sur la Mazda, 8 couleurs de carrosserie (rouge, bleu, blanc, noir, gris, vert, jaune, orange) tirées au hasard pour les voitures garées.

## v14 — Bâtiments de la ville refaits, lampadaires, bouches d'incendie, chargement à la demande

- **Bâtiments** (46, tous les étages accessibles jusqu'au toit) : couloir central, pièces cloisonnées avec portes, cage d'escalier fermée à deux volées avec palier, trémie et édicule sur le toit. Rez-de-chaussée : hall traversant (immeubles, hôtel, bureaux) ou surface ouverte (commerces, restaurants). Bureaux : un étage sur deux en open space.
- **Façades** : bandeaux d'étage, corniche, linteaux et appuis de fenêtres, volets (immeubles), balcons accessibles avec porte-fenêtre (immeubles, hôtel), vitrines + auvent + enseigne (commerces, restaurants), marquise et enseigne (bureaux, hôtel), couleurs variées par bâtiment.
- **Volumes** : tour de bureaux + annexe basse, hôtel + aile restaurant, îlots d'immeubles de 3 à 6 étages avec cour arborée, îlots de 4 commerces/restaurants de 2 à 3 étages.
- **Lampadaires** refaits (mât conique, crosse, lanterne, halo au sol la nuit, éteints le jour), en quinconce.
- **Bouches d'incendie** : 2 par îlot sur les trottoirs.
- **Chargement à la demande** (`src/parts/stream.js`) : bâtiments, voitures, lampadaires, arbres et bouches d'incendie de la ville ne sont construits que lorsque le joueur est à moins de 160 m, puis masqués au-delà de 200 m ; les secteurs fusionnés du reste de la carte sont masqués de la même façon. Chargement initial mesuré : 30 s en test sans GPU (≈ 200 s avant), après accélération du calcul du relief (grille spatiale des obstacles, cache de la distance à l'eau).

## v15 — Champs agricoles, forêt, ville agrandie, voitures
- Zone jaune (NO, x −750..−227, z −750..−290) : champs agricoles (34 parcelles 66×48 m : blé, maïs, pousses, labour, colza, prairie), haies, balles de foin, fermes avec silo. Rangées de tiges courtes et irrégulières, sol texturé.
- Zone bleue (SO, x −750..40, z 408..750) : forêt dense (6 000 arbres, clairières).
- Ville agrandie : x 150..738, z −738..−350 (588×388 m), rangée nord en parcs.
- Voitures : plus de « caisses » ; uniquement les modèles Mustang et Mazda fournis (8 couleurs).
- Lampadaires : projecteurs coniques orientés vers le sol la nuit (18 h 42 – 6 h 18). Les 10 plus proches (< 350 m) éclairent, les 2 plus proches projettent des ombres ; halo lumineux sur chaque lanterne + halo chaud au sol.
- Bouches à incendie : modèle importé de `borne_hydrante.blend` (3 pièces, ~1 m de haut, rouge) à la place du modèle fait à la main ; collision conservée.

## v16 — Textures des champs, corrections terrain/arbres, optimisation
- Champs : cultures en plans texturés (blé, maïs, jeunes pousses, colza dessinés tige par tige) à la place des blocs ; sol des parcelles calé exactement sur le maillage du terrain (plus de terrain qui traverse) ; cours de ferme qui suivent le relief.
- Terrain : couleurs du sol lissées (plus de taches à bords nets) ; anneau extérieur raccordé au terrain jouable (écart au bord 11,5 m → 0,5 m).
- Arbres : plus aucun arbre dans une parcelle ni collé au mur d'enceinte ; troncs affichés seulement à moins de 190 m.
- Optimisation : terrain découpé en 256 morceaux + anneau en 100 morceaux (seuls ceux à l'écran sont dessinés), anneau 720k → 259k triangles, champs masqués au-delà de 300 m, ombres des lampadaires recalculées 9 fois/s. Triangles par image : ville jour 3,67 M → 0,50 M ; ville nuit 5,88 M → 1,46 M ; champs 3,55 M → 0,39 M ; forêt 4,05 M → 1,22 M.
- Voitures : peinture métallisée vernie, salissure en bas de caisse, vitres teintées (elles prenaient la couleur de la carrosserie), jantes chromées, pneus mats ; nouvelle palette de 8 teintes.
- Divers : touches J, Y, I, virgule, point réservées (soins) dans le changement de touches ; texte des skins sans effet corrigé.
