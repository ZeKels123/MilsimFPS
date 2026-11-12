house(-16.5,3.5,7,6,'E',HSTY[0],0,0);house(16.5,3.5,7,6,'W',HSTY[1],1,1,{up:1});house(-16.5,-12,7,6,'E',HSTY[2],2,2,{up:1});house(16.5,-12,7,6,'W',HSTY[3],3,3);
house(36,-44,7,6,'W',HSTY[0],0,0);house(-48,38,7,6,'E',HSTY[2],2,2,{up:1});house(-52,-28,7,6,'E',HSTY[1],1,1);house(50,-10,7,6,'W',HSTY[3],3,3,{up:1});
house(0,23.7,14,5.4,'N',BSTY,9,4,{bun:1,Dr:3});doors[doors.length-2].tgt=1;doors[doors.length-2].open=1;
// ---- v7 : anneau extérieur (carte 300 x 300 m) : 18 maisons dont 7 à étage, 2 postes bunker
const NEWH=[];const nh=(x,z,side,k,lay,o)=>{house(x,z,7,6,side,HSTY[k],lay,lay,o);const f=side==='E'?[1,0]:[-1,0];NEWH.push([x+f[0]*3.5,z+f[1]*3.5])};
nh(-95,-95,'E',0,0,{up:1});nh(-108,-78,'W',1,1);nh(-80,-110,'E',2,2);nh(-30,-105,'W',3,3,{up:1});nh(40,-118,'E',0,1);nh(88,-100,'W',1,2,{up:1});
nh(115,-72,'W',2,3);nh(100,-5,'W',0,1,{up:1});nh(122,35,'W',1,0);nh(104,94,'W',2,2);nh(112,110,'W',3,3,{up:1});
nh(40,105,'E',0,0);nh(-22,118,'E',1,1);nh(-92,108,'E',2,2,{up:1});nh(-118,62,'E',3,3);nh(-104,-8,'E',0,0);nh(-122,-42,'E',1,1,{up:1});
// v12 : villages et maisons isolées sur la carte agrandie (anneau extérieur)
{let sd=7919;const rn=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;let n=0;
for(let gx=-720;gx<=720;gx+=120)for(let gz=-720;gz<=720;gz+=120){if(Math.max(Math.abs(gx),Math.abs(gz))<150)continue;const x=Math.round(gx+(rn()-.5)*70),z=Math.round(gz+(rn()-.5)*70);if(rn()<.55||Math.abs(x)>MH-40||Math.abs(z)>MH-40)continue;
if(x>110&&x<540&&z<-310&&z>-745)continue;if(Math.abs(x-224)<18)continue;if(x<-120&&Math.abs(z-(102-.08*(x+150)))<38)continue;if(x>120&&Math.abs(z-(-10-.083*(x-150)))<38)continue;
const k=n%4;nh(x,z,rn()<.5?'E':'W',k,k,rn()<.4?{up:1}:undefined);
if(rn()<.5)nh(x+(rn()<.5?-1:1)*(12+rn()*8),z+(rn()-.5)*14,rn()<.5?'E':'W',(k+1)%4,(k+1)%4);n++}}
[[-100,-60,8],[100,60,7]].forEach(q=>{house(q[0],q[1],14,5.4,'N',BSTY,q[2],4,{bun:1,Dr:3});doors[doors.length-2].tgt=1;doors[doors.length-2].open=1;NEWH.push([q[0],q[1]+3.2])});
