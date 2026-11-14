// ================= PERFORMANCE (v41) : ombres des petits objets et des intérieurs, particules par lots (fx.js) =================
// La passe d'ombres redessine chaque objet qui projette une ombre dans le champ du soleil. Les accessoires d'intérieur ne se voient que depuis
// l'intérieur, et les petits objets lointains ne produisent pas d'ombre lisible : on coupe leur castShadow selon la position du joueur.
const PRF={int:[],tiny:[],built:0,t:0,off:0,n:{}};
function perfBuild(){if(PRF.built||typeof MERGED==='undefined'||!MERGED.out)return;PRF.built=1;const dyn=new Set();doors.forEach(d=>d.pv&&dyn.add(d.pv));if(window.VEHS)for(const v of(Array.isArray(VEHS)?VEHS:Object.values(VEHS)))if(v&&v.g)dyn.add(v.g);
 S.updateMatrixWorld(true);const sk=(o)=>{for(let p=o;p;p=p.parent)if(dyn.has(p)||p.userData&&(p.userData.door||p.userData.keep||p.userData.dyn))return true;return false};
 S.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||!o.castShadow||o.userData.merged||sk(o))return;if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const r=o.geometry.boundingSphere.radius*Math.max(o.scale.x,o.scale.y,o.scale.z),e=o.matrixWorld.elements,x=e[12],y=e[13],z=e[14];
  if(r<1.3&&inRoom(x,z)>=0&&y<roofTop(x,z)-.2)PRF.int.push({o,x,z});else if(r<.3)PRF.tiny.push({o,x,z})})}
function perfShadowSet(ins,px,pz){let off=0;for(const e of PRF.int){const d=Math.abs(e.x-px)+Math.abs(e.z-pz),c=ins&&d<40;if(e.o.castShadow!==c){e.o.castShadow=c}if(!c)off++}
 for(const e of PRF.tiny){const c=Math.abs(e.x-px)+Math.abs(e.z-pz)<30;if(e.o.castShadow!==c)e.o.castShadow=c;if(!c)off++}PRF.off=off;return off}
function perfTick(dt){PRF.t-=dt;if(PRF.t>0)return;PRF.t=.6;PRF.rb=(PRF.rb||0)+1;if(PRF.rb%25===0){PRF.built=0;PRF.int.length=0;PRF.tiny.length=0}perfBuild();if(!PRF.built)return;const ri=inRoom(P.x,P.z);perfShadowSet(ri>=0&&P.gy<roofTop(P.x,P.z)+.2,P.x,P.z)}
