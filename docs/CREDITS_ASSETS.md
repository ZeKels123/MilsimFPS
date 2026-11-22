# Crédits des assets 3D (Sketchfab)
Modèles intégrés au jeu, convertis par `tools/props_export.py` (textures réduites, géométrie embarquée).

| Modèle | Auteur | Licence | Source |
|---|---|---|---|
| Military Sandbag Barrier (Free low poly) | Shorty_Digitan | Sketchfab Free Standard | https://sketchfab.com/3d-models/military-sandbag-barrier-free-low-poly-3f4d0ec9510244bab16bbd0916a3495b |
| Old Ammo Crate | Geoffroy.Sainte.Catherine | CC Attribution | https://sketchfab.com/3d-models/old-ammo-crate-320d935472354cc79590bc35ade9d855 |
| Concrete Jersey Barrier with Fence | JeffK | CC Attribution | https://sketchfab.com/3d-models/concrete-jersey-barrier-with-fence-85c3967de8c24357acc4371339e73c2e |
| Tent | VENIKAMEN | CC Attribution | https://sketchfab.com/3d-models/tent-979c0784868b4fdeb2b4563f65e0b5b4 |
| Oil barrel | farsmok | CC Attribution | https://sketchfab.com/3d-models/ec37cc2a844f4f0ca0873d85a8b3b976 |
| Military watchtower #1 | zachari-blinn | CC Attribution | https://sketchfab.com/3d-models/33bbf3553e464270867f70bede244982 |
| Barbed Wire Fence | JohnDoe2311 | CC Attribution | https://sketchfab.com/3d-models/f1c1c8e8052a41b7aa10e4a60fa0bcb9 |
| Uaz-469 | grox777 | CC Attribution | https://sketchfab.com/3d-models/70c8691c6fb64b859fbfc16babfa2c5f |

Notes :
- Military Sandbag Barrier : licence Sketchfab « Free Standard » — usage en jeu autorisé, redistribution du fichier brut interdite (seul le maillage converti est dans le jeu).
- Téléchargé, non utilisé : Military Outpost Kit 1.0 (britdawgmasterfunk).
- Les licences CC-BY exigent la mention de l'auteur : ce fichier en tient lieu.

