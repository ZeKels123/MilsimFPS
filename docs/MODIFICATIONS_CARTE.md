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
- **Assets importés** (convertis en modèles légers à couleurs par sommet, `src/parts/models.js`) : table, chaise de bureau, Mustang, Mazda CX-7, vélo. Voitures garées (mélange Mustang/Mazda/caisses), vélos devant les îlots et dans le parc.
- **Non utilisés** : herbe et iPhone (trop lourds / sans usage), tracteur et scène « volna » (pas de place dans la ville ; le tracteur peut aller dans les villages).
- **Attention** : chargement plus long (≈ 200 s en test headless sur machine sans GPU).
