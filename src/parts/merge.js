// ================= OPTIMISATION (v5) : fusion des maillages statiques par matériau et par secteur =================
// les originaux restent pour les rayons (calque 1, non dessiné) ; les copies fusionnées sont dessinées.
const MERGED={n:0,out:0,ms:performance.now()};
function mergeRoots(roots){const made=[],dyn=new Set([C,sky]);doors.forEach(d=>dyn.add(d.pv));
const sg=m=>[m.type,m.color.getHex(),m.map?m.map.uuid:0,m.normalMap?m.normalMap.uuid:0,m.roughnessMap?m.roughnessMap.uuid:0,m.roughness,m.metalness,m.flatShading?1:0,m.side,m.vertexColors?1:0,m.emissive?m.emissive.getHex():0,m.emissiveIntensity,m.envMapIntensity,m.alphaTest,m.polygonOffset?m.polygonOffsetFactor:0,m.normalScale?m.normalScale.x:0,m.toneMapped?1:0].join('|');
const groups=new Map(),list=[];
const walk=(function walk(o,ok){if(dyn.has(o)||!o.visible)return;if(o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&o!==floor){const m=o.material,g=o.geometry;
if(!Array.isArray(m)&&!m.transparent&&!m.onBeforeCompile.toString().includes('sh')&&(m.isMeshStandardMaterial||m.isMeshBasicMaterial)&&!m.aoMap&&!m.lightMap&&!m.alphaMap&&!o.userData.glass&&!o.userData.door&&!o.userData.keep&&o.renderOrder===0&&g.attributes.position&&g.attributes.normal&&g.attributes.position.count<4000&&!g.morphAttributes.position)list.push(o)}
for(const c of o.children)walk(c)});roots.forEach(r=>walk(r));
for(const o of list){const e=o.matrixWorld.elements,k=sg(o.material)+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+Math.floor((e[12]+MH)/50)+','+Math.floor((e[14]+MH)/50);let q=groups.get(k);if(!q)groups.set(k,q=[]);q.push(o)}
const v=new THREE.Vector3(),nm=new THREE.Matrix3();
groups.forEach(q=>{if(q.length<2)return;const mat=q[0].material,vc=mat.vertexColors;let n=0;const gs=q.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;n+=g.attributes.position.count;return g});
const P_=new Float32Array(n*3),N_=new Float32Array(n*3),U_=new Float32Array(n*2),C_=vc?new Float32Array(n*3):null;let k=0;
q.forEach((o,i)=>{const g=gs[i],p=g.attributes.position,nn=g.attributes.normal,uv=g.attributes.uv,cl=g.attributes.color,M=o.matrixWorld,fl=M.determinant()<0,c=p.count;nm.getNormalMatrix(M);
for(let j=0;j<c;j++){const s=fl?j-j%3+(2-j%3):j,d=k+j;v.fromBufferAttribute(p,s).applyMatrix4(M);P_[d*3]=v.x;P_[d*3+1]=v.y;P_[d*3+2]=v.z;v.fromBufferAttribute(nn,s).applyMatrix3(nm).normalize();N_[d*3]=v.x;N_[d*3+1]=v.y;N_[d*3+2]=v.z;
if(uv){U_[d*2]=uv.getX(s);U_[d*2+1]=uv.getY(s)}if(C_){if(cl){C_[d*3]=cl.getX(s);C_[d*3+1]=cl.getY(s);C_[d*3+2]=cl.getZ(s)}else C_[d*3]=C_[d*3+1]=C_[d*3+2]=1}}
k+=c;if(g!==o.geometry)g.dispose();o.layers.set(1);o.matrixAutoUpdate=false});
const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P_,3));G.setAttribute('normal',new THREE.BufferAttribute(N_,3));G.setAttribute('uv',new THREE.BufferAttribute(U_,2));if(C_)G.setAttribute('color',new THREE.BufferAttribute(C_,3));G.computeBoundingSphere();G.computeBoundingBox();
const me=new THREE.Mesh(G,mat);me.castShadow=q[0].castShadow;me.receiveShadow=q[0].receiveShadow;me.matrixAutoUpdate=false;me.userData.merged=1;S.add(me);made.push(me);MERGED.n+=q.length;MERGED.out++});return made}
S.updateMatrixWorld(true);MERGED.first=mergeRoots([S]);MERGED.ms=performance.now()-MERGED.ms;
