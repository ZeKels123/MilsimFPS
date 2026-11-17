// ================= ÉTABLI : MODIFICATION D'ARME (v40) — canon, crosse, chargeur =================
const WMOD={};
const WMD={b:[{n:'Standard'},{n:'Court',v:.93,sp:1.12,w:1.015,rc:1.05,i:'vitesse −7 %, dispersion +12 %, +maniable'},{n:'Long',v:1.07,sp:.9,w:.97,rc:.97,i:'vitesse +7 %, dispersion −10 %, −maniable'}],
 s:[{n:'Standard'},{n:'Lourde',rc:.82,sp:.96,w:.97,i:'recul −18 %, −mobilité'},{n:'Légère',rc:1.18,w:1.02,i:'recul +18 %, +mobilité'}],
 m:[{n:'Standard'},{n:'Étendu',cap:1.5,rt:1.2,w:.98,i:'capacité +50 %, rechargement +20 %'},{n:'Rapide',cap:.8,rt:.75,i:'rechargement −25 %, capacité −20 %'}],
 l:[{n:'Aucun'},{n:'Laser rouge',sp:.85,i:'dispersion −15 %, repérable par les bots'},{n:'Laser IR',sp:.85,i:'dispersion −15 %, visible seulement avec la vision nocturne'}]};
const WMN={b:'Canon',s:'Crosse',m:'Chargeur',l:'Module'};
function wmGet(i){return WMOD[i]||(WMOD[i]={b:0,s:0,m:0,l:0})}
function wmCan(i,k){return !(k==='m'&&(WC[i].pel||1)>1)&&!(k==='b'&&/Pistolet/.test(WC[i].n)&&false)}
function wmK(f,i){i=i===undefined?WSEL:i;const m=wmGet(i);let r=1;for(const k of 'bsml')if(wmCan(i,k)){const v=WMD[k][m[k]|0][f];if(v)r*=v}return r}
function wmMagK(){return wmK('cap')}
function wmCycle(k){if(!bench&&!nb)return;const m=wmGet(WSEL);if(!wmCan(WSEL,k)){wpnMsg(WMN[k]+' : non disponible sur cette arme');return}m[k]=((m[k]|0)+1)%WMD[k].length;
 if(ammo>magMax()){reserve+=ammo-magMax();ammo=magMax()}snd(300,.06,.15,'square');if(bench)upBench();wmUi()}
function wmUi(){let d=document.getElementById('wm_ui');const bp=document.querySelector('#bench .bp');if(!bp)return;if(!d){d=document.createElement('div');d.id='wm_ui';d.className='bg';d.style.marginTop='8px';bp.appendChild(d)}
 let h='<div style="font-size:12px;opacity:.7;grid-column:1/-1">Modifications de l\'arme active (propres à chaque arme)</div>';const m=wmGet(WSEL);
 for(const k of 'bsml'){const o=WMD[k][m[k]|0],ok=wmCan(WSEL,k);h+='<button onclick="wmCycle(\''+k+'\')"'+(ok?'':' disabled style="opacity:.4"')+' class="'+(m[k]?'on':'')+'">'+WMN[k]+' <em>'+(ok?o.n:'—')+'</em><small>'+(ok&&o.i?o.i:'Clique pour changer')+'</small></button>'}
 if(d.dataset.h!==h){d.dataset.h=h;d.innerHTML=h}}
const upBench1=upBench;upBench=function(){upBench1();wmUi()};
const wpRecoil1=wpRecoil;wpRecoil=function(){return wpRecoil1()*wmK('rc')};
const wpSpread1=wpSpread;wpSpread=function(){return wpSpread1()*wmK('sp')};
const balSpawn2=balSpawn;balSpawn=function(o,d,am,x){if(x&&x.src==='p'&&am!=='bk')x.vk=(x.vk||1)*wmK('v')*(A.supp?.93:1);return balSpawn2(o,d,am,x)};
const HMV2=HMV;HMV=function(){return HMV2()*wmK('w')};
function wmTick(){if(!reloading)RT=WC[WSEL].rt*wmK('rt')}