## v59 : décors Sketchfab (remplacent les décors procéduraux)
Tous en licence CC Attribution (CC-BY 4.0), téléchargés au format glTF (textures 1024 px) puis convertis par `tools/props_export.py` (mise à l'échelle en mètres, alignement, décimation, textures réduites). Mention d'auteur : ce tableau.

| Modèle | Auteur | Licence | Source | Clé dans le jeu |
|---|---|---|---|---|
| Low Poly T-72 Tank - Game Ready | Mr. The Rich | CC Attribution | https://sketchfab.com/3d-models/low-poly-t-72-tank-game-ready-8c9d0d6640a244e39082cd9fdf565cef | tankwreck (épave de char) |
| Bell Huey helicopter | Duane's Mind | CC Attribution | https://sketchfab.com/3d-models/bell-huey-helicopter-755d8518a06e41b19752c1b54c0da588 | heli (hélicoptère posé) |
| Abandoned Wreck Car | BytesCrafter | CC Attribution | https://sketchfab.com/3d-models/abandoned-wreck-car-950863a41d4d401fa12c50862d8d6472 | carwreck (épave de voiture) |
| Military Tent | Reinaw13 | CC Attribution | https://sketchfab.com/3d-models/military-tent-d95296298b2a4caca8a5c3ce4450bb15 | cmdtent (tente de commandement) |
| Shipping Container | RMaull2002 | CC Attribution | https://sketchfab.com/3d-models/shipping-container-7671b3e8ec374e2db75823f35384c275 | container |
| Rusted Tank storage | Mkc | CC Attribution | https://sketchfab.com/3d-models/rusted-tank-storage-57be2eaf4d6b4d2980bcee4ccb35f780 | fueltank (citerne) |
| Power Generator thing | tboiston | CC Attribution | https://sketchfab.com/3d-models/power-generator-thing-0fd0fdbd068d45ff9fd076ba5bf36a9f | generator |
| Radio tower | Gunnar Correa | CC Attribution | https://sketchfab.com/3d-models/radio-tower-4b3c733d8bfd4ee2b91dcbcd02670686 | mast (pylône radio) |
| Low-Poly Searchlight | Jerd | CC Attribution | https://sketchfab.com/3d-models/low-poly-searchlight-3872bcf198944fb48b756c861e1bbeda | floodlight (projecteur) |
| Military Crate | LuddePudde | CC Attribution | https://sketchfab.com/3d-models/military-crate-19c943e409644a8281cc96f63e6743c6 | supply (caisses de ravitaillement) |
| Low Poly | Pallets | Anna Denisova | CC Attribution | https://sketchfab.com/3d-models/low-poly-pallets-18fbfb830f294b44aa8dff530cc2ea12 | pallets |
| Wooden Table | MrSweetly | CC Attribution | https://sketchfab.com/3d-models/wooden-table-4f65265ceefb4c46b4e3cc408e23948a | messtable (table de cantine, ronde) |
| Low Poly Red Flag - Wooden Pole Banner | marishka1611 | CC Attribution | https://sketchfab.com/3d-models/low-poly-red-flag-wooden-pole-banner-8d52d2408ef84046bc0a0f6102ec41be | flag (drapeau) |
| Plastic Jerrycan | Alexander Komendant (SashaRX) | CC Attribution | https://sketchfab.com/3d-models/plastic-jerrycan-071ee7fa1d4548aba415b0558a5379ed | jerry (jerrycan, nouveau) |
| Cot | MSEECS 298 | CC Attribution | https://sketchfab.com/3d-models/cot-defee5e453b44331aef9a4a5bb9cabcb | cot (table/lit de camp pliant, nouveau) |

Notes :
- Le code procédural `tools/proc_props.py` est conservé comme secours mais n'est plus utilisé par l'export pour ces 13 clés.
- Téléchargé, non utilisé : « destroyed tank » (kythulu, CC-BY) — en fait une cuve rouillée et non un char ; Panzer III (leoxx300, CC-BY) ; « Flag With Pole » (HPrendering, CC-BY) — drapeau couché.

## Photos de référence des textures procédurales de bâtiments (v62, branche tex4)

Ces photos PBR ne sont PAS embarquées dans le jeu : elles ont servi hors jeu à mesurer palette, histogramme, spectre du grain et pente de relief (`tools/tex_photo_stats.py`). Le jeu ne contient que de petites tables de quantiles de couleur (`PHL`, 19 nœuds RGB par matériau) et des amplitudes spectrales (`SPA`), puis synthétise ses textures en code (`src/parts/tex.js`). Cartes utilisées : Color, NormalGL (1K-JPG).

| Texture ambientCG | Auteur | Licence | URL | Générateur calé |
|---|---|---|---|---|
| Plaster003 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Plaster003 | `T_plas` (crépi grossier) |
| Plaster001 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Plaster001 | `T_plas2`, `T_ceil` (enduit lisse, plafond) |
| Bricks097 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Bricks097 | `T_brick` (brique) |
| Bricks108A | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Bricks108A | `T_stone` (moellons) |
| Concrete034 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Concrete034 | `T_slab` (dalles, trottoirs) + pente de `T_conc` |
| CorrugatedSteel005 (carte Color : béton brut banché gris) | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=CorrugatedSteel005 | `T_conc` (couleur et spectre) |
| Tiles141 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Tiles141 | `T_tile` (carrelage) |
| WoodFloor064 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=WoodFloor064 | `T_floor` (parquet) |
| Planks037A | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Planks037A | `T_wood` (planches, poutres, mobilier) |
| Planks023A | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Planks023A | `T_door` (portes) |
| RoofingTiles014A | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=RoofingTiles014A | `T_roof` (tuiles) |

### Photos de référence du terrain (tex4)

Mêmes principes (CC0, non embarquées, tables de quantiles `PHL.grass/dirt/asph/grav/path` dans `src/parts/tex.js`). Copies de travail : `/home/claude/work/dl/textures_terrain/`, PC : `C:\Users\Fixe\Downloads\assets jeux\textures_terrain\`.

| Texture ambientCG | Auteur | Licence | URL | Usage |
|---|---|---|---|---|
| Grass004 + Grass001 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Grass004 , https://ambientcg.com/view?id=Grass001 | tuile d'herbe du sol (`T_gg`) |
| Pathway002 + Ground048 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Pathway002 , https://ambientcg.com/view?id=Ground048 | tuile de terre (`T_gd`) |
| Asphalt031 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Asphalt031 | chaussées (ville, route nord-sud) |
| Gravel041 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Gravel041 | cailloux de la terre, accotements |
| Ground054, Ground080, Rock030, ScatteredLeaves009, Ground037, Grass007 | ambientCG (Lennart Demes) | CC0 1.0 | https://ambientcg.com/view?id=Ground054 (idem autres ids) | téléchargées et analysées ; non appliquées (boue du relief déjà à la couleur de Ground054) |
## v63 : arbres, souche et buissons Sketchfab (remplacent les arbres et buissons procéduraux)
Tous en licence CC Attribution (CC-BY 4.0), téléchargés au format glTF puis convertis par `tools/arbres_export.py` (mise à l'échelle en mètres, origine au pied du tronc, LOD1 décimé, textures réduites en WebP), `tools/arbres_bb.py` (impostors 8 vues rendus hors jeu) et `tools/arbres_pack.py` (données embarquées `src/parts/arbres_data.js`). Mention d'auteur : ce tableau.

| Modèle | Auteur | Licence | Source | Clé dans le jeu |
|---|---|---|---|---|
| Oak tree (chêne) | evolveduk | CC Attribution | https://sketchfab.com/3d-models/oak-tree-6468dd4d3eb240ef902b9057d9913606 | chene |
| Oak tree (chêne) | massive-graphisme | CC Attribution | https://sketchfab.com/3d-models/oak-tree-3dc59560f2d24345bdbe65c44636453b | chene2 |
| Beech tree (hêtre) | evolveduk | CC Attribution | https://sketchfab.com/3d-models/beech-tree-0983d8933531491f9be71c669e8a907b | hetre |
| Spruce (épicéa) | evolveduk | CC Attribution | https://sketchfab.com/3d-models/spruce-a50a5df3164246a5af97992cec33a143 | epicea |
| Pine Tree (pin) | evolveduk | CC Attribution | https://sketchfab.com/3d-models/pine-tree-d45218a3fab349e5b1de040f29e7b6f9 | pin |
| Fir tree (sapin) | evolveduk | CC Attribution | https://sketchfab.com/3d-models/fir-tree-3f39aa5485e94477a36b435f7a1a8b54 | sapin |
| Old tree (arbre mort) | evolveduk | CC Attribution | https://sketchfab.com/3d-models/old-tree-3cb4d59eb4844dc4802480e9ee53785e | mort |
| Low Poly: Dead Tree | ClintonAbbott.Art | CC Attribution | https://sketchfab.com/3d-models/low-poly-dead-tree-addc2aef9e534a93a8798320fea440ef | mort2 |
| Low Poly Tree Log And Stump (souche) | BitGem | CC Attribution | https://sketchfab.com/3d-models/low-poly-tree-log-and-stump-ae1ef76afe00492daa6f8d618e9680f0 | souche |
| Stylized Bush (buisson) | Daniel (danielpetrov) | CC Attribution | https://sketchfab.com/3d-models/stylized-bush-9d9ce79d3ae040619e96d5b22c7de1a6 | buisson |
| Plant Bush (buisson) | Batuhan13 | CC Attribution | https://sketchfab.com/3d-models/plant-bush-42cb7fad10ba44ecbc9ae9cf5fdd63b6 | buisson2 |

Notes :
- Fichiers d'origine : `arbres/<clé>_<auteur>_CCBY.glb` du dossier de téléchargement (non redistribués ; seuls le maillage et la texture convertis sont dans le jeu).
- De la souche, seule la partie « souche » est gardée (le tronc couché, l'icosphère et les doublons du fichier sont retirés).
