// ================= v49 : SÉQUENCE DE MORT =================
// Avant : à 0 PV le joueur était téléporté instantanément à l'abri, sans aucune transition.
// Maintenant : chute de la caméra, écran rouge puis noir, cause et distance du tireur, délai de réapparition (Espace pour accélérer).
const DEATH={on:0,t:0,len:4.8,min:1.8,roll:0,k:null,src:null,z:null,txt:'',sub:'',el:null,fade:0,from:null};
// mémorise la nature du dernier dégât reçu (balle, éclats, souffle, chute…)
{const _ha=hlApply;hlApply=function(z,d,k,src){if(!HM.dead&&d>0&&!ac.on){DEATH.k=k||'x';DEATH.z=z;DEATH.src=src&&isFinite(src.x)?{x:src.x,z:src.z}:null}return _ha.apply(this,arguments)}}
function deathCause(){const w=HM.why||'',d=DEATH.src?Math.round(Math.hypot(DEATH.src.x-P.x,DEATH.src.z-P.z)):0;
 const a={b:'Touché par une balle',g:'Tué par des éclats de grenade',o:'Tué par le souffle ou les brûlures',f:'Mort après une chute',x:'Mort de ses blessures'}[DEATH.k]||'Mort au combat';
 const z=w==='Tête'?'coup à la tête':w==='Thorax'?'coup au thorax':w==='Hémorragie'?'hémorragie':'';
 return {t:a,s:[z?z.charAt(0).toUpperCase()+z.slice(1):'',d>0&&DEATH.k==='b'?'tireur à '+d+' m':''].filter(Boolean).join(' · ')}}
function deathEl(){if(DEATH.el)return DEATH.el;const e=document.createElement('div');e.id='mort';e.style.cssText='position:fixed;inset:0;z-index:25;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,rgba(90,6,6,.55),rgba(0,0,0,.96) 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8e2d4;font-family:inherit;text-align:center';
 e.innerHTML='<div class="mt" style="font-size:34px;letter-spacing:.35em;color:#d6463a;opacity:0;transition:opacity .8s">VOUS ÊTES MORT</div><div class="mc" style="margin-top:14px;font-size:16px;opacity:0;transition:opacity .8s"></div><div class="ms" style="margin-top:6px;font-size:13px;opacity:0;transition:opacity .8s;color:#aaa"></div><div class="mr" style="margin-top:28px;font-size:13px;opacity:0;transition:opacity .6s;color:#c8f07a"></div>';
 document.body.appendChild(e);return DEATH.el=e}
function deathStart(){DEATH.on=1;DEATH.t=0;DEATH.roll=(Math.random()<.5?-1:1)*(.45+Math.random()*.35);DEATH.from=null;const c=deathCause();DEATH.txt=c.t;DEATH.sub=c.s;
 try{if(DRV.on)drvExit(true)}catch(e){}try{if(INV.open)invOpen(false)}catch(e){}
 const e=deathEl();e.querySelector('.mc').textContent=c.t;e.querySelector('.ms').textContent=c.s;e.style.display='flex';mdown=false;ads=false;try{gun.visible=false}catch(e){}}
// appelé à chaque image quand P.hp<=0 : renvoie true tant que la séquence dure, false quand le joueur peut réapparaître
function deathHold(dt){if(!DEATH.on)deathStart();DEATH.t+=dt;if(DEATH.t<DEATH.min)DEATH.skip=0;for(const k in K)K[k]=false;mdown=false;ads=false;P.hp=0;
 const e=deathEl(),t=DEATH.t;e.style.opacity=Math.min(1,t/2.2);e.querySelector('.mt').style.opacity=t>.9?1:0;e.querySelector('.mc').style.opacity=t>1.4?1:0;e.querySelector('.ms').style.opacity=t>1.7?1:0;
 const rem=Math.max(0,DEATH.len-t),r=e.querySelector('.mr');r.style.opacity=t>DEATH.min?1:0;r.textContent=t>DEATH.min?'Réapparition dans '+Math.ceil(rem)+' s — [Espace] pour réapparaître maintenant':'';
 if(t>=DEATH.len||(DEATH.skip&&t>=DEATH.min)){DEATH.on=0;DEATH.skip=0;DEATH.fade=1.4;DEATH.k=null;DEATH.src=null;try{if(!DRV.on)gun.visible=true}catch(e){}return false}
 return true}
// caméra au sol + fondu de réapparition (juste avant le rendu)
{const _fx=fxFrame;fxFrame=function(dt){const r=_fx.apply(this,arguments);
 if(DEATH.on){const k=Math.min(1,DEATH.t/1.1),e=k*k*(3-2*k);C.position.y=C.position.y*(1-e)+(P.gy+.3)*e;C.rotation.z=DEATH.roll*e;C.rotation.x+=(-.3-C.rotation.x)*e*.5}
 else if(DEATH.fade>0){DEATH.fade-=dt;const e=deathEl();e.style.opacity=Math.max(0,DEATH.fade/1.4);e.querySelector('.mt').style.opacity=e.querySelector('.mc').style.opacity=e.querySelector('.ms').style.opacity=e.querySelector('.mr').style.opacity=0;if(DEATH.fade<=0){e.style.display='none';C.rotation.z=0}}
 return r}}
// pendant la mort : plus aucune commande, sauf Espace / Entrée pour accélérer la réapparition
addEventListener('keydown',e=>{if(!DEATH.on)return;if((e.code==='Space'||e.code==='Enter')&&DEATH.t>=DEATH.min)DEATH.skip=1;e.stopImmediatePropagation();e.preventDefault()},true);
addEventListener('mousedown',e=>{if(DEATH.on)e.stopImmediatePropagation()},true);
addEventListener('wheel',e=>{if(DEATH.on)e.stopImmediatePropagation()},true);
