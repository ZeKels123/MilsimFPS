"""Tests automatiques de MILSIM_FPS.html (navigateur sans écran).
Usage :  python tests/run_tests.py [chemin/vers/MILSIM_FPS.html]
Prérequis : pip install playwright && playwright install chromium
Code de sortie 0 = tout passe, 1 = au moins un échec. Mesure aussi le temps de chargement."""
import sys, time, pathlib
from playwright.sync_api import sync_playwright

page_path = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent / "MILSIM_FPS.html").resolve()
MAX_LOAD_S = 240          # budget de chargement du jeu
errors = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 1000, "height": 600})
    pg.on("pageerror", lambda e: errors.append(str(e)[:300]))
    t0 = time.time()
    pg.goto(page_path.as_uri(), timeout=400000, wait_until="commit")
    pg.wait_for_function("()=>typeof bots!=='undefined'&&bots.length>0&&typeof MERGED!=='undefined'&&MERGED.out>0&&typeof mmShow==='function'&&window.VEHS&&typeof SELFTEST==='function'", timeout=400000, polling=2000)
    load_s = time.time() - t0
    res = pg.evaluate("()=>SELFTEST()")
    # persistance réelle : on écrit, on recharge la page, on relit
    pg.evaluate("()=>{A.grip=true;NADE.sel=2;PERS.write()}")
    stored = pg.evaluate("()=>localStorage.getItem('mfps_ext')")
    pg.reload(timeout=400000, wait_until="commit")
    pg.wait_for_function("()=>typeof bots!=='undefined'&&bots.length>0&&typeof MERGED!=='undefined'&&MERGED.out>0&&typeof mmShow==='function'&&window.VEHS&&typeof PERS==='object'", timeout=400000, polling=2000)
    after = pg.evaluate("()=>[A.grip,NADE.sel]")
    b.close()

fail = 0
print(f"Chargement : {load_s:.0f} s (budget {MAX_LOAD_S} s)")
for r in res["results"]:
    print(("  OK   " if r["ok"] else "  ÉCHEC") + " " + r["n"] + (" — " + r["m"] if r.get("m") else ""))
    fail += 0 if r["ok"] else 1
if not stored or '"grip":true' not in stored:
    print("  ÉCHEC Sauvegarde dans localStorage"); fail += 1
if after != [True, 2]:
    print("  ÉCHEC Rechargement de la page : réglages non restaurés", after); fail += 1
else:
    print("  OK    Réglages restaurés après rechargement de la page")
if errors:
    print("  ÉCHEC Erreurs de page :", *errors[:5], sep="\n    "); fail += 1
if load_s > MAX_LOAD_S:
    print("  ÉCHEC Chargement trop long"); fail += 1
print(f"\n{res['pass']}/{res['total']} tests du jeu réussis · IA {res.get('aiMs') or 0:.1f} ms/mise à jour")
sys.exit(1 if fail else 0)
