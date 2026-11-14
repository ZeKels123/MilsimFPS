# MILSIM FPS — Changements et feuille de route

## Ce qui a été changé (v9, partiel)

- **Bruitages refaits** (`audio3d.js`) : `snd()`/`sndAt()` synthétisent selon le type (clic mécanique, tintement métallique, choc/explosion, souffle, signal) au lieu d'un oscillateur brut ; tir du joueur par arme (claquement, corps, coup sourd, mécanique, queue réverbérée, version silencieux) ; explosion de grenade (détonation, souffle, grondement, débris) ; tirs des bots enrichis.
- **Carte** : pente douce sur 15 m autour des maisons (plus de fosses à pentes en escalier) ; arbres lointains en cartes de feuillage (plus de gros cônes), distance de détail adaptée au zoom ; étoiles rondes.
- **Buissons** : texture dédiée (tiges, feuilles nervurées par paires, baies), modèle en gerbe partant du pied.

Reste à faire : modèles et textures des armes (`src/parts/wtex.js` est prêt mais pas encore branché), modèles de grenades et animation de lancer.
Non vérifié : les sons n'ont pas été écoutés (seulement exécutés sans erreur), performances sur GPU réelle.

## Ce qui a été changé (v8)

- **Arbres et buissons refaits** : pins en étages de rameaux alpha, feuillus en amas de feuilles, buissons en dôme de cartes. Feuillage transparent (les feuilles découpent la silhouette, y compris dans les ombres) et animé par le vent (balancement + frémissement des feuilles). Deux niveaux de détail (cartes près, volumes simples loin), troncs instanciés (beaucoup moins d'objets à dessiner).
- **Herbe autour du joueur seulement** : réserve d'instances recentrée (rayon 46 m, cellules de 3 m mémorisées), au lieu de 30 000 brins sur toute la carte.
- **Ombres en cascade** : 2 cartes d'ombre (près ±28 m, loin ±110 m, mélange dans le shader) ; la carte lointaine se met à jour 4 fois moins souvent.
- **Rivière et ponts** : rivière d'un bord à l'autre (ouest vers est, via l'étang), relief aplani le long de l'eau, 3 ponts en bois (tablier au niveau du terrain, garde-corps en collision, routes d'accès), dont un sur le ruisseau. Les bots passent par les ponts, l'eau profonde leur est interdite.
- **Animaux touchables** : lapins, chevreuils, canards et oiseaux se tirent, tombent et réapparaissent après 80 s.
- **IA en escouade** (`src/parts/squad.js`) : 4 escouades. Appui (Mastodonte) : tir de suppression sur la dernière position connue, avec claquements et secousse si les balles passent près. Assaut : alerte partagée, convergence par deux côtés. Infirmier (Soldat) : rejoint et soigne un blessé ; sans infirmier, auto-soin à l'abri. Repli groupé vers un point commun quand l'escouade est réduite de moitié après des pertes ou très blessée.

Limites : pas testé sur GPU réelle (performances), tir sur animal au sol vérifié seulement par le code (oiseau testé), sons non écoutés, équilibrage de l'escouade à affiner en jeu.

## Ce qui a été changé (v7)

**Carte doublée : 300 × 300 m** (constante `MH=150`, au lieu de 75). Relief, navigation des bots, arbres, rochers, herbe, flaques, murs d'enceinte et collines extérieures suivent. 18 maisons supplémentaires dans l'anneau extérieur (7 à étage avec escalier intérieur jusqu'au toit), 2 bunkers avant-postes, chemins qui les relient aux routes existantes, 18 bots. Vue de dessus : `docs/captures/v7/vue_dessus.png`.

**Système de santé par zone (joueur et bots)**
- 7 zones : tête, thorax, ventre, bras gauche/droit, jambe gauche/droite, chacune avec ses PV. Mort si tête ou thorax à 0, ou par hémorragie (sang à 0).
- **La zone touchée n'est jamais tirée au sort** : la balle d'un bot est un rayon (point visé = centre du torse, dispersion selon sa précision), testé contre les volumes du corps du joueur (debout, accroupi, couché, penché) et contre les murs, couverts et vitres. Un couvert bas protège les jambes, un tir de profil touche un bras.
- Effets déterministes : saignement léger si dégât net ≥ 4, fort si ≥ 18 ; fracture d'un membre si coup ≥ 20 ou PV du membre à 0 ; casque (30) absorbe 70 % des dégâts à la tête, gilet absorbe thorax/ventre.
- Jambes : blessée = plus lent, brisée = très lent, ni sprint ni saut, deux jambes brisées = ramper seulement. Bras droit (arme) : dispersion, recul et rechargement dégradés, pas de visée avec une arme longue s'il est brisé. Bras gauche : visée et rechargement plus lents. Ventre : hémorragie interne à 0 PV. Douleur, tremblements, vision rouge/floue, endurance.
- Soins : **J** bandage, **Y** garrot (membre, rappuyer pour le retirer), **I** attelle, **,** morphine, **.** trousse. Soigner bloque le tir et ralentit ; bouger ou tirer annule. La zone sûre fait office d'infirmerie et réapprovisionne. +1 bandage / 3 éliminations, +1 morphine / 5.
- Grenades : l'éclatement lance des rayons d'éclats répartis sur le corps (bloqués par les murs), plus une surpression (jambes fracturées de près). Mêmes règles pour les bots, avec effets : jambe touchée = boite, bras droit brisé = arme lâchée ou tir dégradé, saignement = mort par hémorragie.
- HUD : silhouette colorée par zone, gouttes de sang, croix de fracture, bande de garrot, sang, casque, endurance, stocks.

Fichiers : `src/parts/health.js` (module), crochets dans `build.py`, `ai.js`, `nades.js`, `levels.js`, `bots.js`.

Limites : pas testé sur GPU réelle (performances sur la grande carte, 30 000 brins d'herbe), sons non écoutés, équilibrage à affiner en jeu.

## Ce qui a été changé (v6)

**Étages, escaliers, toits, fenêtres**
- 4 maisons sur 8 ont un étage : (16,5 ; 3,5), (-16,5 ; -12), (-48 ; 38), (50 ; -10). Escalier intérieur dans la pièce principale, trémie avec garde-corps, étage avec 2 fenêtres par côté et mobilier.
- Toit plat avec parapet fermé et abris (caisses, citerne), accessible par une seconde volée à l'intérieur (15 marches, de l'étage au toit) et une trappe dans la dalle, avec garde-corps. Il n'y a plus d'escalier extérieur. Les maisons de plain-pied n'ont pas de toit accessible.
- Hauteur du sol par surface (`groundAt`) : marches, étage et toit sont marchables pour le joueur, les bots et les grenades. Collisions des murs et meubles limitées à leur hauteur.
- Vitres brisées : passage utilisable. Joueur : Espace près d'une fenêtre cassée pour enjamber (position accroupie sur le rebord). Bots : ils franchissent la fenêtre ; la grille de navigation est recalculée quand une vitre éclate ou se répare.
- Chute : dégâts au-delà de 9 m/s de vitesse verticale.

**Postures du joueur**
- Ctrl : debout → accroupi → couché → debout. P : couché / debout. Espace : saut, se relever, enjamber.
- Hauteur des yeux 1,7 / 1,1 / 0,5 m ; vitesse ×1 / ×0,5 / ×0,2 ; pas de sprint hors position debout. Les bots visent la hauteur réelle du corps.

**Sons spatialisés**
- Panoramique HRTF selon la direction, atténuation par la distance et absorption de l'air.
- Réverbération de maison et de bunker, écho en extérieur ; sons étouffés derrière les murs (lancer de rayon, budget limité par image).
- Pas selon le sol (terre, herbe, béton, bois, eau, métal, gravier) ; coups de feu différents par arme ; portes, verre et grenades positionnés.
- Pluie : bruit extérieur, crépitement sur le toit au-dessus de la tête, grondement sourd dans le bunker.
- Les pas du joueur sont entendus par les bots : rayon 13 m en sprint, 7 m en marche, 2,8 m accroupi, 1,1 m couché.

**Bots**
- Visages : yeux qui clignent, sourcils (froncés en visée), bouche (s'ouvre au tir ou au choc), oreilles ; peinture de camouflage pour le tireur d'élite ; visage masqué pour le Mastodonte, lunettes relevées pour le Soldat.
- Mains : 4 doigts à 3 phalanges et pouce, qui se referment sur l'arme.
- 7 morts : en arrière, en avant, à genoux, pirouette, tir à la tête, assis contre le mur, projeté par une explosion.
- L'arme tombe au sol (rebonds avec sons, repos, 14 armes au maximum, disparition après 22 s).
- Les bots occupent les étages et les toits (tireurs d'élite en priorité), y restent postés et redescendent s'ils sont blessés ou inactifs. Simulation : les 4 maisons, montée jusqu'au toit en 4 à 9 s, descente complète.
- Cagoule des bots refaite : coque qui épouse la tête, bord de tissu, col autour du cou (elle était un bloc qui dépassait).
- L'invite « F — Ouvrir la porte » n'apparaît plus depuis un autre niveau que la porte.

**Limites connues (v6)**
- Non testé sur un vrai GPU ni à l'oreille : le son n'a été vérifié que sans erreur, pas écouté. Les images par seconde réelles et l'équilibrage restent à vérifier en jouant.
- Poses de mort vérifiées sur une planche fixe, pas en combat. Doigts et pouce vérifiés grossièrement.
- Bots qui franchissent des fenêtres brisées : non simulé en test dédié.
- Le joueur à l'étage ignore les portes du rez-de-chaussée.

## Ce qui a été changé (v5)

**IA des bots**
- Navigation par A* sur une grille de 0,5 m (murs, arbres, meubles, eau profonde) : les bots contournent les obstacles, entrent dans les maisons et ouvrent les portes.
- États : patrouille entre points d'intérêt (chemins, maisons, collines, étang), attaque, mise à couvert, contournement, poursuite, fouille, fuite devant une grenade.
- Perception : champ de vision, ligne de vue réelle, portée réduite la nuit (sauf lampe allumée) et dans le brouillard. Ils entendent les tirs (48 m, 12 m avec silencieux) et les explosions, et se préviennent entre eux.
- Ils ne regardent plus le joueur en permanence : temps de réaction, rafales, chargeur limité, rechargement à couvert, accroupissement.
- Rôles : la Recrue fonce et contourne, le Soldat tient le couvert et lance des grenades, le Tireur d'élite garde ses distances et cherche un point haut, le Mastodonte avance en tirant.
- Poursuite à vue puis fouille autour de la dernière position connue.
- Réapparition à plus de 38 m du joueur. Traçantes sur les tirs ennemis et indicateur de direction des dégâts.

**Modèles des bots (v5.1)**
- Une arme modélisée par type : pistolet-mitrailleur (Recrue), fusil d'assaut avec optique (Soldat), fusil de précision à lunette et bipied (Tireur d'élite), mitrailleuse à boîte de munitions (Mastodonte).
- Tenue de l'arme : crosse à l'épaule, main droite sur la poignée, main gauche sur le garde-main. Les bras sont calculés (cinématique inverse) pour atteindre l'arme dans toutes les poses. Le Mastodonte tire à la hanche.
- Postures : visée (buste de biais, tête penchée sur l'arme, arme qui suit la hauteur de la cible), arme basse en patrouille, rechargement (la main gauche va au chargeur), genou à terre à couvert.
- Corps refait : bassin et ceinture, torse en deux volumes, épaules, gilet avec poches et plaque dorsale, sac à dos, genouillères, bottes, gants, cagoule, casque antibruit, chapeau de brousse.

**Grenades (C pour lancer, molette sans viser ou U pour changer de type)**
- Frag : dégâts de zone (7,5 m) sur les bots et le joueur, atténués derrière un mur ; casse les vitres, abîme les portes.
- Flash : écran blanc pour le joueur selon la distance et la direction du regard ; les bots touchés sont aveuglés 2 à 6 s (main sur les yeux, plus de tir).
- Assourdissante : pour le joueur flou, vision qui tangue, déplacement et visée ralentis, sifflement et son étouffé ; les bots sont sonnés 2 à 6 s.
- Physique : rebonds sur le sol, les murs et les meubles, traverse les vitres en les cassant, éclaboussure dans l'eau (effet réduit).
- Les bots lancent des grenades quand ils ont perdu le joueur de vue ; alerte « GRENADE » avec direction et distance ; les bots fuient les frags.
- 2 de chaque au départ, +1 toutes les 3 éliminations, réapprovisionnement dans le bunker.

**Post-traitement (EffectComposer de three.js r128, intégré au fichier)**
- RenderPass, puis une passe SSAO (occlusion ambiante depuis la profondeur) + flou de mouvement de caméra, bloom (UnrealBloomPass), anticrénelage FXAA.
- L'arme en main est exclue du flou de mouvement.

**Nature**
- Vent : herbe, buissons, sapins, feuillus et roseaux bougent, plus fort sous la pluie et l'orage. L'herbe se couche au passage du joueur.
- Étang (environ 20 × 14 m) dans le creux à l'est du bunker, alimenté par un ruisseau qui part d'une source entre des rochers. Eau animée (reflets du ciel, reflet du soleil, écume au bord, ronds de pluie, sillage du joueur), roseaux, nénuphars.
- On marche dans l'eau (ralenti, éclaboussures) ; profondeur maximale 1 m.
- Faune : 2 vols d'oiseaux et des oiseaux posés sur les toits qui s'envolent, 7 lapins, 3 chevreuils, 3 canards, poissons, papillons le jour, lucioles la nuit. Les animaux fuient le joueur, les bots, les tirs et les explosions.
- Ambiance sonore : oiseaux le jour, grillons la nuit, grenouilles près de l'étang, clapotis près de l'eau.
- Correction : les creux du relief étaient masqués par le sol extérieur ; ils sont maintenant visibles.

**Optimisation**
- Fusion des maillages statiques par matériau et par secteur de 50 m : 2 400 objets regroupés en 183. Appels de dessin mesurés sur la vue du hameau : 1 392 → environ 530, faune, eau et effets compris.
- Tirs, lasers et lignes de vue : le sol est testé par marche sur la grille de hauteur au lieu de 40 000 triangles. Un rayon : 2,6 ms → 0,2 ms.
- Ombres recalculées une image sur deux (une sur trois en qualité Bas).
- Le HUD ne réécrit le DOM que lorsque le texte change.
- Qualité graphique (touche O) : Auto, Bas, Moyen, Élevé, Ultra. Règle la résolution, la taille des ombres, les effets et la densité d'herbe. En Auto, le jeu part en Élevé et descend d'un cran si une image dure plus de 26 ms en moyenne.
- Images par seconde affichées en bas de l'écran.

**Limites connues**
- Non testé sur un vrai GPU : les mesures viennent d'un rendu logiciel. Les images par seconde réelles et l'équilibrage des bots restent à vérifier en jouant.
- Les ombres des arbres ne suivent pas le balancement du feuillage.
- Les animaux ne peuvent pas être touchés par les tirs.
- Le compteur d'images par seconde ne descend pas sous 20.

## Ce qui a été changé (v4)

**Carte et terrain (150 × 150 m)**
- Arène passée de 60 à 150 m de côté, murs d'enceinte à 75 m, forêt et collines au-delà.
- Moins de bâtiments, mieux répartis : 8 maisons (un hameau de 4 au centre, 4 fermes isolées) et un seul bunker, celui du spawn, au lieu de 9 bâtiments serrés.
- Relief fractal (bruit à plusieurs échelles, déformation de domaine, grandes collines), de -3,7 m à +4,5 m. Le sol reste plat autour des bâtiments, de la zone sûre et des murs.
- Terre plus marquée sur les pentes et les crêtes, herbe dans les creux.
- 8 chemins de terre qui relient les bâtiments, bosquets d'arbres (pins et feuillus) dont la densité suit un bruit, quelques arbres isolés. Les troncs bloquent le joueur et les balles.
- 300 cailloux, 130 buissons, 11 000 touffes d'herbe, 16 flaques.

**Relief jouable**
- La hauteur du sol (fonction GH) intervient pour le joueur (caméra, penchage), les ennemis (pieds posés au sol), les tirs et les lasers, la vue des ennemis (une colline masque), les explosions, les rochers, buissons, herbe, flaques, arbres.

**Bâtiments**
- Maisons à 2 pièces avec cloison et porte intérieure (F pour ouvrir) : chambre + salle de bain, cuisine + cellier, salon + bureau, atelier + chambre.
- Vitres cassables : un premier tir fissure la vitre, le second la fait éclater (éclats, bruit de verre). Les balles continuent à travers. Les vitres se réparent à ta mort. Les ennemis tirent à travers une vitre intacte en la brisant.
- Un bunker en béton (spawn, zone sûre) remplaçant les 5 d'origine : toit plat avec parapet, antenne, aération, porte d'acier renforcée (450 PV), meurtrières à barreaux, deux pièces : armurerie avec établi à l'avant, pièce arrière derrière une porte intérieure.
- Éclairage intérieur : une lampe par pièce, plus forte la nuit.

**Jour / nuit et météo**
- Cycle complet (1 h de jeu ≈ 32 s) : lever, jour, coucher, nuit étoilée avec lune. Le soleil, la lune, les ombres, les couleurs du ciel, le brouillard et les reflets suivent l'heure.
- Météo : clair, nuageux, pluie, orage (éclairs, tonnerre), brouillard, avec transitions douces. La pluie disparaît à l'intérieur, le sol devient mouillé et brillant.
- Touches : N avance de 2 h (Maj+N recule de 1 h), M change la météo, L allume la lampe torche.

**Armes**
- Modèles plus détaillés : rail à crans, fentes de garde-main, levier d'armement mobile, éjecteur, chargeur nervuré (fusil) ; crans de glissière, mire, détente, pontet, plaque de chargeur (pistolet) ; écran thermique, bouchon de tube, cartouches sur le flanc, rainures de pompe (fusil à pompe) ; canon cannelé, frein de bouche, joue, bipied replié (précision).
- Animations propres à chaque arme : levier d'armement tiré sur chargeur vide (fusil) ; chargeur qui sort et rentre, glissière relâchée (pistolet) ; cartouches glissées une à une, pompage final, arme inclinée (pompe) ; culasse ouverte, chargeur changé, culasse refermée (précision). Inspection propre à chaque arme (retournement du pistolet, pompage du fusil à pompe, culasse du fusil de précision).

**Visée**
- Mode de secours sans verrouillage du pointeur : la souris oriente la caméra horizontalement et verticalement, comme en v1.

## Rappel v3 (textures et maisons)

**Textures (toutes refaites, avec cartes de relief calculées)**
- Béton banché : panneaux de coffrage, trous de banche, pores, coulures, fissures, salissure au pied des murs. La texture se raccorde d'un mur à l'autre.
- Sol : terre battue et herbe en 1024 px, cailloux, variation de teinte à grande échelle.
- Bois (planches, parquet avec joints, nœuds), caisses de munitions marquées, fûts peints avec rouille et étiquette, dalles béton, tuiles avec mousse, pierre (moellons), crépi.

**Maisons (reconstruites de zéro)**
- Murs en crépi de couleur différente par maison, soubassement en pierre, toit épais à débords avec faîtière, pignons, cheminée, auvent et marche devant la porte, volets.
- Vraies fenêtres ouvertes : on voit et on tire à travers (les ennemis aussi).
- 4 intérieurs différents : chambre, cuisine / salle à manger, salon (canapé, poêle, bibliothèque, bureau), atelier-armurerie (établi, étagère métallique, caisses).
- Parquet ou dalles selon la pièce, plafond en bois avec poutres, suspension.

## Rappel v2 (graphismes, terrain, ennemis)

**Rendu**
- Matériaux PBR (MeshStandard) à la place de Lambert, tone mapping ACES, éclairage ambiant issu du ciel (reflets sur les armes, métal des tonneaux).
- Ombres dynamiques du soleil (carte 2048, suivent le joueur, anti-scintillement) sur murs, caisses, bots, maisons.
- Ciel procédural (dégradé, soleil, nuages animés), brouillard accordé à l'horizon.
- Vignettage + grain d'image, HUD en verre dépoli.
- Qualité adaptative : si le jeu passe sous ~37 FPS, la résolution de rendu baisse automatiquement.

**Terrain**
- Sol en texture procédurale (terre, herbe, gravier), 1 400 touffes d'herbe, 110 cailloux, buissons, flaques réfléchissantes.
- Collines et forêt de sapins hors de l'arène, poteaux d'éclairage aux angles.
- Béton avec taches, joints et traces de ruissellement ; caisses en bois avec cadre et renfort ; tonneaux métalliques.

**Maisons**
- 4 petites maisons où l'on entre (porte avec F) — remplacées en v3.

**Ennemis**
- Nouveau modèle : tête, casque/casquette/chapeau selon le type, visière (rouge pour le Mastodonte), gilet avec poches, épaulières, bras à coude, jambes à genou, bottes, camouflage.
- Animations : marche (hanches + genoux), balancement du buste, inclinaison en déplacement latéral, respiration et regard à l'arrêt, recul au tir, secousse quand touché, chute en arrière à la mort.
- Flash de bouche des bots lorsqu'ils tirent.

**Effets**
- Flash de bouche avec lumière, traceurs, douilles qui rebondissent, impacts (poussière, étincelles, trous de balle), éclats sur armure, poussière en suspension.
- Explosions AC-130 : boule de feu, onde de choc, fumée, étincelles, lumière, traces de brûlure.

**Corrections au passage**
- Les ennemis morts ne bloquent plus les balles.
- Suppression d'un script externe inconnu (cdn.discordapp.com) présent dans l'en-tête du fichier.

## Rappel v2 (graphismes, terrain, ennemis)
**Rendu**
- Matériaux PBR (MeshStandard) à la place de Lambert, tone mapping ACES, éclairage ambiant issu du ciel (reflets sur les armes, métal des tonneaux).
- Ombres dynamiques du soleil (carte 2048, suivent le joueur, anti-scintillement) sur murs, caisses, bots, maisons.
- Ciel procédural (dégradé, soleil, nuages animés), brouillard accordé à l'horizon.
- Vignettage + grain d'image, HUD en verre dépoli.
- Qualité adaptative : si le jeu passe sous ~37 FPS, la résolution de rendu baisse automatiquement.

**Terrain**
- Sol en texture procédurale (terre, herbe, gravier), 1 400 touffes d'herbe, 110 cailloux, buissons, flaques réfléchissantes.
- Collines et forêt de sapins hors de l'arène, poteaux d'éclairage aux angles.
- Béton avec taches, joints et traces de ruissellement ; caisses en bois avec cadre et renfort ; tonneaux métalliques.

**Maisons**
- 4 petites maisons où l'on entre (porte avec F) — remplacées en v3.

**Ennemis**
- Nouveau modèle : tête, casque/casquette/chapeau selon le type, visière (rouge pour le Mastodonte), gilet avec poches, épaulières, bras à coude, jambes à genou, bottes, camouflage.
- Animations : marche (hanches + genoux), balancement du buste, inclinaison en déplacement latéral, respiration et regard à l'arrêt, recul au tir, secousse quand touché, chute en arrière à la mort.
- Flash de bouche des bots lorsqu'ils tirent.

**Effets**
- Flash de bouche avec lumière, traceurs, douilles qui rebondissent, impacts (poussière, étincelles, trous de balle), éclats sur armure, poussière en suspension.
- Explosions AC-130 : boule de feu, onde de choc, fumée, étincelles, lumière, traces de brûlure.

**Corrections au passage**
- Les ennemis morts ne bloquent plus les balles.
- Suppression d'un script externe inconnu (cdn.discordapp.com) présent dans l'en-tête du fichier.

## Pistes d'amélioration (par ordre de valeur)
1. Équilibrage après essai réel : précision, portée et nombre de bots, fréquence des grenades, postes en hauteur.
2. Modes de jeu : points de contrôle, vagues, objectifs ; écran de fin de partie.
3. IA en escouade : rôles coordonnés, tir de suppression, bots qui se soignent ou se replient ensemble.
4. Escalier du toit à l'intérieur (trappe), portes de l'étage, plus d'étages et de toits accessibles.
5. Animaux touchables, pont sur le ruisseau, rivière qui traverse la carte.
6. Ombres en cascade, LOD des arbres, herbe générée autour du joueur seulement.

## À faire à chaque nouvelle version (checklist)
1. Garder une copie de la version précédente (nom versionné : MILSIM_FPS_v6.html).
2. Appliquer les changements sur la copie, jamais sur l'original.
3. Ouvrir la console du navigateur : zéro erreur rouge.
4. Test visuel : vue d'ensemble de la carte, extérieur et intérieur d'un bâtiment, nuit, pluie, étang, un ennemi de près, un tir, une grenade de chaque type, l'AC-130.
5. Test de jeu : déplacement sur relief et dans l'eau, collisions, portes (F), vitres, tir, rechargement de chaque arme, établi, grenades, bots qui patrouillent, attaquent, se couvrent et réapparaissent.
6. Mesurer les FPS sur un PC modeste dans chaque qualité (touche O) ; si < 40 en Moyen, réduire ombres / herbe / résolution.
7. Prendre 5 captures de référence et les comparer à la version précédente.
8. À chaque modification de la carte (bâtiments, relief, chemins, végétation, eau) : générer et envoyer une vue de dessus annotée de la carte (`vue_dessus.png`).
9. Pousser la version sur GitHub (`ZeKels123/MilsimFPS`) : jeu, sources, ce fichier, et les captures dans un dossier par version (`docs/captures/vN/`).
10. Mettre à jour cette liste (changements + pistes restantes).

## v10 — Sac à dos et poids

- **Sac à dos à grille** (Tab) : poches 4×2, petit sac 5×4, moyen 7×5, grand 9×6. Les objets ont des icônes texturées (munitions, soins, plaques, grenades). Rangement automatique, clic pour sélectionner, clic droit pour jeter 1.
- **Poids indépendant du sac** : capacité du joueur fixe à 32 kg ; le sac ne limite que le nombre de cases. Paliers : < 50 % aucun malus, 50–80 % sprint réduit, 80–100 % chargé (plus lent, endurance qui baisse plus vite), > 100 % surcharge (très lent, sprint impossible).
- **Handicap par arme** : vitesse de marche ×0,96 fusil, ×1,00 MP9, ×1,03 pistolet, ×0,92 pompe, ×0,86 sniper (sprint un peu plus pénalisé pour les armes lourdes), appliqué aussi en visée.
- **Jeter** : V jette le sac en vitesse (les poches gardent bandages, garrots, trousse et munitions de l'arme tenue) ; Retour arrière jette 30 munitions ; objets jetables depuis l'inventaire.
- **Objets au sol** : F pour ramasser (sacs, munitions par calibre, soins, grenades, plaques). Butin sur les bots tués. Une trentaine d'objets et 5 sacs répartis sur la carte.
- **Glisser-déposer** : on déplace les objets à la souris dans la grille ; les autres se rangent automatiquement.
- **Mort du joueur** : tout l'équipement tombe dans un sac au sol à l'endroit de la mort ; on repart avec un sac moyen et le kit de départ.

## v11 — Mines et pièges

- **Pièges** : mine antipersonnelle, mine directionnelle (télécommande `9`), piège à fil (grenade), piège à ours. `B` change de piège, clic maintenu pour poser, `F` maintenu pour désamorcer. Ils sont dans l'inventaire (poids et cases) et se trouvent sur la carte et sur les bots.
- **Détection** : les pièges ennemis ne se voient que de près (5,5 m le jour, 3,2 m la nuit) ; le fil passe au-dessus d'un joueur à plat ventre.
- **IA** : un bot sur cinq est « génie » et pose des pièges ; les bots repèrent ceux du joueur (savoir partagé dans l'escouade), les évitent ou les désamorcent.
- **Indices naturels** : 260 branches qui craquent sous les pas (son spatial 3D, bruit qui alerte bots et animaux, plus discret accroupi) ; les oiseaux qui s'envolent devant un bot s'entendent en 3D.
- Correctifs : grésillement constant (le crépitement de la pluie était modulé même par temps clair : sa profondeur suit maintenant le volume de pluie ; sons de branches et d'oiseaux aussi limités en fréquence), caméra libre qui tournait quand l'inventaire était ouvert, indicateur à l'écran remplacé par un son spatial.
- **F8** : désactive / réactive tous les ennemis (test et exploration). **F9** : panneau de diagnostic audio.

## v12 : corrections visuelles
- Ombres : biais augmentés (soleil proche et cascade) → plus de hachures sur la ceinture et les montants de porte.
- SSAO atténuée de 40 % → halos sombres réduits (fenêtres, chaises, arme).
- Herbe exclue de l'emprise des ponts.
- Tirer annule la pose et la vitesse de sprint.
- Restent à traiter : caisse dans un trou, mare coupée, arbres-cônes lointains, rive bruitée au pont, socle en pierre, crépi.
- Crépi : coulures et saleté atténuées (la bande de la façade n'est plus soulignée par des traînées sombres).
- Lumière intérieure : ne s'allume plus automatiquement ; touche 0 dans une pièce pour l'allumer/éteindre.
- Ponts : rampes aux extrémités et tablier élargi pour ne plus tomber dans la rivière en entrant/sortant.
- Carte agrandie : 300 → 350 m de côté (MH 150 → 175), végétation augmentée proportionnellement.
- Fusil à pompe : visée relevée (iy) et main gauche abaissée → plus de grand pan plat devant l'écran en visée.
- Façade : la dalle d'étage ne dépasse plus du mur (fin du scintillement de la bande de bois).
- Carte doublée : 350 → 700 m de côté (MH 175 → 350), végétation ×2,4. Le temps de chargement augmente (grille de navigation 1400², relief 681²).
- Furtivité : à l'ombre (abri du soleil ou pièce sombre sans lumière allumée), la portée de vue des bots est réduite à 62 %.
- Carte : 75 maisons ajoutées dans l'anneau extérieur (voir `docs/MODIFICATIONS_CARTE.md` et `captures/v12/carte_dessus.png`).
- Mains : nouveau modèle (paume, 4 doigts à 3 phalanges, pouce, ongles, poignet, manchette).
- Couteau de combat : touche Z, clic gauche = taillade, clic droit = estoc ; attaque par derrière sur un bot qui ne vous voit pas = mort silencieuse.
- Lumière/ombre : voir plus haut.
- Carte 1500 × 1500 m, ville de 250 × 250 m (immeubles, bureaux, commerces, restaurants, parc, voitures) et route nord-sud : voir `docs/MODIFICATIONS_CARTE.md`.

## Arme : mitrailleuse HMG (hmg.blend)
- Modèle importé depuis `hmg.blend` (4 pièces : corps, caisse de munitions, canon, bouton d armement), converti en géométrie embarquée (`src/parts/hmg_data.js`, `hmg.js`), échelle ~0,85 m.
- 6e arme : 100 coups (+300 en réserve), cadence 800 coups/min, dégâts 30, calibre 7.62, poids 9,5 kg (vitesse ×0,78), rechargement long (4,4 s) avec la caisse qui descend.
- Sélection : établi (bouton « Mitrailleuse HMG »). Couleurs : gris métal / vert, le .blend ne contenait que des couleurs par défaut.

## Menu principal (v15)
- Écran d accueil à 3 boutons : **Jouer** (carte complète ou zone d entraînement), **Paramètres** (volume général, qualité graphique, sensibilité, remappage de 19 touches, enregistrés dans le navigateur), **Équipement** (6 skins d armes et 6 tenues = camouflage uniquement : chaque skin réduit ou augmente la distance à laquelle les ennemis te voient selon la zone (forêt, plaine, ville, intérieur, nuit). Aucun effet sur le tir. Un indicateur de zone s affiche en jeu.)
- Zone d entraînement : champ de tir dégagé à (20, 122), 9 mannequins de 10 à 75 m dont 2 mobiles, aucun ennemi, munitions illimitées, statistiques (tirs, précision, têtes, éliminations, dernier impact). Le bouton ☰ MENU PRINCIPAL est dans l écran de pause.
- Fichiers : `src/parts/menu0.js` (réglages, volume, touches), `src/parts/menu.js` (interface, mannequins, skins).

## Carte, nature et rendu (v15 à v16)
- Voitures : les boîtes ont été remplacées par les modèles Mustang et Mazda fournis (8 de chaque), avec carrosserie vernie et salie en dégradé, vitres teintées, chrome et pneus mats ; 8 teintes de peinture.
- Lampadaires : vraie lumière la nuit (18 h 40 à 6 h 20) avec 10 projecteurs conique répartis sur les lampadaires les plus proches (2 avec ombres), halo de la lanterne et tache de lumière au sol.
- Bouche d'incendie : modèle importé de `borne_hydrante.blend`, avec collision.
- Zone jaune (nord-ouest) : champs agricoles (blé, maïs, colza, etc.) avec textures de culture refaites, haies, bottes de foin et fermes ; le sol suit le relief sans scintillement.
- Zone bleue (sud-ouest) : forêt dense de grands arbres pour se cacher et profiter de l'ombre ; les ennemis voient 28 % moins loin dans la forêt.
- Arbres : 5 essences (pin, feuillu, bouleau, chêne, peuplier) de hauteurs et diamètres différents, troncs colorés par essence, nouvelle texture de feuilles ; la collision suit le diamètre du tronc ; environ 16 770 arbres.
- Terrain : découpé en 16 × 16 morceaux avec culling, anneau extérieur raccordé au relief (jointure ramenée de 11 m à 0,5 m), couleurs lissées, aucun arbre mal placé constaté.
- Optimisation : nombre de triangles par image divisé par 4 à 9 selon la scène.
- Non vérifié : les performances sur un vrai GPU (mes tests tournent en rendu logiciel) et les troncs éclaircis après les dernières captures.
- Détail et captures : `docs/MODIFICATIONS_CARTE.md` et `docs/captures/v12/`.

## Barils explosifs (v16)
- Les 4 barils rouges contiennent du carburant : une balle les perce (fuite, flaque) et peut enflammer les vapeurs (20 % par balle). Un baril en feu explose après 2,5 à 6 s s'il lui reste plus de 30 % de carburant, sinon il brûle sans exploser.
- Réactions en chaîne : une explosion à moins de 4,4 m enflamme les barils rouges voisins. Les barils bleus et verts restent inertes.
- Les flammes infligent des dégâts : environ 20 PV/s au joueur (qui brûle encore 2,5 s après être sorti du feu), 28 PV/s aux bots.
- Les bots ne tirent pas sur les barils. Détail : `docs/MODIFICATIONS_CARTE.md`.

## Véhicules et passages d'avions (v17)
Tracteurs dans les fermes, convoi Ural/Centauro sur la route, passages aléatoires de F-14 et F-15 avec son Doppler. Détail dans MODIFICATIONS_CARTE.md.

## Signal 50 (v18)
Le fusil de précision est remplacé par le Signal 50 importé de signal_50.blend : bullpup semi-automatique, chargeur de 5 balles calibre .50, 125 dégâts, cadence 0,5 s, culasse qui recule à chaque tir (plus de manœuvre de verrou). Lunette intégrée (vue à travers la lunette en visée). Avec le silencieux, la pièce « compensater » est retirée du modèle. Mains repositionnées (poignée pistolet et dessous du canon).

## Grenades : modèle flash et animation de lancer (v19)
Modèle de la grenade flash importé de flash.blend (corps, bande, cuillère, goupille), utilisé aussi pour les grenades à fragmentation et assourdissantes avec une autre couleur. Animation de lancer à la première personne (1,25 s) : l'arme se baisse, la grenade monte dans la main droite, la main gauche arrache la goupille, bras en arrière, lancer, la cuillère s'écarte puis l'arme remonte. La grenade part au moment du lâcher (et non plus au clic) ; recharge/visée interrompues, délai de 1,5 s entre deux lancers. Les grenades lancées utilisent le même modèle.
Révision (v19b) : mains du lancer refaites — doigts à trois phalanges qui se referment autour de la grenade, pouce articulé, bras en deux segments (épaule-coude-poignet) toujours reliés au poignet ; la goupille part dans la main gauche.

## Sauvegarde des réglages et tests automatiques (v20)
**Sauvegarde** (localStorage, `parts/persist.js`) : en plus de ce qui l'était déjà (volume, sensibilité, qualité du menu, touches, skins, tenue), sont maintenant mémorisés les accessoires et le viseur actif, la loupe holo, la grenade sélectionnée, la qualité choisie avec [O], l'heure, la météo, la lampe et le dernier mode. Les valeurs corrompues sont ignorées. Bouton « Réinitialiser les réglages » dans Paramètres.

**Tests automatiques** (`parts/selftest.js`, `tests/run_tests.py`) : 20 vérifications (fonctions, carte, bots, 6 armes qui tirent, rechargement, Signal 50, santé, 3 types de grenades et animation de lancer, barils, véhicules et avions, modèles 3D, IA sur 40 mises à jour, sauvegarde, valeurs corrompues, rendu). Deux façons de les lancer :
- dans le navigateur : ouvrir `MILSIM_FPS.html?selftest` (résultats affichés en vert/rouge) ;
- en ligne de commande : `python tests/run_tests.py` (nécessite playwright), qui mesure aussi le temps de chargement, relit la sauvegarde après rechargement de la page et renvoie un code d'erreur en cas d'échec.
Le build (`build.py`) vérifie en plus la syntaxe du script final et échoue si elle est cassée.

## v21 — Reclamer 12 (fusil à pompe)
- Nouveau modèle importé de `reclamer_12.blend` (remplace l'ancien fusil à pompe, arme n°1 de la touche 4) : corps, canon, tube magasin, pompe mobile (objet `Cube`), 4 cartouches latérales (visibles tant qu'il reste de la réserve).
- Caractéristiques : 6 coups, 9 plombs, rechargement **2 cartouches à la fois** (3 cycles pour un chargeur vide, ~2,2 s), les munitions entrent cycle après cycle ; tirer interrompt le rechargement si au moins un coup est chambré.
- Animation : main gauche qui monte à la fenêtre de chargement avec 2 cartouches en main, pompe finale.
- Données : `src/parts/reclamer_data.js` (généré), `src/parts/reclamer.js` (lissage par angle des normales). Test automatique ajouté (21 tests).
- Captures : `docs/captures/v21/`.

## v21b — Couteau de combat (modèle importé)
- `combat_knife.glb` remplace le couteau en boîtes (touche Z) : manche, lame et garde, couleurs lues dans la texture de base (sans embarquer les images), lame redressée (axe PCA) et mise à l'échelle 0,31 m.
- Données : `src/parts/knife_data.js` ; `creaseGeo` (reclamer.js) gère maintenant couleurs par sommet.
- Les mains (`first-person_arm_hand_fingerless_gloves.glb`) ne sont pas encore intégrées : maillage unique sans squelette (voir échange).

## v21c — Mains à squelette (hand_with_gloves.glb)
- Remplacement des mains en boîtes par un modèle à squelette : gant + manche, 21 os par main (avant-bras, main, pouce 3 phalanges, 4 doigts × 4), poids de peau conservés, main gauche = miroir de la droite.
- Données : `src/parts/hand_data.js` (généré, ~440 Ko, textures réduites en JPEG 512/256), `src/parts/hands3.js` (`mkRig`, `hPose(main, fermeture des doigts, pouce)`, `mkHand`).
- Utilisées par : mains d'armes, couteau (poing fermé sur le manche, blade orientée à la main), lancer de grenade (`mkHand2`/`handCurl`).
- Matériau Lambert avec léger émissif (les gants noirs restaient trop sombres sous l'éclairage du jeu).
- Test automatique : 21 os, un doigt change bien d'angle entre ouvert et fermé (22 tests).
- Limites : poses de doigts uniques par arme (pas de pose spécifique rechargement), main droite hors champ à la hanche pour la plupart des armes.

## v22 — Serpent (python, 1,84 m)
- Modèle `snake_titanoboa` réduit à taille réelle (×0,25 : 1,84 m), décimé à ~5,9 k triangles, 91 os, textures 512/256 (`src/parts/snake_data.js`, ~346 Ko). 4 serpents rôdent dans la zone (`SNK.N`), jamais dans l’étang ni dans les bâtiments.
- Animation : les os suivent la piste de la tête (reptation sinusoïdale, amplitude liée à la vitesse), tête dressée en alerte, corps retourné à la mort. Code : `src/parts/snake.js`.
- IA : rôde → alerte (siffle, se dresse) si le joueur ou un bot approche (≈2,9 m, +2 m en sprint, réduit accroupi/couché ; bots à 3,2 m) → frappe (bond à 3,4 m/s, morsure aux jambes : 11 dégâts + saignement joueur, 12 sur un bot) → recul bref → alerte. Blessé : riposte si l’agresseur est proche, sinon fuite (aussi sous 45 % de vie).
- Tué par : balles du joueur (tête ×3, via `FA.hit`/`faHit`), couteau, grenades (`snkBlast`), tirs des bots qui le voient (hors combat) à moins de 11 m. Réapparaît ailleurs 45 s après sa mort.
- Capture : `docs/captures/v22/serpent.png`.
- Test automatique : 91 os, cycle alerte/frappe, blessure du joueur, rayon de tir, tête/grenade/bots (23 tests).

## v22b — Échantillons sonores
- 7 sons fournis (MP3 recadrés, mono 32 kHz, normalisés, ~99 Ko en base64) : `src/parts/samples_data.js`, lecteur `src/parts/samples.js` (`smpPlay`, décodage au premier clic, repli sur la synthèse tant que non prêt).
- Tirs joueur : Fusil → gunshot 511311 ; MP9 / Pistolet (plus aigu) → gun-shot-1 ; Reclamer 12 → gun-shot 359196 + bruit de pompe ; Signal 50 → shot and echo ; HMG → 359196 ralenti. Tirs silencieux : synthèse conservée.
- Tirs des bots : mêmes échantillons, spatialisés (distance, occlusion, réverbération existantes).
- Rechargement : sample de rechargement (sauf Reclamer, cartouches synthétiques) + bruit de culasse si chargeur vide ; clic à vide quand il n'y a plus de munitions.
- Test automatique (24 tests).

## v23 — Optimisations, tenue du couteau
- Couteau : prise « marteau » (lame vers l'avant, légèrement relevée), poing droit en bas à droite, main gauche ouverte en garde ; réglable via `knPose()` (melee.js). Estoc et taillade gardent leurs mouvements.
- Scène : les originaux des maillages fusionnés sont détachés du graphe (gardés dans `solids`/`ray` pour les tirs) et les 16 770 colliders invisibles de troncs ne sont plus dans la scène → 58 400 → 11 600 objets parcourus par image (mise à jour des matrices ÷2,5, rendu CPU ÷1,8).
- Serpents : pose des os en une passe (une seule lecture du relief par os, tangente par os voisins), cadence réduite avec la distance, collision via la grille de navigation au lieu de `boxes` (tick serpents 3,2 ms → 0,3 ms).
- Textures : inventaire fait (73 textures, aucune non chargée ; quelques tailles non puissances de 2, sans effet en WebGL2). Les 5 matériaux noirs sont ceux du modèle Reclamer (couleur de base noire du .blend).
- À faire : vérification visuelle des éléments de la carte (tour par zones interrompu), intégration du soldat Mixamo (`military-man`, 33 os, 13 animations) comme modèle d'ennemi, armure `military_armor` (maillage statique 21 k tris).

## v24 — Soldats Mixamo
- Les bots utilisent désormais le modèle **military-man** (Mixamo) : mesh skinné 13 000 sommets, 33 os, texture camouflage 1024 px, embarqués dans `src/parts/soldier_data.js` (≈1,2 Mo) et 7 animations échantillonnées à 15 i/s dans `soldier_anim.js` (marche, course, tir, rechargement, mort, pas latéral, accroupi).
- `src/parts/soldier.js` : géométrie/matériau partagés, un squelette par bot, fondu enchaîné entre animations (marche/course/tir/rechargement/accroupi/mort), cadence de pose réduite selon la distance (1/2/1/4 images).
- L'arme est placée entre la main droite (poignée) et la main gauche (garde-main). À la mort, l'ancienne chute par rotation est annulée et l'animation squelettique « mort » est jouée.
- Les anciennes boîtes du corps restent comme **hitbox invisibles** (zones tête/torse/bras/jambes inchangées).
- Selftest ajouté (« Soldats Mixamo »).
- À faire : ennemis avec `military_armor_3d_model.glb` (mesh statique sans squelette), calage fin de l'arme par type, animation de rechargement liée à l'IA.

### v24b — Déclinaisons des 4 types d'ennemis
- Chaque type a sa teinte de tenue, son couvre-chef (casque sombre / casque + visière / chapeau de brousse / casque lourd à visière rouge), son gilet, son sac (type 1 et 2) et ses épaulières (type 3), attachés aux os du soldat (`sldBuild`/`sldLook` dans `soldier.js`).
- L'arme de chaque type (pistolet-mitrailleur, fusil, tireur d'élite, mitrailleuse lourde) est calée entre la main droite (poignée) et la main gauche (garde-main) selon sa longueur.

### v24c — Gilet par balle fourni
- Le modèle `military_armor_3d_model.glb` (21 030 triangles) est allégé à ≈8 400 triangles, mis à l'échelle sur le torse du soldat et embarqué (`src/parts/vest_data.js`, texture JPEG 1024). Il est attaché à l'os `Spine2` et partagé par tous les bots, avec une teinte par type. Il remplace les anciennes plaques en boîtes.

### v25 — Voix entre bots ; ajustements v24
- Type 0 : le dôme de casque ajouté est retiré ; la casquette du modèle Mixamo reste.
- Gilet : orientation inversée et échelle élargie (corps, col et poches enveloppent le torse).
- `src/parts/voix.js` : les bots annoncent « Contact ! », « Je recharge ! », « Grenade ! », « Je suis touché ! », « Homme à terre ! », « Je me replie ! », « Je l'ai perdu » ; un soldat voisin répond (« Reçu. »). Synthèse vocale du navigateur en français (hauteur de voix selon le bot), volume selon la distance (portée 45 m), délais anti-spam par bot et global, sous-titre à l'écran. Désactivable via `VX.on=false`.

### v26 — Écran de chargement
- Écran affiché dès l'ouverture du fichier (`src/parts/loading.html`) : titre, fausse barre de progression en CSS (avance de 0 à ≈93 % en 16 s sans dépendre du thread principal, puis se complète à 100 % au chargement), astuces tournantes, fondu de sortie à la première image rendue une fois le décor fusionné.
- Le script du jeu est désormais exécuté après le premier affichage (`type="text/plain"` puis injection après `requestAnimationFrame`), pour garantir que l'écran de chargement apparaît avant le gros calcul.

### v26b — Correctif des armes (rechargement, accroupi, marche)
- Avant : l'arme était orientée d'après la position des deux mains, ce qui donnait des armes tombant au sol quand les mains ne tiennent pas l'arme (animations de rechargement et d'accroupi).
- Maintenant : la pose à deux mains n'est utilisée qu'en position de tir ; elle sert à mémoriser, par type d'arme, la position de l'arme relative à la main droite, puis ce décalage est réutilisé dans toutes les autres animations.

### v27 — Plus d'ennemis, mise en veille à distance
- 36 ennemis au lieu de 18 (4 escouades de 9), apparition aléatoire sur toute la carte (inchangée).
- **Mise en veille** : au-delà de 220 m du joueur (hors portée d'audition max. 90 m et de vue), un bot n'est ni mis à jour (IA, animation) ni affiché ; il se réveille quand le joueur approche (`AI.dorm`). Les morts continuent leur animation puis réapparaissent normalement.

### v27b — Sac à dos fourni (`military_backpack.glb`)
- Modèle d'origine : 180 000 triangles, 6 matériaux PBR. Allégé à 6 000 triangles, couleurs moyennes de chaque matériau en couleurs de sommets (sans texture), mis à l'échelle (×0,65), retourné pour que les sangles soient côté dos du soldat, et attaché à l'os `Spine2` des types 1 et 2, à la place des boîtes (`src/parts/pack_data.js`).

### v27c — Position du sac, passages d'avions visibles
- Sac à dos plaqué contre le dos (rapproché de ~9 cm, abaissé de 5 cm).
- Avions : la distance de rendu de la caméra (100 à 220 m selon la qualité) était inférieure à l'altitude des passages (110–220 m) : les avions étaient coupés. Ils sont maintenant rendus à distance réduite avec échelle compensée (même taille apparente), position réelle conservée pour le son. Passages toutes les 90–200 s au lieu de 150–300 s.

### v28 — Casques fournis
- `night_vision_goggles_navy_seals.glb` (casque sombre + jumelles de vision nocturne) → type 0 ; `military_helmet.glb` (casque olive) → type 1 ; `sci_fi_military_helmet.glb` (casque intégral avec masque) → type 3. Type 2 garde le chapeau de brousse (aucun chapeau fourni). Allégés à 2 500 triangles, couleurs moyennes par matériau, attachés à l'os `Head` (`src/parts/helm_data.js`).
- La casquette du modèle Mixamo est masquée pour les types 0, 1 et 3 (index de triangles sans le chapeau) ; les anciens casques en formes simples sont supprimés.
- Non utilisés : `military_helmet(2).glb`, `military_rollmat_and_bandanas.glb`, `yote_military_backpack_repro.glb` (94 Mo), dossier `Animaux`.

## v28b — Casques recalés
- Casques (types 0, 1, 3) recalculés depuis les modèles d'origine : sommet à 1,83 m, centrés sur le crâne, inclinés de ~10° (l'avant remonte) pour suivre la tête de la pose de tir. Vérifié en rendu sous 4 azimuts en pose animée.
- Casque type 1 : orientation avant/arrière inversée (rotation de 180° autour de l'axe vertical, triangles réorientés).
- Taille des casques réduite (type 0 ×0,92, type 1 ×0,88, type 3 ×0,78), sommet à 1,82 m, pour des proportions cohérentes avec la tête.

## v29 — Balistique réaliste + cadavres persistants
**Balistique** (`src/parts/ballistics.js`) : plus aucun tir instantané, toutes les balles (joueur et bots) sont de vrais projectiles.
- Physique : gravité 9,81 m/s², traînée aérodynamique `a = ½·ρ·Cd(Mach)·A/m·v²` avec un Cd qui varie avec le Mach (pic transsonique), intégration à 240 Hz, un seul rayon par image sur la corde du segment.
- Munitions : 5.56 (900 m/s), 7.62 (840), .50 HMG (890), 9 mm (400 MP9, 350 pistolet), chevrotine 12/70 (9 plombs, 400 m/s, sphériques). Masse, calibre et forme propres à chacune.
- Vent : force de la météo (2 m/s par temps clair, jusqu'à ~9 m/s en orage) + rafales, direction `WND.d` ; la dérive est naturelle (la traînée agit sur la vitesse relative à l'air).
- Réglage à zéro par arme (HMG/précision 200 m, fusil 100 m, MP9 50 m, pompe 35 m, pistolet 25 m) : la visée coïncide avec l'impact à cette distance, la balle tombe au-delà.
- Dégâts : proportionnels à l'énergie restante `(v²/v0²)^0,65–0,9` (plancher 8 %) ; une balle lente fait moins mal.
- Pénétration : vitres (−10 % de vitesse), portes (selon le pouvoir de pénétration), balles traversantes pour le 7.62 et le .50 (touchent un 2e bot, −45 % d'énergie).
- Bots : erreur de visée gaussienne conservée, plus compensation de la chute (table d'angles par 25 m) et anticipation du déplacement du joueur (60 %, 100 % pour le tireur d'élite). Ils ne compensent pas le vent. Les tirs de suppression sont de vraies balles qui peuvent toucher le joueur ; le claquement de la balle qui passe est déclenché à son passage.
- Traceurs : 1 balle sur 3 pour le joueur, 1 sur 4 pour les bots (pas pour la chevrotine).
- Son : un tir à plus de 60 m arrive avec le retard dû à la vitesse du son (d/343).
- Tests : `Balistique : chute, traînée, vent et réglage à zéro cohérents` et `Balistique : le projectile avance à vitesse finie, touche le sol et disparaît`.

**Cadavres** : les bots morts restent 60 s au sol (`BOT_CORPSE`), leur pose est figée après 4 s (plus de calcul de squelette), puis ils réapparaissent loin du joueur.

## v29b — Branches cassantes et trébuchement
- **Branches** : 2600 branches mortes sur la carte (260 avant), dont 25 % de grosses branches plus bruyantes et un peu plus fragiles, avec une densité renforcée à moins de 240 m du centre. Seules celles à moins de 75 m sont affichées (coût de rendu constant). Elles craquent sous le joueur comme sous les bots, et le bruit alerte les bots (rayon 22 m, 34 m en sprint ou grosse branche).
- **Trébuchement** (`src/parts/trip.js`) : en reculant (S sans W), chance de base 0,6 % par mètre, ×2 en sprint, ×1,3 en visée, ×0,4 accroupi, ×1,6 de nuit, ×1,4 sous la pluie, jusqu'à ×2,5 en pente, ×2 jambe blessée, ×1,6 essoufflé. Un cadavre ou un objet bas (0,15–0,7 m) juste derrière fait trébucher presque à coup sûr. Pas de chute couché, en l'air ou en escalade ; 6 s de délai entre deux chutes.
- Effets : vue basculée vers le haut puis rétablie, déplacement bloqué 0,4 s puis ralenti, tir retardé, bruit audible par les bots (26 m), choc sourd, petite blessure à une jambe, message à l'écran.
- Tests : `Branches cassantes : nombreuses, bruit au passage`, `Trébuchement en reculant : chute, ralentissement, vue rétablie`.

## v30 — Poids/endurance (#36) et ordres d'escouade (#38)
**Effort** (`src/parts/effort.js`) : complète l'inventaire et l'endurance qui existaient déjà (charge → vitesse, sprint, tremblement à bout de souffle).
- Fatigue à la marche en charge : au-delà de 60 % de la capacité, la marche vide l'endurance (jusqu'à 1,4 %/s à pleine charge, moitié moins accroupi) ; les côtes (> 12 % de pente) coûtent en plus, ×1,5 en sprint.
- Saut : hauteur réduite jusqu'à −22 % selon la charge, coût d'endurance ; chute plus dure (vitesse d'impact ×(1+0,25·charge)).
- Visée : passage en visée plus lent (jusqu'à −30 % chargé, −15 % essoufflé), visée plus instable et dispersion +25 % en charge.
- Souffle : [Maj] maintenu en visée retient le souffle (tremblement −85 %, dispersion −30 %) pendant 1,4 à 3,5 s selon l'endurance, puis expiration forcée de 1,8 s (tremblement ×1,8).
- Essoufflement sous 25 % d'endurance : respiration audible, entendue des bots à 9 m. Trébuchement en reculant plus probable en charge.
- Correction : [Maj] en visée ne consomme plus d'endurance comme un sprint.
- HUD : barre d'endurance sous l'indicateur de poids quand elle n'est pas pleine, avec « souffle retenu » / « à bout de souffle ».

**Ordres d'escouade** (`src/parts/orders.js`) : un chef (soldat d'assaut, sinon recrue ou tireur) évalue la situation toutes les 8–13 s en contact et donne un ordre vocal, sous-titré à moins de 45 m.
- Grenade : si personne ne voit le joueur, un lanceur disponible (9–30 m de la dernière position connue) lance la grenade sur l'ordre du chef.
- Contournement : deux bots partent par le flanc (`aiFlank`) pendant que le soutien fixe le joueur par un tir de couverture de 7 s.
- Couverture : un bot désigné tire 6 s sur la dernière position connue.
- Repli : annoncé vocalement par le chef quand l'escouade bat en retraite.
- Regroupement : hors contact, les membres à plus de 28 m du chef sont rappelés.
- Chaque bot désigné répond (« Reçu », « Compris »…) avec un léger décalage. Les phrases d'ordre sont dans `VX.L` (`oFlank`, `oCover`, `oGren`, `oRet`, `oReg`).
- Tests : `Effort : souffle retenu stabilise la visée puis essouffle, saut et visée limités par la charge`, `Ordres d'escouade : le chef parle, les bots désignés exécutent, repli annoncé`.

### v30b — Endurance recalée sur un soldat entraîné
Constantes regroupées dans `STA` (`src/parts/effort.js`) : sprint ≈ 22 s à charge légère (≈ 13 s à pleine charge) au lieu de 10 s, récupération complète en ≈ 6 s en marchant (≈ 4 s à l’arrêt), marche fatigante seulement au-delà de 70 % de charge, saut deux fois moins coûteux, souffle retenu jusqu'à 6 s, fin d'essoufflement à 25 %. Test : `Endurance de soldat entraîné`.

## v31 — Performance (LOD des soldats) et balistique, suite

**Performance.** Mesure (playwright, swiftshader : chiffres relatifs) : ~822 k triangles de soldats pour 36 bots, 800–1 035 appels de dessin. Les soldats ont maintenant 3 niveaux de détail (`lod_data.js`, `sldLodTick` dans `soldier.js`) : corps 22 k → 7,3 k triangles, gilet 8,4 k → 2,3 k, sac 6 k → 0,7 k au-delà de 50 m (hystérésis 42 m) ; gilet et sac masqués au-delà de 145 m. Appliqué aussi aux cadavres.

**Ricochets et pénétration (`balWall`).** Chaque mur est classé (bois, brique, béton, acier, plâtre) d'après son matériau (nom, métallicité, couleur). Un impact rasant (sinus de l'incidence < seuil du matériau) ricoche (étincelles, sifflement, vitesse réduite, 2 ricochets max). Sinon la profondeur de pénétration `pen × k_matériau × (v/v0)²` est comparée à l'épaisseur réellement traversée (rayon retour) : la balle ressort ralentie et légèrement déviée, ou s'arrête. Vaut aussi pour les balles des bots.

**Réticule de lunette (`balRet`).** Canvas dessiné en visée lunette : points mil (1 mrad, calibrés sur le FOV), repères de chute avec la distance correspondante (tous les 50 m) pour l'arme en main, flèche et force du vent, vent de travers et dérive à 300 m en mil (trait de correction).

**Chevrotine.** Les dégâts décroissent aussi avec la distance parcourue (plein jusqu'à 8 m, ~10 % à 50 m) en plus de l'énergie perdue.

Test : « Balistique : pénétration selon le matériau, ricochet rasant, chevrotine » et « Soldats : niveaux de détail » (36/36).

## v32 — Armes réalistes (`weapon.js`)
- **Enrayage** : probabilité par coup = base 1/9 000 × usure (jusqu'à ×41) × chaleur du canon (>60 %) × pluie × silencieux. Message « ENRAYAGE », **R** dégage (1,6 s, la cartouche est éjectée).
- **Usure** par arme (+0,04 %/coup, plus vite sous la pluie) ; **maintenir H** (1,2 s, immobile) nettoie (3 s à l'établi, 10 s sur le terrain).
- **Chambre** : rechargement tactique (chargeur non vide) = chargeur + 1 ; chargeur vide = chargeur seul. Pompe et fusil de précision : sans chambre supplémentaire.
- **Modes de tir (clic molette)** : fusil auto/semi/rafale ×3, MP9 auto/semi, autres armes en semi, HMG en auto.
- **Chauffe du canon** : monte à chaque coup, refroidit plus vite sous la pluie ; au-delà de 50 % la dispersion augmente, fumée au-delà de 70 %, **surchauffe bloquante de la HMG** à 100 % jusqu'à retomber sous 60 %.
- **Recul et dispersion selon la position** : accroupi ×0,8, couché ×0,6 ; appui sur un rebord ×0,72 ; HMG couchée ×0,5 de plus. Indicateur « appui » et barre de chauffe dans le HUD (près de la charge).
Test : « Armes : enrayage, chambre +1, modes de tir, chauffe, recul » (37/37).

## v33 — Véhicules destructibles et pénétration (`destruct.js`)
Voitures et véhicules ont 700 PV (balles ×6 pour compenser la taille du volume, explosions selon la distance). Fumée grise sous 60 %, fumée noire et flammes sous 30 %, épave en feu à 0 PV qui explose après 3–7 s (60 %), noircit, reste comme obstacle et fume 1 à 2 min. La tôle se perfore (matériau `veh`, 2 cm équivalent acier : fusil et HMG traversent, 9 mm non) ; les troncs d'arbre sont du bois (pénétration par épaisseur réelle). Murs de bâtiments et caisses intérieures : toujours indestructibles (géométrie fusionnée). Test : « Véhicules destructibles » (38/38).

## v34 — Vision nocturne/thermique, sol mouillé, empreintes, douilles (`night.js`)
- **² / § (touche Backquote)** : vision nocturne (filtre vert amplifié, tube, grain) → thermique (noir et blanc, soldats vivants blancs, cadavres qui refroidissent sur 60 s) → arrêt.
- **Sol mouillé** : la pluie mouille le sol en ~70 s (plus sombre, moins rugueux), il sèche en ~4 min.
- **Empreintes** : jusqu'à 140 sur herbe et boue (joueur et bots à moins de 45 m), durée 70 s au sec et jusqu'à 240 s sur sol mouillé ; plus marquées quand le sol est mouillé. Pas qui clapotent sur sol mouillé.
- **Douilles persistantes** : 60 s au sol, 90 maximum.
- Mode de tir = clic molette, nettoyage = maintenir H (C et L étaient déjà pris) ; indicateur d'arme intégré au bloc munitions.
Test : « Vision nocturne/thermique, sol mouillé, empreintes, douilles persistantes » (39/39).

## v35 — Survie et ramassage chronométré (`survie.js`)
- **Soif, faim, froid** (jauges visibles sous 70 %). Soif et faim baissent plus vite avec l'effort et la chaleur ; le froid dépend de l'heure (5 à 19 °C), de la pluie, de l'abri (bâtiment) et des feux proches. Effets : endurance qui s'épuise, tremblement de la visée, plafond d'endurance en cas de manque critique. Non létal.
- **Boire** : F au bord de l'eau (4,5 s) ou touche **=** (gourde, 2,5 s) ; **manger** : touche **-** (ration, 3,5 s). Départ : 2 gourdes, 2 rations ; les éliminations en rapportent. **\\** active/désactive la survie (mémorisé), pour les missions courtes.
- **Ramassage chronométré** : durée selon la masse de l'objet (0,3 à 2,2 s, sac 2,5 s), interrompu si on bouge ou si on est touché.
Test : « Survie : soif, faim, froid, boire/manger, ramassage chronométré » (40/40).

## v36 — Véhicules conduisibles (`drive.js`)
**F** près d'un véhicule garé (voitures de la ville, tracteurs et véhicules du décor) pour monter ; **W/S** accélérer / freiner / marche arrière, **A/D** diriger (braquage réduit avec la vitesse), **Espace** frein à main, **H** vue conducteur (par défaut caméra de poursuite, souris pour tourner autour), **F** descendre (à moins de 15 km/h). Vitesse max 100 km/h (voitures) ou 61 km/h (grands véhicules), tangage selon le relief. Collisions contre les obstacles (le véhicule et, au-delà de 43 km/h, le conducteur encaissent des dégâts, fumée puis incendie via `destruct.js` ; un véhicule en feu éjecte le conducteur), soldats écrasés au-delà de 9 km/h, moteur sonore, compteur. Le véhicule reste solide et destructible (volume de tir déplacé avec lui). Armes masquées et tir bloqué en conduisant.
Limites : pas de phares ni de passagers, les bots ne conduisent pas, caméra sans collision fine avec les bâtiments (rayon simple).
Test : « Conduite : accélération, direction, collision, freinage, descente » (41/41).
