#!/usr/bin/env python3
"""Analyse hors jeu des photos PBR ambientCG (CC0) -> tables de calage des textures procédurales de src/parts/tex.js.
Usage : python3 tools/tex_photo_stats.py [dossier_textures_batiments]   (un sous-dossier par matériau, carte *Color.jpg)
Sortie : PHQ/PHL (quantiles couleur RGB, 19 nœuds) et SPA (amplitudes spectrales du grain, ajustement moindres carrés non négatifs
sur 9 bandes de bruit de valeur 2..512 cellules), à coller dans tex.js. Aucune image n'est embarquée dans le jeu."""
import glob, os, sys, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
from scipy.optimize import nnls
SRC = sys.argv[1] if len(sys.argv) > 1 else r'C:\Users\Fixe\Downloads\assets jeux\textures_batiments'
Q = [0, .01, .03, .06, .1, .15, .2, .3, .4, .5, .6, .7, .8, .85, .9, .94, .97, .99, 1]
KEY = {'plas': 'crepi_Plaster003', 'plas2': 'enduit_lisse_Plaster001', 'brick': 'brique_Bricks097', 'conc': 'beton_brut_CorrugatedSteel005',
       'slab': 'beton_lisse_Concrete034', 'tile': 'carrelage_Tiles141', 'floor': 'parquet_WoodFloor064', 'wood': 'bois_planches_Planks037A',
       'door': 'porte_bois_Planks023A', 'roof': 'tuiles_RoofingTiles014A', 'stone': 'pierre_Bricks108A'}
SIG = [.7, 1.5, 3, 6, 12, 24, 48]
CELLS = [2, 4, 8, 16, 32, 64, 128, 256, 512]
def load(k):
    f = glob.glob(os.path.join(SRC, KEY[k], '*Color.jpg'))[0]
    return np.asarray(Image.open(f).convert('RGB').resize((512, 512), Image.LANCZOS)).astype(float)
def vn(sz, c, seed):
    g = np.random.RandomState(seed).rand(c, c); t = np.arange(sz) / sz * c; i = t.astype(int); f = t - i; s = f * f * (3 - 2 * f)
    a = g[i % c][:, i % c]; b = g[i % c][:, (i + 1) % c]; cc = g[(i + 1) % c][:, i % c]; d = g[(i + 1) % c][:, (i + 1) % c]
    SX = s[None, :]; SY = s[:, None]; return a + (b - a) * SX + (cc - a) * SY + (a - b - cc + d) * SX * SY
def bands(L):
    g = [L] + [gaussian_filter(L, s, mode='wrap') for s in SIG]
    return np.array([np.var(g[i] - g[i + 1]) for i in range(len(SIG))] + [np.var(g[-1])])
M = np.array([bands(vn(512, c, 7 + c) - .5) for c in CELLS]).T
lut, spa = {}, {}
for k in KEY:
    a = load(k).reshape(-1, 3); Y = a @ [.299, .587, .114]; a = a[np.argsort(Y)]; n = len(a); v = []
    for q in Q:
        c = int(q * (n - 1)); w = max(1, int(.01 * n)) if 0 < q < 1 else int(.004 * n) + 1
        v += list(np.round(a[max(0, c - w):c + w + 1].mean(0)).astype(int))
    lut[k] = v
    A2, _ = nnls(M, bands(load(k).mean(2))); spa[k] = [round(float(x), 1) for x in np.sqrt(A2)]
print('const PHQ=%s,PHL={%s};' % (Q, ','.join('%s:[%s]' % (k, ','.join(map(str, v))) for k, v in lut.items())))
print('const SPA={%s};' % ','.join('%s:%s' % (k, spa[k]) for k in spa))
