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
- Non fait : glisser-déposer manuel dans la grille, perte du sac à la mort du joueur.
