// forêt dense (sud-ouest) : arbres plantés avant le semis général, avec des clairières
{let c=0,tt=0;const FN=6000;while(c<FN&&tt++<120000){const x=rnd(FOR.x0,FOR.x1),z=rnd(FOR.z0,FOR.z1),d=nzt(x*.05+11,z*.05+3);if(d<.32&&Math.random()<.9)continue;if(Math.max(Math.abs(x),Math.abs(z))>MH-9)continue;if(!okPos(x,z,2.2)||wDist(x,z)<2.5||nearPath(x,z,3.4))continue;
const s=rnd(.9,1.7),pine=Math.random()<.72;if(pine)np++;else no++;c++;TR.push({x,z,y:GH(x,z),s,ty:pine?0:1,r:rnd(0,6.28),h:rnd(.3,.45),sh:rnd(.7,1.15)})}}
