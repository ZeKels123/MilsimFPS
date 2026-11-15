# Bancs d'audit (non inclus dans la suite rapide)
Le rendu 3D logiciel de l'environnement de test est trop lent une fois la partie démarrée : ces scripts coupent le rendu (`R.render`, `ppRender`) pour faire tourner la logique à vitesse normale. Chemin du jeu codé en dur : `/home/claude/work/out/test.html` (build de test, three.js local).
- `fonctions.py` : exerce chaque fonction du joueur par ses vraies touches (déplacement, postures, accessoires, inventaire, soins, plaque, couteau, AC-130, HMG, pièges, véhicules, grenades, armes, mort).
- `combat.py [secondes]` : combat automatique (visée sur le bot le plus proche, tirs, grenades, changements d'arme, téléportations) avec relevé NaN / fuites / erreurs.
- `soak.py` : touches aléatoires pendant plusieurs minutes (le menu pause bascule souvent : peu représentatif).
