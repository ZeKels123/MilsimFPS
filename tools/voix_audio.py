#!/usr/bin/env python3
"""Convertit les enregistrements vocaux en MP3 mono léger et génère src/parts/voix_data.js + voix_manifest.json.
Nom de fichier -> phrase : on normalise (minuscules, sans accents ni ponctuation, espaces -> _), suffixe _N = variante.
  contact!_1.mp3 -> « Contact ! » variante 1 ;  ennemi_en_vue.mp3 -> « Ennemi en vue ! »
Usage : python3 tools/voix_audio.py <dossier des mp3> ; puis python3 tools/voix_liste.py"""
import sys, re, json, base64, subprocess, tempfile, unicodedata, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / 'tools'))
import voix_liste  # noqa  (réutilise entries())
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'_+', '_', re.sub(r'[^a-z0-9]+', '_', s)).strip('_')
src = (R/'src/parts/voix.js').read_text() + (R/'src/parts/tactic.js').read_text()
phrases = {}
for k, ph in voix_liste.entries(src).items():
    for p in ph: phrases[norm(p)] = p
man_p = R/'src/parts/voix_manifest.json'
man = json.loads(man_p.read_text()) if man_p.exists() else {}
folder = pathlib.Path(sys.argv[1]); data = {}
for f in sorted(folder.glob('*.mp3')):
    stem = norm(f.stem); m = re.match(r'^(.*?)(?:_(\d+))?$', stem); base = m.group(1)
    ph = phrases.get(stem) or phrases.get(base)
    if not ph: print('? phrase inconnue pour', f.name); continue
    with tempfile.NamedTemporaryFile(suffix='.mp3') as t:
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(f), '-ac', '1', '-ar', '32000', '-af', 'loudnorm=I=-18:TP=-2:LRA=7', '-b:a', '56k', t.name], check=True)
        b = pathlib.Path(t.name).read_bytes()
    data.setdefault(ph, []).append(('data:audio/mpeg;base64,' + base64.b64encode(b).decode(), f.name))
    print('+', f.name, '->', ph, len(b), 'octets')
# on garde les enregistrements déjà intégrés dont le dossier source ne contient plus le fichier ? non : on repart du dossier
old = {}
js = 'const VXD={' + ','.join(json.dumps(p, ensure_ascii=False) + ':[' + ','.join(json.dumps(d[0]) for d in v) + ']' for p, v in data.items()) + '};\n'
(R/'src/parts/voix_data.js').write_text(js)
man_p.write_text(json.dumps({p: [d[1] for d in v] for p, v in data.items()}, ensure_ascii=False, indent=1))
print(len(data), 'phrases enregistrées,', sum(len(v) for v in data.values()), 'fichiers')
