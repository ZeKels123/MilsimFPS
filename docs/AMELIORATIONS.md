# MILSIM FPS — Changements et feuille de route

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
1. Équilibrage après essai réel : précision, portée et nombre de bots, fréquence des grenades.
2. Sons spatialisés (stéréo selon la direction, échos dans les maisons, pas selon le sol, pluie sur les toits).
3. Escaliers, étages, toits accessibles ; fenêtres brisées utilisables comme passage (joueur et bots).
4. Modes de jeu : points de contrôle, vagues, objectifs ; écran de fin de partie.
5. IA en escouade : rôles coordonnés, tir de suppression, bots qui se soignent ou se replient ensemble.
6. Bots : visages, doigts, animations de mort variées, arme qui tombe au sol.
7. Animaux touchables, pont sur le ruisseau, rivière qui traverse la carte.
8. Ombres en cascade, LOD des arbres, herbe générée autour du joueur seulement.

## À faire à chaque nouvelle version (checklist)
1. Garder une copie de la version précédente (nom versionné : MILSIM_FPS_v5.html).
2. Appliquer les changements sur la copie, jamais sur l'original.
3. Ouvrir la console du navigateur : zéro erreur rouge.
4. Test visuel : vue d'ensemble de la carte, extérieur et intérieur d'un bâtiment, nuit, pluie, étang, un ennemi de près, un tir, une grenade de chaque type, l'AC-130.
5. Test de jeu : déplacement sur relief et dans l'eau, collisions, portes (F), vitres, tir, rechargement de chaque arme, établi, grenades, bots qui patrouillent, attaquent, se couvrent et réapparaissent.
6. Mesurer les FPS sur un PC modeste dans chaque qualité (touche O) ; si < 40 en Moyen, réduire ombres / herbe / résolution.
7. Prendre 5 captures de référence et les comparer à la version précédente.
8. À chaque modification de la carte (bâtiments, relief, chemins, végétation, eau) : générer et envoyer une vue de dessus annotée de la carte (`vue_dessus.png`).
9. Pousser la version sur GitHub (`ZeKels123/MilsimFPS`) : jeu, sources, captures, ce fichier.
10. Mettre à jour cette liste (changements + pistes restantes).
