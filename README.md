# MILSIM FPS

FPS en un seul fichier HTML (three.js r128). Ouvrir `MILSIM_FPS.html` dans un navigateur sur ordinateur (clavier + souris, connexion nécessaire pour charger three.js).

- `MILSIM_FPS.html` / `index.html` : dernière version du jeu (v6).
- `versions/` : versions précédentes.
- `docs/AMELIORATIONS.md` : changements par version, pistes d'amélioration, checklist.
- `docs/captures/` : captures en jeu et vue de dessus de la carte.
- `src/` : sources. `orig.html` est le jeu d'origine, `parts/*.js` les modules ajoutés, `build.py` les assemble :

```
python3 src/build.py
```

## Touches principales
WASD/ZQSD se déplacer · Maj sprint · clic gauche/droit tirer/viser · Ctrl posture (accroupi, couché) · P couché · Espace saut / enjamber une vitre cassée · R recharger · C grenade (molette ou U : type) · F porte/établi · G plaque · T changer d'arme · N heure · M météo · L lampe · O qualité graphique.

Le post-traitement intègre des fichiers des exemples de three.js r128 (licence MIT, © three.js authors) : `src/parts/three_post.js`.
