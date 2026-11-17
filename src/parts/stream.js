// ================= STREAMING (v14) : construction à la demande autour du joueur + masquage par distance =================
const LZR={build:160,show:180,hide:200};
function lzBuiltAt(x,z){for(const q of LZ.built)if(x>=q.r[0]&&x<=q.r[1]&&z>=q.r[2]&&z<=q.r[3])return true;return false}
function cityBad(x,z){return typeof CT!=='undefined'&&x>CT.x0-6&&x<CT.x1+6&&z>CT.z0-6&&z<CT.z1+6&&!lzBuiltAt(x,z)}
function lzDist(r,x,z){return Math.hypot(Math.max(r[0]-x,0,x-r[1]),Math.max(r[2]-z,0,z-r[3]))}
function lzBuild(q){const n0=S.children.length,s0=solids.length,b0=boxes.length;q.fn();const nw=S.children.slice(n0);nw.forEach(o=>o.updateMatrixWorld(true));
for(let i=s0;i<solids.length;i++)ray.push(solids[i]);
const m=.3;for(let i=b0;i<boxes.length;i++){const o=boxes[i];if(o.y0>1.7||o.stair)continue;const i0=Math.max(0,Math.ceil((o.x0-m+MH)/NS-.5)),i1=Math.min(NGN-1,Math.floor((o.x1+m+MH)/NS-.5)),j0=Math.max(0,Math.ceil((o.z0-m+MH)/NS-.5)),j1=Math.min(NGN-1,Math.floor((o.z1+m+MH)/NS-.5));for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)NAVB[j*NGN+k]=1}
// la fusion des maillages (65-160 ms pour un grand immeuble) est étalée sur plusieurs images : en attendant, les originaux restent visibles
q.objs=[];q.vis=true;q.mgen=mergeGen(nw);q.mnw=nw;LZ.mg.push(q);LZ.built.push(q);LZ.n++;if(typeof navEject==='function')navEject()}
LZ.mg=[];
function lzMergeStep(ms){const t0=performance.now();while(LZ.mg.length&&performance.now()-t0<ms){const q=LZ.mg[0];let r;try{r=q.mgen.next()}catch(e){console.warn('lzmerge',e);r={done:true,value:[]}}if(r.done){LZ.mg.shift();q.objs=(r.value||[]).concat(q.mnw.filter(o=>o.layers.mask&1));q.mgen=q.mnw=null;if(!q.vis)q.objs.forEach(o=>o.visible=false)}}}
function lzUpdate(dt){const _n=performance.now();if(_n-LZ.t<(LZ.mg.length?40:200))return;LZ.t=_n;const x=P.x,z=P.z;lzMergeStep(6+3*Math.min(4,LZ.mg.length));const t0=performance.now();
while(LZ.q.length&&LZ.mg.length<3&&performance.now()-t0<14){let bi=-1,bd=LZR.build;for(let i=0;i<LZ.q.length;i++){const d=lzDist(LZ.q[i].r,x,z);if(d<bd){bd=d;bi=i}}if(bi<0)break;const q=LZ.q.splice(bi,1)[0];try{lzBuild(q)}catch(e){console.warn('lz',e)}}
for(const q of LZ.built){const d=lzDist(q.r,x,z),v=q.vis?d<LZR.hide:d<LZR.show;if(v!==q.vis){q.vis=v;q.objs.forEach(o=>o.visible=v)}}
// secteurs fusionnés au chargement
const F=MERGED.first;if(F){const N=Math.min(F.length,400);for(let k=0;k<N;k++){const o=F[LZ.k=(LZ.k+1)%F.length],bs=o.geometry.boundingSphere,d=Math.hypot(bs.center.x-x,bs.center.z-z)-bs.radius;o.visible=o.visible?d<LZR.hide:d<LZR.show}}}
