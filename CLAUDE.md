# MILSIM FPS — guide de reprise (Claude Code)

FPS Three.js r128 **dans un seul fichier HTML** (`MILSIM_FPS.html`, ~32 Mo, interface en français). Dépôt : github.com/ZeKels123/MilsimFPS (branche `main`). Version actuelle : **v64c** (289/289 tests).
Le propriétaire (Kilian) reste sur HTML (pas de .exe/Godot pour l'instant), veut des réponses **concises en français**, sans encouragements vides. Le coop multijoueur est reporté.

## Sources et build
- Le HTML est **généré** : `cd src && python3 build.py` concatène `src/parts/*.js` (≈100 fichiers) + patches `rep(old,new)` dans `build.py` → écrit `MILSIM_FPS.html` et `index.html`. Ne jamais éditer le HTML à la main.
- Le build affiche « ok <taille> ». La syntaxe JS est vérifiée avec `node --check` **avant** toute écriture (écriture atomique via fichier temporaire) : en cas d'ERREUR DE SYNTAXE, ou si `node` est absent, le build échoue et `MILSIM_FPS.html`/`index.html` existants restent intacts. Les `rep()`/`srep()` échouent si le nombre d'occurrences diffère de l'attendu.
- Avant livraison : `grep -c "cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" MILSIM_FPS.html` = 1 et `grep -c '\.\./three.min.js'` = 0 (une variante de test avec `../three.min.js` bloque le jeu à 93 % au chargement).
- `src/parts/weapons2.js` : absent du build (non référencé par `build.py`), inutile ; ne pas le recréer.
- Données lourdes générées par outils : `arbres_data.js` (arbres Sketchfab), `deco_int_data.js` (mobilier intérieur), `deco_ext_data.js` (buissons/décor extérieur), `models.js`. Outils dans `tools/` (`*_export.py` = lecture des .glb sur le PC, `*_pack.py` = empaquetage, `tex_photo_stats.py` = calibrage des textures procédurales).

## Graphify
- Carte du code : `docs/MODULES.md` (générée). Après modification des parts : `graphify update src/parts`.
- `src/parts/graphify-out/` est ignoré par git (`.gitignore`) ; ne pas le commiter.

## Tests
- Suite : `python3 tests/run_tests.py <fichier.html>` (Playwright + Chromium SwiftShader, ~5–10 min, ~289 tests dans `src/parts/selftest.js`, `deco_ext_test.js`, etc., dont « un test par fonctionnalité »). Un seul test : `window.SELFONLY=/regex/; SELFTEST().results` après chargement.
- Pour tester, utiliser une copie du HTML avec three.js local (`../three.min.js`), mais **livrer le HTML du build**.
- Un seul Chrome à la fois (verrou `flock /tmp/chrome.lock`) ; ne pas faire `pkill chrome`. SwiftShader ≈ 0,3 i/s : les mesures de perf n'y sont que relatives ; la forêt dense fait planter Chrome (captures impossibles dedans).
- Tests intermittents connus : Tactique (annonce horaire), Explosion véhicule, Mémoire du joueur (embuscade), Berges, Hitbox, Mirador v59, Serpent, Convoi (arbres/route). Les relancer seuls avant de conclure à une régression.
- Hooks utiles en console : `mmPlay('full')`, `P` (joueur : x,z,yaw,pitch,gy), `GH(x,z)` (hauteur du sol), `bots`, `TRE`, `DX.list` (décor extérieur), `DCO` (mobilier), `UPH` (toits), `boxes` (collisions), `HS` (empreintes de maisons).

## Règles de travail
- Commits avec les trailers `Co-Authored-By` et `Claude-Session` habituels ; pousser sur `origin main`.
- Après chaque version livrée : envoyer le HTML, `docs/AMELIORATIONS.md` (journal par version, à tenir à jour par le chef de projet uniquement), `docs/PROCHAINES_AMELIORATIONS.md`, crédits dans `docs/CREDITS_ASSETS.md`. Captures dans `docs/captures/vN/`.
- Assets : uniquement CC0 / CC-BY, crédités. Modèles importés **non simplifiés** (LOD de distance autorisé). Les textures issues de photos sont recréées en **procédural** dans le jeu (aucune photo embarquée). Chargement total bien sous 4 min (actuellement ~55 s en test).
- Assets téléchargés sur le PC de Kilian : `C:\Users\Fixe\Downloads\assets jeux\` (textures_batiments, textures_terrain, Sketchfab\arbres, buissons, interieur, decor, `Sketchfab\CREDITS.md`).

## Architecture (où chercher)
- Monde : `relief.js` (heightfield `GHg`/`GH`, eau, flatten sous maisons), `city.js` (ville NE, route `CT`), `bld_head/bld_house.js` (maisons, étages, toits, `roofDress`/`roofTank`), `nature*.js`, `arbres.js` (InstancedMesh par espèce, LOD0/1/impostor, vent shader), `deco_ext.js` (29 variantes, LOD/culling), `deco_int.js` (~54 meubles, placement déterministe par type de pièce).
- Combat : armes (`weapons*.js`), balistique, santé par zones, grenades, pièges, véhicules, `fx.js`, `audio3d.js`.
- IA : `ai.js`, `bots*.js`, escouades (`sqTick`), voix (`docs/VOIX.md` généré par `tools/voix_liste.py`), navigation (`navBuild`, `AI.poi`).
- Textures : `tex.js` (procédurales calées sur photos ambientCG ; `qrank`, shader herbe/terre).
- Carte 1500 × 1500 m : ville NE (route nord-sud), champs au NO, grande forêt au SO, rivière/étang, 36–40 ennemis en 8 escouades à mise en veille hors portée.

## Contenu déjà présent (résumé)
Menu (Jouer carte complète / zone d'entraînement, Paramètres, skins de camouflage), postures, endurance/poids/sac à dos, santé par zones, balistique réaliste, grenades (frag/flash/assourdissante), mines et pièges, véhicules, IA en escouade avec voix et ordres, mémoire du joueur, embuscades, étages/toits accessibles, fenêtres brisables, audio spatialisé, météo/nuit, lampadaires, faune, arbres Sketchfab, mobilier intérieur et décor extérieur (v64), équipements de toit détaillés (v64c).

## Défauts connus / à faire
- Végétation : « Real Bush » ressemble à des touffes d'herbe, jeunes sapins plastiques, haies plates ; calibrage luminosité dans `DXADJ` (deco_ext.js).
- Falaises désactivées (`dxCliffs` retourne 0 : maillage déformé) ; seaux/projecteurs non posés aux bunkers ; 3/39 étages sans lit ; caisson de trappe et cubes de béton de toit encore en cubes.
- Perf réelle non mesurée sur GPU (Kilian ≈ 23 i/s) ; IA ≈ 6 ms/mise à jour ; monde non déterministe (hash).
- Relève de mirador instable ; humus/sable/Grass007 non branchés au terrain ; T_paint non recalibré.
- Assets manquants : table de briefing, tapis, pupitre, PC fixe, machine à café, civière, murets de pierre, troncs couchés, abri de jardin, puits, boîte aux lettres, poteaux électriques, panneaux routiers, abribus, poubelles de rue.
- Idées : avions décoratifs (F-14/F-15/AH-6 fournis), coop multi (reporté), liste complète dans `docs/PROCHAINES_AMELIORATIONS.md`.
