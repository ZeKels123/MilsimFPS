// ================= BLESSURES DU JOUEUR (v38) : vision tunnel, boiterie, perte de connaissance, rétablissement =================
const BLE={out:0,rec:0,cd:0,ph:0,dip:0,tun:null,blk:null,s:0,faints:0};
function bleSev(){return Math.max(0,Math.min(1,Math.max((60-HM.bl)/60,(HM.mor>0?0:HM.pain-.3)*.9,(.22-HM.sta)*4,HM.conc*.12)))}
function bleLimp(){let l=0;['ll','rl'].forEach(z=>{if(HM.z&&HM.z[z]!==undefined)l=Math.max(l,hlLvl(z))});return l}
const HMV0=HMV;
HMV=function(){if(BLE.out>0)return 0;return HMV0()*(BLE.rec>0?.75:1)};
function bleTick(dt){if(!BLE.tun){const t=document.createElement('div');t.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:7;opacity:0;--r:75%;background:radial-gradient(ellipse at center,transparent var(--r),rgba(0,0,0,.96) calc(var(--r) + 28%))';document.body.appendChild(t);BLE.tun=t;
  const k=document.createElement('div');k.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9;background:#000;opacity:0';document.body.appendChild(k);BLE.blk=k}
 if(P.gy===undefined||HM.z===undefined||HM.z.t===undefined)return;
 if(HM.dead||P.hp<=0){BLE.out=0;BLE.tun.style.opacity=0;BLE.blk.style.opacity=0;return}
 const s=bleSev();BLE.s+=(s-BLE.s)*Math.min(1,dt*2);
 BLE.tun.style.opacity=Math.min(1,BLE.s*1.7).toFixed(2);BLE.tun.style.setProperty('--r',(78-58*BLE.s).toFixed(1)+'%');
 const gs=BLE.s>.3?'grayscale('+(Math.min(.8,BLE.s*.8)).toFixed(2)+')':'';if(BLE.gs!==gs){BLE.gs=gs;R.domElement.style.filter=gs}
 BLE.cd=Math.max(0,BLE.cd-dt);
 if(BLE.out>0){BLE.out-=dt;HM.act=null;BLE.blk.style.opacity=Math.min(1,BLE.out*1.5).toFixed(2);if(BLE.out<=0){BLE.rec=14;BLE.cd=40;HM.sta=Math.max(HM.sta,.35);try{feed('Vous reprenez connaissance')}catch(e){}}return}
 BLE.blk.style.opacity=0;if(BLE.rec>0)BLE.rec-=dt;
 if(!ac.on&&BLE.cd<=0){let p=0;if(HM.bl<24)p+=.25;if(HM.pain>.95&&HM.mor<=0)p+=.08;if(HM.sta<=0&&HM.bl<50)p+=.1;if(p>0&&Math.random()<p*dt)bleFaint()}
 // boiterie : creux de caméra à chaque pas sur la jambe touchée
 const l=bleLimp(),mv=Math.hypot(P.x-(BLE.lx||P.x),P.z-(BLE.lz||P.z));BLE.lx=P.x;BLE.lz=P.z;BLE.ph+=Math.min(mv,1.5)*2.3;
 BLE.dip=l?Math.max(0,Math.sin(BLE.ph))*(l===2?.075:.035):0}
function bleFaint(){BLE.out=rnd(4,7);BLE.faints++;HM.act=null;try{feed('Vous perdez connaissance')}catch(e){}}
function bleCam(){if(BLE.dip>0)C.position.y-=BLE.dip}
