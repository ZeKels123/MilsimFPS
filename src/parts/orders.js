// ================= ORDRES D'ESCOUADE (v30) =================
// Le chef (soldat d'assaut, sinon tireur) analyse la situation et donne un ordre vocal : grenade, contournement, tir de couverture,
// repli, regroupement. Les bots désignés répondent et exécutent ; le joueur entend (et lit) les ordres à moins de 45 m.
function ordInit(){ORD.i=1;Object.assign(VX.L,{
 oFlank:['Vous deux, contournez par le flanc !','Flanquez-le, on le fixe ici !','Deux hommes sur la droite, allez-y !'],
 oCover:['Feu de couverture, maintenant !','Couvrez-nous, tirez !','Arrosez sa position !'],
 oGren:['Grenade sur sa position !','Balance une grenade !','Dégoupille, grenade !'],
 oRet:['Repli ! Repli !','On décroche, tout le monde !','Repliez-vous, vite !'],
 oReg:['Regroupez-vous sur moi !','On se regroupe, serrez les rangs !','Tout le monde à moi !']})}
const ORD={n:0,log:[],i:0};
function sqLeader(al){return al.find(b=>b.ty===1)||al.find(b=>b.ty===0)||al.find(b=>b.ty===2)||al[0]}
function sqSay(b,key){if(!ORD.i)ordInit();vxSay(b,key,true,true)}
function sqAck(list){list.forEach((b,i)=>setTimeout(()=>{if(!b.dead)vxSay(b,'ack',true,true)},900+i*650))}
function sqIssue(q,k,ld,who){ORD.n++;q.last=k;q.lastT=VX.t;ORD.log.push(k);if(ORD.log.length>20)ORD.log.shift();sqSay(ld,k==='flank'?'oFlank':k==='cover'?'oCover':k==='gren'?'oGren':k==='ret'?'oRet':'oReg');sqAck(who)}
// tir de couverture d'un bot désigné
function sqCoverFire(b,q,dt){if(b.mag<=0||b.relT>0||b.stun>0||b.blind>0||b.heal||b.lvl||b.route||b.unarm)return;
const g=b.g.position;b.path=null;b.cr=1;b.decT=Math.max(b.decT,.4);if(!b.see){b.st='atk';b.yaw=Math.atan2(q.lk.x-g.x,q.lk.z-g.z)}if(b.cd<=0&&Math.hypot(q.lk.x-g.x,q.lk.z-g.z)<b.T.rng*1.2)sqFire(b,q,dt)}
function sqOrders(q,al,dt){if(!ORD.i)ordInit();
for(const b of al)if(b.ordCover>0){b.ordCover-=dt;sqCoverFire(b,q,dt)}
q.oT=(q.oT===undefined?rnd(2,5):q.oT)-dt;if(q.oT>0)return;
const ld=sqLeader(al);if(!ld||al.length<2||ld.stun>0||ld.blind>0||ld.heal||ld.lvl||ld.route){q.oT=2;return}
const lg=ld.g.position,free=al.filter(b=>b!==ld&&!b.heal&&!b.lvl&&!b.route&&b.stun<=0&&b.blind<=0&&!b.unarm&&b.fleeT<=0&&!b.dorm&&!(b.ordCover>0));
// hors contact : regrouper les membres éparpillés
if(q.t<=0){q.oT=rnd(14,24);const far=free.filter(b=>!b.alert&&b.seenT>8&&Math.hypot(b.g.position.x-lg.x,b.g.position.z-lg.z)>28);
if(far.length&&!ld.alert&&q.ret<=0){let n=0;far.forEach(b=>{if(goTo(b,lg.x+rnd(-4,4),lg.z+rnd(-4,4),1.5,'pat'))n++});if(n)sqIssue(q,'reg',ld,far)}return}
if(!free.length||q.ret>0){q.oT=3;return}
const seen=al.some(b=>b.see),lkd=Math.hypot(q.lk.x-lg.x,q.lk.z-lg.z);let k=null,who=[];
// 1. grenade sur la dernière position connue quand personne ne voit le joueur
const gb=!seen&&q.t>1&&AI.nadeCd<=0?free.find(b=>b.ty<2&&b.nadeCd<=0&&inRoom(b.g.position.x,b.g.position.z)<0&&(d=>d>9&&d<30)(Math.hypot(q.lk.x-b.g.position.x,q.lk.z-b.g.position.z))):null;
if(gb){gb.lk.x=q.lk.x;gb.lk.z=q.lk.z;if(botThrow(gb,Math.random()<.72?0:(Math.random()<.5?1:2))){k='gren';who=[gb]}}
// 2. contournement par deux hommes pendant que le reste fixe le joueur
if(!k&&(seen||q.t>2)&&free.length>=2&&lkd>12&&lkd<75&&(q.lastO!=='flank'||VX.t-(q.lastT||0)>18)&&VX.t-(q.flT||0)>18){const fl=free.filter(b=>b.ty<2).slice(0,2);let n=0;const got=[];for(const b of fl){if(aiFlank(b,P.x,P.z)){n++;got.push(b)}}
if(n){q.flT=VX.t;k='flank';who=got;const cv=al.filter(b=>!got.includes(b)&&b!==ld&&!b.heal);const c1=cv.find(b=>b===q.sup)||cv[0];if(c1)c1.ordCover=7;who=got.concat(c1?[c1]:[])}}
// 3. tir de couverture quand le joueur est bloqué ou masqué
if(!k&&q.t>0&&free.length>=1){const c=free.find(b=>b===q.sup)||free[0];if(c&&c.mag>6){c.ordCover=6;k='cover';who=[c]}}
if(k)sqIssue(q,k,ld,who);q.oT=k?rnd(8,13):2.5}
