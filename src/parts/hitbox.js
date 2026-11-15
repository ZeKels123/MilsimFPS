// ================= HITBOX DES BOTS (v43.5) : capsules sur le squelette réel =================
// Les anciennes boîtes invisibles restaient sur l'ancien squelette procédural (debout, jambes figées) alors que le soldat visible court, s'accroupit ou tombe.
// Les zones de tir (tête, thorax, ventre, bras, jambes) sont désormais des capsules qui suivent les os du modèle animé.
const HBX={segs:[
 ['h','Head','HeadTop',.125,1],
 ['t','Spine1','Spine2',.21],['t','Spine2','Neck',.17],
 ['a','Hips','Spine',.18],['a','Spine','Spine1',.19],
 ['la','LeftArm','LeftForeArm',.065],['la','LeftForeArm','LeftHand',.055],
 ['ra','RightArm','RightForeArm',.065],['ra','RightForeArm','RightHand',.055],
 ['ll','LeftUpLeg','LeftLeg',.1],['ll','LeftLeg','LeftFoot',.075],
 ['rl','RightUpLeg','RightLeg',.1],['rl','RightLeg','RightFoot',.075]],
 geo:null,mat:null,n:0,show:0,mats:null};
const HBC={h:0xff3030,t:0xff9a30,a:0xffe030,la:0x30a0ff,ra:0x30a0ff,ll:0x40e060,rl:0x40e060};
function hbxMat(z){if(!HBX.show)return HBX.mat;if(!HBX.mats){HBX.mats={};for(const k in HBC)HBX.mats[k]=new THREE.MeshBasicMaterial({color:HBC[k],wireframe:true,transparent:true,opacity:.7,depthTest:false,fog:false})}return HBX.mats[z]}
function hbxToggle(){HBX.show=HBX.show?0:1;for(const b of bots)if(b.hbx)for(const m of b.hbx){m.material=hbxMat(m.userData.zone);m.renderOrder=HBX.show?8:0}try{hlMsg(HBX.show?'Hitbox visibles (F5) : rouge tête · orange thorax · jaune ventre · bleu bras · vert jambes':'Hitbox masquées')}catch(e){}}
addEventListener('keydown',e=>{if(e.code==='F5'&&!e.repeat){e.preventDefault();hbxToggle()}});
const _hA=new THREE.Vector3(),_hB=new THREE.Vector3(),_hD=new THREE.Vector3(),_hY=new THREE.Vector3(0,1,0);
function hbxBuild(b){
 if(!HBX.geo){HBX.geo=new THREE.CylinderGeometry(1,1,1,8,1);HBX.mat=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})}
 for(const o of b.parts){const i=botParts.indexOf(o);if(i>=0)botParts.splice(i,1)}
 b.parts=[];b.hbx=[];
 for(const s of HBX.segs){const m=new THREE.Mesh(HBX.geo,hbxMat(s[0]));m.renderOrder=HBX.show?8:0;m.userData={bot:b,zone:s[0],hbx:1};if(s[4])m.userData.head=true;b.sld.sg.add(m);b.parts.push(m);botParts.push(m);b.hbx.push(m)}
 if(typeof BAL!=='undefined')BAL.tg=null;HBX.n++}
function hbxUpdate(b){
 const sd=b.sld;if(!sd)return;if(!b.hbx)hbxBuild(b);
 const ix=SLS.ix,bn=sd.bones;
 for(let i=0;i<HBX.segs.length;i++){const s=HBX.segs[i],m=b.hbx[i];
  if(s[2]==='HeadTop'){_hB.copy(bn[ix.Head].position).sub(bn[ix.Neck].position);if(_hB.lengthSq()<1e-6)_hB.set(0,1,0);_hB.normalize();_hA.copy(bn[ix.Head].position).addScaledVector(_hB,.04);_hB.multiplyScalar(.19).add(bn[ix.Head].position)}
  else{_hA.copy(bn[ix[s[1]]].position);_hB.copy(bn[ix[s[2]]].position)}
  _hD.subVectors(_hB,_hA);const L=_hD.length();if(L<1e-4)continue;
  m.position.copy(_hA).add(_hB).multiplyScalar(.5);m.scale.set(s[3],L+s[3]*.7,s[3]);m.quaternion.setFromUnitVectors(_hY,_hD.multiplyScalar(1/L));m.matrixWorldNeedsUpdate=true}
 if(HBX.show){const d=Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z)<90&&!b.dorm&&!(b.dead>50);for(const m of b.hbx)m.visible=d}}
const sldU2=sldUpdate;sldUpdate=function(b,dt,mv){sldU2(b,dt,mv);try{hbxUpdate(b)}catch(e){console.error('hbx',e)}};
// ---- collision des cadavres avec les murs/obstacles (boxes) : le corps est repoussé hors du mur, il ne finit plus à travers
const DCP=['Head','Spine2','Hips','LeftHand','RightHand','LeftLeg','RightLeg','LeftFoot','RightFoot'],_dcV=new THREE.Vector3();
function dcolPush(b){
 if(!(b.dead>0)||b.dead>50||!b.sld||!b.sld.sg||(b.fall||0)>4)return 0;
 const g=b.g;if(Math.hypot(g.position.x-P.x,g.position.z-P.z)>90)return 0;
 g.updateMatrixWorld(true);const bn=b.sld.bones,ix=SLS.ix,sg=b.sld.sg,gy=g.position.y,R=.2,pts=[];
 for(const n of DCP){const q=bn[ix[n]];if(!q)continue;_dcV.copy(q.position);sg.localToWorld(_dcV);pts.push([_dcV.x,_dcV.y,_dcV.z])}
 let sx=0,sz=0,moved=0;const hx=g.position.x,hz=g.position.z;
 for(let pass=0;pass<3;pass++){let any=0;
  for(const p of pts){const x=p[0]+sx,z=p[2]+sz,y=p[1];
   for(const o of boxes){if(o.y1<gy+.15||o.y0>y+.3&&o.y0>gy+1.5)continue;if(o.y0>gy+1.2)continue;
    if(x<o.x0-R||x>o.x1+R||z<o.z0-R||z>o.z1+R)continue;
    const pl=x+R-o.x0,pr=o.x1+R-x,pb=z+R-o.z0,pf=o.z1+R-z;let ax=pl<pr?-pl:pr,az=pb<pf?-pb:pf;
    const hxo=hx+sx<o.x0-R?-1:hx+sx>o.x1+R?1:0,hzo=hz+sz<o.z0-R?-1:hz+sz>o.z1+R?1:0;
    if(hxo&&!hzo)ax=hxo<0?-pl:pr,az=0;else if(hzo&&!hxo)az=hzo<0?-pb:pf,ax=0;else if(Math.abs(ax)<Math.abs(az))az=0;else ax=0;
    sx+=ax;sz+=az;any=1;moved=1;break}
  }
  if(!any)break}
 if(moved){g.position.x+=sx;g.position.z+=sz;g.updateMatrixWorld(true);b.dcPush=(b.dcPush||0)+Math.hypot(sx,sz)}
 return moved}
{const sU3=sldUpdate;sldUpdate=function(b,dt,mv){sU3(b,dt,mv);if(b.dead>0){try{dcolPush(b)}catch(e){console.error('dcol',e)}}}}
