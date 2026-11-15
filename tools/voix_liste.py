#!/usr/bin/env python3
"""Régénère docs/VOIX.md à partir des phrases du jeu (src/parts/voix.js et tactic.js).
L'état vient de src/parts/voix_manifest.json (produit par tools/voix_audio.py) : phrase enregistrée = « enregistrée » + fichiers, sinon « synthèse ». Les nouvelles phrases arrivent en « synthèse »,
les phrases supprimées du code passent dans « Retirées ». Usage : python3 tools/voix_liste.py"""
import re, pathlib, datetime
R = pathlib.Path(__file__).resolve().parent.parent
OUT = R / 'docs' / 'VOIX.md'
TRIG = {
 'contact': 'Un bot voit le joueur (appel horaire en plus, voir plus bas)',
 'hit': 'Un bot est touché',
 'reload': 'Un bot recharge',
 'grenade': 'Un bot lance une grenade',
 'down': 'Un bot meurt : un camarade proche l\'annonce',
 'flank': 'Un bot passe en manœuvre de flanc',
 'cover': 'Un bot se replie vers un abri',
 'lost': 'Un bot perd le joueur de vue (appel horaire en plus)',
 'ack': 'Réponse d\'un camarade à un appel',
 'ammo': 'Un bot n\'a presque plus de munitions',
 'med': 'Un bot blessé appelle un infirmier',
 'smoke': 'Un bot pose un fumigène',
 'bound': 'Le chef d\'escouade lance un bond (un groupe avance, l\'autre couvre)',
 'pan': 'Un bot panique et s\'enfuit / un bot sans arme fuit',
 'sur': 'Un bot se rend',
 'oFlank': 'Le chef ordonne le contournement à deux hommes',
 'oCover': 'Le chef ordonne un tir de couverture',
 'oGren': 'Le chef ordonne une grenade',
 'oRet': 'Le chef ordonne le repli',
 'oReg': 'Le chef regroupe l\'escouade',
 'oSucc': 'Le chef est tombé : un camarade prend le commandement',
 'oMove': 'Le chef lance un déplacement de l\'escouade (mission)',
 'oAmb': 'Le chef met l\'escouade en embuscade sur l\'axe du joueur',
 'oRev': 'Le chef retourne fouiller une zone où le joueur a déjà été vu',
 'oPince': 'Le chef déclenche l\'assaut en tenaille (les deux flancs en position)',
 'oHalt': 'Le chef ordonne une halte (sécurité à 360°)',
 'evac': 'Un camarade évacue un blessé',
}
def entries(src):
    out = {}
    for m in re.finditer(r"(?<![\w.])(\w+):\[((?:'(?:[^'\\]|\\.)*'(?:,\s*)?)+)\]", src):
        k = m.group(1)
        ph = [p.replace("\\'", "'") for p in re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(2))]
        ph = [p for p in ph if p]
        if ph and k in TRIG: out[k] = ph
    return out
src = (R/'src/parts/voix.js').read_text() + (R/'src/parts/tactic.js').read_text() + (R/'src/parts/orders.js').read_text()
cur = entries(src)
prev = {}
if OUT.exists():
    for ln in OUT.read_text().splitlines():
        c = [x.strip() for x in ln.strip().strip('|').split('|')]
        if len(c) == 5 and c[0] not in ('Clé', '---') and not c[0].startswith('-'):
            prev[(c[0], c[2])] = (c[3], c[4])
import json
man = {}
mp = R/'src/parts/voix_manifest.json'
if mp.exists(): man = json.loads(mp.read_text())
rows = []; seen = set()
for k, ph in cur.items():
    for p in ph:
        st, fi = ('enregistrée', ', '.join(man[p])) if p in man else ('synthèse', '')
        rows.append((k, TRIG[k], p, st, fi)); seen.add((k, p))
gone = [(k, p, v) for (k, p), v in prev.items() if (k, p) not in seen]
today = datetime.date.today().isoformat()
L = ['# Voix des bots — liste des dialogues', '',
     f'Mis à jour le {today} · {len(rows)} phrases · {sum(1 for r in rows if r[3] != "synthèse")} enregistrées',
     '',
     'État : `synthèse` (voix du navigateur) · `enregistrée` (fichier audio intégré). Régénérer : `python3 tools/voix_liste.py`.', '',
     '| Clé | Déclencheur | Phrase | État | Fichier |', '|---|---|---|---|---|']
for k, t, p, st, fi in rows: L.append(f'| {k} | {t} | {p} | {st} | {fi} |')
L += ['', '## Annonces horaires (assemblées)', '',
      '« Contact *H* heures, *D* mètres ! » et « Perdu de vue, dernier contact *H* heures, *D* mètres. » : H de 1 à 12, D arrondi à 10 m (10, 20, 30…).',
      'Pour des voix enregistrées il faut : « Contact », « Perdu de vue, dernier contact », les nombres 1 à 12, « heures », les distances 10 à 100 m, « mètres ».', '',
      '## Sons non dialogués souhaités (pas encore dans le jeu)', '',
      '- Cris de douleur (touché au bras / à la jambe / au torse)', '- Râle et toux d\'un blessé', '- Respiration d\'un bot épuisé ou qui boite', '- Appel « Médic ! » plus désespéré (blessé grave)', '']
if gone:
    L += ['## Retirées du code', '', '| Clé | Phrase | État | Fichier |', '|---|---|---|---|']
    for k, p, (st, fi) in gone: L.append(f'| {k} | {p} | {st} | {fi} |')
    L.append('')
import sys
if '--check' in sys.argv:
    if gone or any((r[0], r[2]) not in prev for r in rows) or any(prev.get((r[0], r[2])) != (r[3], r[4]) for r in rows):
        print('docs/VOIX.md n\'est pas à jour : lancer python3 tools/voix_liste.py'); sys.exit(1)
    sys.exit(0)
OUT.write_text('\n'.join(L))
print(len(rows), 'phrases ·', len(gone), 'retirées')
