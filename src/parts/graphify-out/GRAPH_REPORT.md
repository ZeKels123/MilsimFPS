# Graph Report - parts  (2026-11-23)

## Corpus Check
- 78 files · ~41,762 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1450 nodes · 2342 edges · 78 communities (69 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab608913`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tex.js
- ballistics.js
- health.js
- inventory.js
- soldier.js
- ai.js
- bld_head.js
- deco_ext.js
- snake.js
- fx.js
- menu.js
- deco_int.js
- realisme.js
- audio3d.js
- EffectComposer
- arbres.js
- traps.js
- squad.js
- weapon.js
- night.js
- weather.js
- nadeview.js
- props3d.js
- tactic.js
- nades.js
- barrels.js
- bots.js
- hitbox.js
- drive.js
- finitions.js
- nature2.js
- visee.js
- post.js
- relief.js
- gfx_head.js
- phares.js
- melee.js
- anims.js
- effort.js
- weapons.js
- destruct.js
- menu0.js
- blesses.js
- etabli.js
- monde.js
- stream.js
- survie.js
- orders.js
- city.js
- levels.js
- percep.js
- voix.js
- farm.js
- emit
- hands3.js
- vehicles.js
- blessures.js
- fxFrame
- props_rest.js
- wtex.js
- bld_house.js
- mort.js
- nature.js
- reclamer.js
- trip.js
- armes2.js
- bots_vie.js
- perf.js
- samples.js
- merge.js
- bld_calls.js
- hmg.js
- persist.js
- signal.js
- soldier_anim.js

## God Nodes (most connected - your core abstractions)
1. `invRender()` - 15 edges
2. `trapUpdate()` - 15 edges
3. `wpS()` - 14 edges
4. `fbm()` - 13 edges
5. `P4()` - 13 edges
6. `spec()` - 13 edges
7. `lutc()` - 13 edges
8. `auInit()` - 12 edges
9. `dxH()` - 12 edges
10. `dxAdd()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `SELFTEST()` --indirect_call--> `balTick()`  [INFERRED]
  src/parts/selftest.js → src/parts/ballistics.js
- `SELFTEST()` --indirect_call--> `hlMsg()`  [INFERRED]
  src/parts/selftest.js → src/parts/health.js

## Import Cycles
- None detected.

## Communities (78 total, 9 thin omitted)

### Community 0 - "tex.js"
Cohesion: 0.09
Nodes (56): AN, brickTex(), bright(), c01(), cracks(), fbm(), fbmS(), fg (+48 more)

### Community 1 - "ballistics.js"
Cohesion: 0.07
Nodes (51): BAL, balAm(), balAngle(), balBot(), balBotAm(), balCd(), balComp(), balDoor() (+43 more)

### Community 2 - "health.js"
Cohesion: 0.07
Nodes (48): bhHit(), bhInit(), bhOut(), bhUpdate(), BHW, _ha, HADS(), HAIM() (+40 more)

### Community 3 - "inventory.js"
Cohesion: 0.09
Nodes (53): BAGS, CALK, CALS, CIDX, CKG, CST, IC, IGB (+45 more)

### Community 4 - "soldier.js"
Cohesion: 0.06
Nodes (49): _pa, _pp, _pq, _rp, _rq, _rx, _ry, _rz (+41 more)

### Community 5 - "ai.js"
Cohesion: 0.08
Nodes (48): aG, AI, aiAlert(), aiFlank(), aiHit(), aiHold(), aiInit(), aiMove() (+40 more)

### Community 6 - "bld_head.js"
Cohesion: 0.05
Nodes (38): beamM, BROKEN, BSTY, castShot(), ceilM, clothM, concM2, crackM (+30 more)

### Community 7 - "deco_ext.js"
Cohesion: 0.12
Nodes (38): dxAdd(), DXADJ(), dxBox(), dxBuild(), dxCamps(), dxCell(), dxCellK(), dxCity() (+30 more)

### Community 8 - "snake.js"
Cohesion: 0.09
Nodes (38): _sa, _sb, _sc, _sm, SNK, snkArc(), snkBite(), snkBlast() (+30 more)

### Community 9 - "fx.js"
Cohesion: 0.05
Nodes (35): aqPR, dcG, dcM, dcP, dgm, dpA, dph, dustM (+27 more)

### Community 10 - "menu.js"
Cohesion: 0.09
Nodes (34): CAM, kLab(), MM, mmEq(), mmGfx(), mmHide(), mmKey(), mmLoad() (+26 more)

### Community 11 - "deco_int.js"
Cohesion: 0.09
Nodes (29): DCM, DCO_REAL, dcoAddItem(), dcoAlloc(), dcoB64(), dcoBuild(), dcoCity(), dcoCK() (+21 more)

### Community 12 - "realisme.js"
Cohesion: 0.09
Nodes (31): ENF, enfFreeze(), enfHud(), enfSpawn(), FOU, fouBuild(), fouDone(), fouLoose() (+23 more)

### Community 13 - "audio3d.js"
Cohesion: 0.15
Nodes (32): AD, AU, auInit(), auIR(), auOcc(), auSend(), auStepNoise(), auUpdate() (+24 more)

### Community 14 - "EffectComposer"
Cohesion: 0.07
Nodes (6): EffectComposer, FullScreenQuad, Pass, RenderPass, ShaderPass, UnrealBloomPass

### Community 15 - "arbres.js"
Cohesion: 0.11
Nodes (30): ARB_BR, arbAdd(), arbB(), arbBBMat(), arbBuild(), arbCell(), arbCover(), arbDepth() (+22 more)

### Community 16 - "traps.js"
Cohesion: 0.13
Nodes (29): bce, BRN, brnCrack(), brnInit(), brnSnd(), ENM, enmTick(), natCues() (+21 more)

### Community 17 - "squad.js"
Cohesion: 0.11
Nodes (27): bhHeal(), _fv3, _fv4, PMEM, pmHabitHigh(), pmHot(), pmNote(), pmTick() (+19 more)

### Community 18 - "weapon.js"
Cohesion: 0.15
Nodes (28): fire(), reload(), _wd, _wo, wpBst(), wpCleanStart(), wpClear(), wpFin() (+20 more)

### Community 19 - "night.js"
Cohesion: 0.13
Nodes (27): FP, fpAdd(), fpInit(), _fpn, _fpq, fpTick(), nightTick(), _npm (+19 more)

### Community 20 - "weather.js"
Cohesion: 0.08
Nodes (26): _c, fl, _g, inL, inL2, inRoom(), kfSky(), moonV (+18 more)

### Community 21 - "nadeview.js"
Cohesion: 0.09
Nodes (24): _h1, _h2, _h3, _h4, handCurl(), _hz, mkNade(), NVCOL (+16 more)

### Community 22 - "props3d.js"
Cohesion: 0.18
Nodes (20): P3D, p3dB(), p3dCamp(), p3dCamp2(), p3dField(), p3dLow(), p3dMake(), p3dNav() (+12 more)

### Community 23 - "tactic.js"
Cohesion: 0.18
Nodes (20): TAC, tacBound(), tacCall(), tacCalls(), tacClock(), tacDist(), tacEvac(), tacEvacMove() (+12 more)

### Community 24 - "nades.js"
Cohesion: 0.12
Nodes (14): FXP, NADE, nadeBoom(), nadeLOS(), nadeStep(), nadeUpdate(), _nd, nfL (+6 more)

### Community 25 - "barrels.js"
Cohesion: 0.17
Nodes (19): barrelBlast(), barrelHit(), brAt(), brBase(), brBurnOut(), brChar(), brE, brExplode() (+11 more)

### Community 26 - "bots.js"
Cohesion: 0.13
Nodes (16): armIK(), botAnim(), botDead(), botDeath(), botFace(), BWG, BWM, _de (+8 more)

### Community 27 - "hitbox.js"
Cohesion: 0.13
Nodes (19): dcolPts(), dcolPush(), dcolSolve(), DCS, _dcV, _dcW, _hA, _hB (+11 more)

### Community 28 - "drive.js"
Cohesion: 0.18
Nodes (18): _drc, _drd, _drf, _dro, drvCam(), drvCamDist(), drvCol(), drvEnter() (+10 more)

### Community 29 - "finitions.js"
Cohesion: 0.15
Nodes (15): AMTY, AUD, audCrack(), audCrackSeg(), audUrbTick(), finTick(), GRD, grdBot() (+7 more)

### Community 30 - "nature2.js"
Cohesion: 0.13
Nodes (14): FA, faMove(), faSpot(), faThreat(), faTick(), _fe, _fm, _fq (+6 more)

### Community 31 - "visee.js"
Cohesion: 0.15
Nodes (13): CRR, vsAds(), vsAmp(), VSB, vsIronFov(), vsMove(), VSN, vsOk() (+5 more)

### Community 32 - "post.js"
Cohesion: 0.17
Nodes (10): FXAA_, GfxPass, GQ, gqFrame(), NVFX_, PP, ppFree(), ppInit() (+2 more)

### Community 33 - "relief.js"
Cohesion: 0.13
Nodes (11): BRG, BROOK, GH(), GHg, GN, NZ, POND, RIVER (+3 more)

### Community 34 - "gfx_head.js"
Cohesion: 0.14
Nodes (12): C, envGeo(), hemi, LDIR, mkEnv(), R, S, sky (+4 more)

### Community 35 - "phares.js"
Cohesion: 0.23
Nodes (14): HL, hlAssets(), hlFwd(), hlGlare(), hlInit(), hlLit(), hlNight(), hlPool() (+6 more)

### Community 36 - "melee.js"
Cohesion: 0.15
Nodes (10): KN, knBlack, knDark, knEdge, KNF, knHandL, knHandR, knSteel (+2 more)

### Community 37 - "anims.js"
Cohesion: 0.17
Nodes (9): _ad, _aI, _ak, ANM, anmChains(), _ap, _aq, _at (+1 more)

### Community 38 - "effort.js"
Cohesion: 0.27
Nodes (11): EFF, effADS(), effBreath(), effJump(), effJumpCost(), effK(), effLoad(), effTick() (+3 more)

### Community 39 - "weapons.js"
Cohesion: 0.17
Nodes (10): brs, mtl, pls(), pMag, rdM, rfCH, shl, sMag (+2 more)

### Community 40 - "destruct.js"
Cohesion: 0.32
Nodes (11): _dl, dstBlast(), dstBurn(), dstChar(), dstEmit(), dstHit(), dstLos(), dstS() (+3 more)

### Community 41 - "menu0.js"
Cohesion: 0.17
Nodes (8): GM, KBD, KBLK, KMAP, KRES, MQP, SET, SKM

### Community 42 - "blesses.js"
Cohesion: 0.27
Nodes (8): BLS, blsCorpseNear(), blsDrag(), blsFwd(), blsHint(), blsPose(), blsPullTick(), blsTick()

### Community 43 - "etabli.js"
Cohesion: 0.35
Nodes (10): wmCan(), wmCycle(), WMD, wmGet(), wmK(), wmMagK(), WMN, WMOD (+2 more)

### Community 44 - "monde.js"
Cohesion: 0.31
Nodes (10): fireCan(), fireIgnite(), fireKey(), fireTick(), grassOk(), _mf, MON, monTick() (+2 more)

### Community 45 - "stream.js"
Cohesion: 0.36
Nodes (10): cityBad(), lzBuild(), lzBuiltAt(), lzCollect(), lzDist(), lzFinish(), lzMergeStep(), LZR (+2 more)

### Community 46 - "survie.js"
Cohesion: 0.33
Nodes (9): survAmb(), survColdRate(), survDone(), survFire(), survHud(), survMsg(), survStart(), survTick() (+1 more)

### Community 47 - "orders.js"
Cohesion: 0.38
Nodes (9): ORD, ordInit(), sqAck(), sqCoverFire(), sqIssue(), sqLeader(), sqLeaderPick(), sqOrders() (+1 more)

### Community 48 - "city.js"
Cohesion: 0.31
Nodes (6): bld(), CT, LZ, slab(), wall(), winG()

### Community 50 - "levels.js"
Cohesion: 0.25
Nodes (5): lvJump(), lvMantle(), STH, STN, STS

### Community 51 - "percep.js"
Cohesion: 0.28
Nodes (7): PERC, PERC_R, PERC_SHOT, percGate(), percTick(), percTime(), percTired()

### Community 52 - "voix.js"
Cohesion: 0.33
Nodes (7): VX, VXB, vxPick(), vxPlayRec(), vxSay(), vxSub(), vxTick()

### Community 53 - "farm.js"
Cohesion: 0.32
Nodes (6): FARM, FCELL, FOR, inFarm(), inFor(), nzSkip()

### Community 54 - "emit"
Cohesion: 0.25
Nodes (8): boom(), decal(), eject(), emit(), hitFx(), impact(), pBatch(), shotFx()

### Community 55 - "hands3.js"
Cohesion: 0.39
Nodes (7): bRot(), hPose(), HR, hrInit(), mkHand(), mkRig(), _q

### Community 56 - "vehicles.js"
Cohesion: 0.43
Nodes (6): airLoop(), airSnd(), airSpawn(), airStop(), airTick(), jetGlow()

### Community 57 - "blessures.js"
Cohesion: 0.43
Nodes (5): BLE, bleFaint(), bleLimp(), bleSev(), bleTick()

### Community 58 - "fxFrame"
Cohesion: 0.29
Nodes (7): dustUpdate(), fxFrame(), pUpdate(), shUpdate(), tracer(), trPlace(), trUpdate()

### Community 59 - "props_rest.js"
Cohesion: 0.38
Nodes (5): okBox(), OKG, okgSync(), okPos(), RMS

### Community 60 - "wtex.js"
Cohesion: 0.48
Nodes (6): mkB(), wbar(), wbox(), wcyl(), wprof(), WT

### Community 61 - "bld_house.js"
Cohesion: 0.47
Nodes (5): bjit(), BKTN, FDU, house(), wallKind()

### Community 62 - "mort.js"
Cohesion: 0.60
Nodes (5): DEATH, deathCause(), deathEl(), deathHold(), deathStart()

### Community 63 - "nature.js"
Cohesion: 0.47
Nodes (4): grassCell(), grassFill(), nearPath(), PATHS

### Community 64 - "reclamer.js"
Cohesion: 0.33
Nodes (3): rcM, rcSide, SGR

### Community 65 - "trip.js"
Cohesion: 0.53
Nodes (5): TRB, trbBehind(), trbChance(), trbFall(), trbTick()

### Community 66 - "armes2.js"
Cohesion: 0.50
Nodes (3): WPX, wpxLoad(), wpxTick()

### Community 67 - "bots_vie.js"
Cohesion: 0.60
Nodes (4): bvOn(), bvPost(), BVR, bvTick()

### Community 68 - "perf.js"
Cohesion: 0.60
Nodes (4): perfBuild(), perfShadowSet(), perfTick(), PRF

### Community 70 - "merge.js"
Cohesion: 0.67
Nodes (3): MERGED, mergeGen(), mergeRoots()

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SELFTEST()` connect `health.js` to `ballistics.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `tex.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08806963645673323 - nodes in this community are weakly interconnected._
- **Why does `balTick()` connect `ballistics.js` to `health.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `ballistics.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._
- **Should `health.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06918238993710692 - nodes in this community are weakly interconnected._
- **Should `inventory.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08735150244584207 - nodes in this community are weakly interconnected._
- **Should `soldier.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0603921568627451 - nodes in this community are weakly interconnected._