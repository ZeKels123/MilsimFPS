// ================= STREAMING (v14) : construction à la demande autour du joueur + masquage par distance =================
const LZR={build:160,show:180,hide:200};
function lzDist(r,x,z){return Math.hypot(Math.max(r[0]-x,0,x-r[1]),Math.max(r[2]-z,0,z-r[3]))}
function lzBuild(q){const n0=S.children.length,s0=solids.length,b0=boxes.length;q.fn();const nw=S.children.slice(n0);nw.forEach(o=>o.updateMatrixWorld(true));const mg=mergeRoots(nw);
for(let i=s0;i<solids.length;i++)ray.push(solids[i]);
const m=.3;for(let i=b0;i<boxes.length;i++){const o=boxes[i];if(o.y0>1.7||o.stair)continue;const i0=Math.max(0,Math.ceil((o.x0-m+MH)/NS-.5)),i1=Math.min(NGN-1,Math.floor((o.x1+m+MH)/NS-.5)),j0=Math.max(0,Math.ceil((o.z0-m+MH)/NS-.5)),j1=Math.min(NGN-1,Math.floor((o.z1+m+MH)/NS-.5));for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)NAVB[j*NGN+k]=1}
q.objs=mg.concat(nw.filter(o=>o.layers.mask&1));q.vis=true;LZ.built.push(q);LZ.n++}
function lzUpdate(dt){LZ.t-=dt;if(LZ.t>0)return;LZ.t=.2;const x=P.x,z=P.z,t0=performance.now();
for(let i=LZ.q.length-1;i>=0;i--){const q=LZ.q[i];if(lzDist(q.r,x,z)<LZR.build){LZ.q.splice(i,1);lzBuild(q);if(performance.now()-t0>14)break}}
for(const q of LZ.built){const d=lzDist(q.r,x,z),v=q.vis?d<LZR.hide:d<LZR.show;if(v!==q.vis){q.vis=v;q.objs.forEach(o=>o.visible=v)}}
// secteurs fusionnés au chargement
const F=MERGED.first;if(F){const N=Math.min(F.length,400);for(let k=0;k<N;k++){const o=F[LZ.k=(LZ.k+1)%F.length],bs=o.geometry.boundingSphere,d=Math.hypot(bs.center.x-x,bs.center.z-z)-bs.radius;o.visible=o.visible?d<LZR.hide:d<LZR.show}}}
