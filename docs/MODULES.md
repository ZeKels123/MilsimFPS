# Carte des modules (générée avec graphify, v64c)

Les ~100 fichiers de `src/parts/` partagent une portée globale unique (concaténation dans un seul `<script>`) : aucun import. Les fichiers sont regroupés ici en **10 modules logiques**, sans déplacer de fichier (l'ordre de concaténation dans `build.py` reste intact).

| Module | Fichiers | Rôle |
|---|---|---|
| **rendu** | gfx_head, tex, wtex, post, three_post, fx, finitions, perf, stream, night, weather, phares | moteur, textures procédurales, post-traitement, météo/nuit, effets |
| **monde** | relief, nature, nature2, arbres, city, cityroad, monde, farm, levels, props_rest, props3d, etabli, samples, extra | terrain, eau, végétation, ville, props |
| **batiments** | bld_head, bld_house, bld_calls, deco_int, deco_ext, destruct | maisons, étages, toits, mobilier, décor extérieur, destruction |
| **combat** | weapon, weapons, armes2, hmg, ballistics, nades, nadeview, melee, traps, barrels, visee, signal, reclamer, trip | armes, balistique, grenades, pièges |
| **joueur** | health, blessures, blesses, mort, effort, survie, inventory, hands3, soldier, anims, persist, realisme | santé, endurance, inventaire, modèle du soldat |
| **ia** | ai, bots, bots_vie, squad, orders, percep, tactic, voix, hitbox, snake | bots, escouades, perception, voix, navigation |
| **vehicules** | vehicles, drive | jeep et conduite |
| **audio** | audio3d | audio spatialisé |
| **ui** | menu, menu0, merge, loading | menu, paramètres, chargement |
| **tests** | selftest, deco_ext_test | suite de tests |
| *données* | `*_data.js`, models, models2, soldier_anim | blobs générés par `tools/` (exclus du graphe) |

## Dépendances entre modules (noms de fonctions/variables d'un module utilisés dans un autre)
- **rendu** est la base : `T_*` (textures), `floor`, `inRoom`, `impact` sont utilisés par monde, batiments, joueur, ia, ui.
- **combat ⇄ joueur ⇄ ia** forment le cœur couplé : `bhHit/hlApply/effTick` (joueur) appelés par combat et ia ; `aiHit/botDie/losClear` (ia) appelés par combat ; `balBot/balWind` (combat) appelés par joueur et ia.
- **monde ⇄ batiments** : `ROOMS`, `GLASS`, `dstBlast` d'un côté ; `arbDepth`, `BROOK` de l'autre (arbres/ruisseau vs maisons).
- **audio** dépend de rendu/monde (`inRoom`, `wDist`, `noise`) ; tout le monde appelle `auInit/sndAt/sfxBoom`.
- **vehicules** est le plus isolé (joueur, monde, rendu seulement).
- Pas de cycle d'import (impossible ici : portée globale) ; les vrais cycles sont fonctionnels, ex. combat → ia → combat.

## Hubs (fonctions les plus connectées)
`invRender`, `trapUpdate`, `wpS`, `fbm`, `P4`, `spec`, `lutc`, `auInit`, `dxH`, `dxAdd`.

## Utiliser le graphe
```bash
graphify update src/parts          # régénère src/parts/graphify-out (sans LLM, ~10 s)
graphify query "comment un tir touche un bot" --graph src/parts/graphify-out/graph.json
graphify explain "aiHit" --graph src/parts/graphify-out/graph.json
graphify path "fire" "botDie" --graph src/parts/graphify-out/graph.json
```
Rapport : `src/parts/graphify-out/GRAPH_REPORT.md` ; vue interactive : `graph.html`. Exclusions : `.graphifyignore`.

## Limite
graphify ne résout pas les appels entre fichiers (portée globale) : les liens inter-modules ci-dessus viennent d'une recherche de noms. Pour un vrai découpage physique (sous-dossiers par module), il faudrait adapter `rd()` dans `build.py` ; non fait car `weapons2.js` manque pour vérifier le build.
