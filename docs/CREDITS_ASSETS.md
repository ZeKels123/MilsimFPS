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

## v64 : végétation basse et décor extérieur (branche ext)
Convertis par `tools/deco_ext_export.py` + `tools/deco_ext_pack.py` (mise à l'échelle en mètres, pied à y=0, sols/caméras/lumières retirés, décimation LOD0/LOD1, textures de couleur WebP 512 à 1024 px, collisions locales) puis placés par `src/parts/deco_ext.js`. Sketchfab : CC Attribution (CC-BY 4.0) ; Poly Haven : CC0.

| Modèle | Auteur | Licence | Source | Usage dans le jeu |
|---|---|---|---|---|
| Real Bush | Marbles studio (marblesstudio) | CC Attribution | https://sketchfab.com/3d-models/real-bush-62618c3260b142cfb7ef499d75a8d21a | Buisson dense (5 variantes : petit, moyens, hauts) |
| Lowpoly Flower Bushes | Varvara (krauchankavarvara) | CC Attribution | https://sketchfab.com/3d-models/lowpoly-flower-bushes-4b47abf072604a71aaf1bda30847a1af | Buisson fleuri |
| Realistic Beech Fern Plant \| Games \| Film | 3D Environment Artist Shop (3d-artist-shop) | CC Attribution (d'après le nom du fichier téléchargé) | https://sketchfab.com/3d-models/realistic-beech-fern-plant-games-film-adf1e8832cf74a8a94c98792fa1d9088 | Fougère (fougere_a) |
| Fern | evolveduk | CC Attribution | https://sketchfab.com/3d-models/fern-38531afd86434987b1a0bf5968fe001f | Fougère (fougere_b) |
| Ferns Grass | Star3D (Star3DArt) | CC Attribution | https://sketchfab.com/3d-models/ferns-grass-45669699e1454dc0ae3d0eb40da0800f | Fougères basses (fougere_c) |
| Square Hedge | RBG_illustrations | CC Attribution | https://sketchfab.com/3d-models/square-hedge-bd335c9bb20a4cdc8d41960ea3e9b106 | Haie (segments de 1,7 m) |
| Tall grass | ironicalghosty | CC Attribution | https://sketchfab.com/3d-models/tall-grass-8a78295b56c64c16be6e2e4d7215dbfb | Hautes herbes (berges) |
| Free lowpoly firtree | masakeyArt (masakeyart) | CC Attribution | https://sketchfab.com/3d-models/free-lowpoly-firtree-9b7a5f5917c645a0ba9cc7c6584caf4f | Jeune sapin (2 à 4 m) |
| Reeds | SunsetScorpion (sunsetscorpion) | CC Attribution | https://sketchfab.com/3d-models/reeds-6106c101bbad46c39e79c745c741305e | Roseaux (roseau_a) |
| Reeds low poly | daniel.2U | CC Attribution | https://sketchfab.com/3d-models/reeds-low-poly-a8923e7b4fd44c2c9ba7f006fb952626 | Roseaux (roseau_b) |
| Cliff Low-Poly Game-ready | kEam (keam.wf) | CC Attribution | https://sketchfab.com/3d-models/cliff-low-poly-game-ready-918dc8e1b1f0443993a251c1302510bf | Falaise |
| Old Mossy Fence [Rework] | MrUnity (MrUnityCreations) | CC Attribution | https://sketchfab.com/3d-models/old-mossy-fence-rework-55311bac329b47e1af0602169d13c577 | Clôture de ferme (sections de 2,6 m) |
| Boulder | Luka Petkovic (lukica) | CC Attribution | https://sketchfab.com/3d-models/boulder-640b7dde18404a36807acacf96d59200 | Rocher 1 |
| Medium sized Rock for Game Engines | ChrisRE | CC Attribution | https://sketchfab.com/3d-models/medium-sized-rock-for-game-engines-54cef4772d2a442680d5f18dcb2f93e7 | Rocher 2 |
| A Common Rock #1 Low Poly Mesh | M.Reslan (mreslan) | CC Attribution | https://sketchfab.com/3d-models/a-common-rock-1-low-poly-mesh-7e27efebb49c46c2b8702977299fef07 | Rocher 3 |
| Hay Bale | ThomasWhalley | CC Attribution | https://sketchfab.com/3d-models/hay-bale-16f3d0337ad54e92b186d8a6e8494699 | Botte de foin |
| Firewood Pile (game ready asset) | Aparicio Silva 3D (apariciosilva3D) | CC Attribution | https://sketchfab.com/3d-models/firewood-pile-game-ready-asset-393e8b83dfdc455fa4f03dbd4f116e0c | Tas de bois |
| Outdoor Table Chair Set 01 | James Ray Cock (Poly Haven) | CC0 | https://polyhaven.com/a/outdoor_table_chair_set_01 | Table de jardin avec chaises |
| Painted Wooden Bench | Kirill Sannikov (Poly Haven) | CC0 | https://polyhaven.com/a/painted_wooden_bench | Banc |
| Utility Box 01 | James Ray Cock (Poly Haven) | CC0 | https://polyhaven.com/a/utility_box_01 | Boîtier électrique (ville) |
| Wooden Picnic Table | Ulan Cabanilla (Poly Haven) | CC0 | https://polyhaven.com/a/wooden_picnic_table | Table de pique-nique |
| Stone Fire Pit | Sebastian Platen (Poly Haven) | CC0 | https://polyhaven.com/a/stone_fire_pit | Foyer en pierre |
| Water Manhole Cover | Raunox (Poly Haven) | CC0 | https://polyhaven.com/a/water_manhole_cover | Plaque d'égout (ville) |
| Wooden Bucket 01 | James Ray Cock (Poly Haven) | CC0 | https://polyhaven.com/a/wooden_bucket_01 | Seau en bois |
| Security Light | Maximilian Schuster (Poly Haven) | CC0 | https://polyhaven.com/a/security_light | Projecteur sur poteau |

Notes :
- Les modèles Poly Haven (CC0) ne demandent pas de mention ; ils sont listés par courtoisie (Painted Wooden Bench, Outdoor Table Chair Set 01, Utility Box 01, Wooden Picnic Table, Stone Fire Pit, Water Manhole Cover, Wooden Bucket 01, Security Light).
- Real Bush (Marbles studio) : texture 4096 px réduite à 1024 px ; ses cinq maillages (touffes d'herbes et d'arbustes bas) sont utilisés comme cinq variantes.
- Déjà dans le jeu, non répétés ici : barbed wire, concrete jersey barrier, military sandbag barrier, tent, watchtower (sections précédentes).

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

## Mobilier intérieur (v64) : maisons, bunkers, commerces, appartements, bureaux

| Modèle | Auteur | Licence | URL | Clé(s) |
|---|---|---|---|---|
| Wooden Bookcases with Books | Matthew Collings (mtcollings) | CC Attribution | https://sketchfab.com/3d-models/wooden-bookcases-with-books-d0618ac16b2a4a87b9b6c7d5e6765626 | bookcase |
| Antique Wardrobe | matejbiskup97 | CC Attribution | https://sketchfab.com/3d-models/antique-wardrobe-9e194868da754d55afc876127dc8f74b | wardrobe |
| Antique Dresser | Darren McNerney 3D (DarrenMcnerney3D) | CC Attribution | https://sketchfab.com/3d-models/antique-dresser-0a46621504c24197b5653608f474f73b | dresser |
| Double Bed | Francesco Coldesina (topfrank2013) | CC Attribution | https://sketchfab.com/3d-models/double-bed-c505ffffc1524865ba63af837346f1f7 | bed_double |
| Single Bed 2 | rhcreations | CC Attribution | https://sketchfab.com/3d-models/single-bed-2-81ada0e24e1647d8a0d6d0708a696f84 | bed_single |
| Bunk Bed | neverfollow81 | CC Attribution | https://sketchfab.com/3d-models/bunk-bed-3ddab7a93381496eba3c36677e777912 | bunk |
| Leather armchair/ Coffee table/ Floorlamp | YJ_ | CC Attribution | https://sketchfab.com/3d-models/leather-armchair-coffee-table-floorlamp-fcce92a09de84456a071ea6117b57cbc | armchair, coffee, lamp_floor |
| Table and Chairs | Vilson Pistori (vilsonpistori) | CC Attribution | https://sketchfab.com/3d-models/table-and-chairs-2aee19db562b4b26a199a81e62760109 | table, chair |
| Old Television | Nathan Sioui (NathanSioui) | CC Attribution | https://sketchfab.com/3d-models/old-television-86c2567eddd0460cb3127be05cc66450 | tv |
| Fireplace Low-poly | MaX3Dd | CC Attribution | https://sketchfab.com/3d-models/fireplace-low-poly-d1473f5f384a411f979b99214de9f2a9 | fireplace |
| Old wall clock | AndreiVNK | CC Attribution | https://sketchfab.com/3d-models/old-wall-clock-8e920e8b129842718099a3f772cec024 | clock |
| Fancy Picture Frame | Jamie McFarlane (jamiemcfarlane) | CC Attribution | https://sketchfab.com/3d-models/fancy-picture-frame-b54984abe2394345a81621719bf8bf1a | frame |
| Oil Lamp lowpoly | Vyacheslav_SD | CC Attribution | https://sketchfab.com/3d-models/oil-lamp-lowpoly-87aa46eb6d3242f699cb1b9fb3cfa4eb | oillamp |
| Kitchen Counter | FordVFX | CC Attribution | https://sketchfab.com/3d-models/kitchen-counter-e46deaab889548948a31e4264de61e5a | counter |
| Sideboard Kitchen | hate94neu | CC Attribution | https://sketchfab.com/3d-models/sideboard-kitchen-d4f7793695ec45cdb2a6b9327d9eb285 | sideboard |
| An old refrigerator and a wooden crate | Eugen S. (eugen.storozhuk) | CC Attribution | https://sketchfab.com/3d-models/an-old-refrigerator-and-a-wooden-crate-9664f9f194ae4256a64ab168f74f8b9b | fridge, crate |
| Bathtub with Shower | HippoStance (hippostance) | CC Attribution | https://sketchfab.com/3d-models/bathtub-with-shower-22e187363dd14bc3a3e1b4611830236a | bath |
| Bathroom Sink - Low-Poly - Game-Ready | kEam (keam.wf) | CC Attribution | https://sketchfab.com/3d-models/bathroom-sink-low-poly-game-ready-45a6ab5e5a1a40b8913ab14314734ce8 | basin |
| Dirty Toilet | Shedmon | CC Attribution | https://sketchfab.com/3d-models/dirty-toilet-389d5427a1f344c4aa4883ec5a6aaf05 | wc |
| Fire Extinguisher | Loïc (loichuet1) | CC Attribution | https://sketchfab.com/3d-models/fire-extinguisher-5676b179b3b744c0aaae53a3dcea2300 | extinguisher |
| Trash Can | Lyskilde (longtail) | CC Attribution | https://sketchfab.com/3d-models/trash-can-f61aeec14ff441abb0f6add5485a2e90 | bin, bin_g |
| Old Style Military Radio | Dungar Singh Balecha (DungarSinghBalecha) | CC Attribution | https://sketchfab.com/3d-models/old-style-military-radio-d33869e8bec44de4b60d528712e6fc04 | radio |
| Ladder | tasha.kosaykina | CC Attribution | https://sketchfab.com/3d-models/ladder-bb73bcf509f44588928d3d1019378e67 | ladder |
| Wooden Bookshelf Worn | Ulan Cabanilla (Poly Haven) | CC0 | https://polyhaven.com/a/wooden_bookshelf_worn | bookcase2 |
| Office Desk 140x60 | AleixoAlonso | CC Attribution | https://sketchfab.com/3d-models/office-desk-140x60-9262f311271c4c4390341e526d3fe103 | desk |
| Metal Office Desk | Ulan Cabanilla (Poly Haven) | CC0 | https://polyhaven.com/a/metal_office_desk | desk_m |
| Office Chair Modern | thethieme | CC Attribution | https://sketchfab.com/3d-models/office-chair-modern-675f34f7304e4d92812a41e9750539aa | ochair |
| Old Table Lamp V01 | MAR.COS. (mar.cos.) | CC Attribution | https://sketchfab.com/3d-models/old-table-lamp-v01-cecd36db0c90422cbd81c2a0c3ace4f0 | desklamp |
| Laptop | Aullwen | CC Attribution | https://sketchfab.com/3d-models/laptop-7d870e900889481395b4a575b9fa8c3e | laptop |
| Standing Chalkboard 01 | ParzivalCG (Poly Haven) | CC0 | https://polyhaven.com/a/standing_chalkboard_01 | chalkboard |
| Vintage Day Bed | Aron Łyczek (Poly Haven) | CC0 | https://polyhaven.com/a/vintage_day_bed | daybed |
| Old Bedside Table | justincrazyeyes | CC Attribution | https://sketchfab.com/3d-models/old-bedside-table-62bcb265cfbb4be78107d04cc22b2628 | nightstand |
| Cash Register 01 | Joe Seabuhr (Poly Haven) | CC0 | https://polyhaven.com/a/CashRegister_01 | register |
| Wooden Display Shelves 01 | James Ray Cock (Poly Haven) | CC0 | https://polyhaven.com/a/wooden_display_shelves_01 | shopshelf |
| Round Wooden Table 02 | Ulan Cabanilla (Poly Haven) | CC0 | https://polyhaven.com/a/round_wooden_table_02 | roundtable |
| Metal Stool 02 | Ulan Cabanilla (Poly Haven) | CC0 | https://polyhaven.com/a/metal_stool_02 | stool |
| Old Gas Stove and Oven | Glowbox 3D (glowbox3d) | CC Attribution | https://sketchfab.com/3d-models/old-gas-stove-and-oven-d98dd28d47424d7aaedfd33685af0427 | stove |
| Cargo Crate | boysichterman | CC Attribution | https://sketchfab.com/3d-models/cargo-crate-19a32159a3d6443e95105f4f7cb51c39 | mcrate |
| Rusty Industrial Wardrobe | Nikoleta.Zhecheva | CC Attribution | https://sketchfab.com/3d-models/rusty-industrial-wardrobe-4543aa4f542c46c3945c22568423cade | locker |
| Workbench | JJ Chalupnik (jjchalupnik) | CC Attribution | https://sketchfab.com/3d-models/workbench-9634d6a81a494925a909512c8048f446 | workbench |
| Metal Shelving Unit | jimbogies | CC Attribution | https://sketchfab.com/3d-models/metal-shelving-unit-4a669b8a8a1d4ea0b9ec41b97ad34353 | mshelf |
| Steel Frame Shelves 01 | James Ray Cock (Poly Haven) | CC0 | https://polyhaven.com/a/steel_frame_shelves_01 | whshelf |
| Medical Box | Ulan Cabanilla (Poly Haven) | CC0 | https://polyhaven.com/a/medical_box | medkit |
| Worn Metal Rack | Luca B (Poly Haven) | CC0 | https://polyhaven.com/a/worn_metal_rack | rack |
| Sofa 02 | Kirill Sannikov (Poly Haven) | CC0 | https://polyhaven.com/a/sofa_02 | sofa2 |
| Low Poly Old Sofa with Bake Normal | Andante (AndanteOle) | CC Attribution | https://sketchfab.com/3d-models/low-poly-old-sofa-with-bake-normal-0dbc5483a7884e17bfc086886c676006 | sofa |
| Old Radiator | thethieme | CC Attribution | https://sketchfab.com/3d-models/old-radiator-8a1a2e0263aa401591c1e87d824a79ef | radiator |
| Wall Mirror | rickmaolly | CC Attribution | https://sketchfab.com/3d-models/wall-mirror-6177cc5abd5746a4b5ff6986b8b81edc | mirror |
| Dining Table | Aron Łyczek (Poly Haven) | CC0 | https://polyhaven.com/a/dining_table | dtable |

Notes : seuls le maillage et la texture convertis (WebP, 512–1024 px) sont dans le jeu ; fichiers d'origine non redistribués. Les modèles non utilisés par les agencements ne sont pas listés.
