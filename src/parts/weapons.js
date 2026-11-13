// ================= ARMES DÉTAILLÉES + ANIMATIONS PAR ARME (v4) =================
const rv=(...a)=>{const o=bx(...a);rifleParts.push(o);return o};
const mtl=std(0x2a2c2e,{roughness:.35,metalness:.85,envMapIntensity:1}),brs=std(0xb08a3a,{roughness:.35,metalness:.9,envMapIntensity:1}),rdM=std(0x9a2a20,{roughness:.55,metalness:.1});
// --- fusil d'assaut
for(let k=0;k<13;k++)rv(.022,.006,.012,0,.0365,-.4+k*.045,dk);rv(.026,.008,.62,0,.033,-.1,mtl);
for(let k=0;k<5;k++){rv(.058,.012,.012,0,-.005,-.29+k*.04,dk);rv(.006,.02,.012,.029,-.005,-.29+k*.04,dk)}
const rfCH=rv(.03,.014,.07,0,.046,.1,mtl);rv(.012,.02,.012,.012,.054,.13,dk);rv(.012,.02,.012,-.012,.054,.13,dk);
rv(.004,.03,.09,.0265,.012,-.02,dk);rv(.006,.012,.03,.029,.005,.0,brs);rv(.012,.05,.014,0,-.068,.1,dk);rv(.012,.012,.07,0,-.095,.065,dk);rv(.012,.05,.012,0,-.075,.0,dk);
rv(.034,.034,.05,0,.014,-.54,mtl);rv(.012,.05,.012,0,.05,-.46,dk);rv(.036,.012,.03,0,.034,-.5,dk);rv(.052,.012,.4,0,-.032,-.1,mtl);
for(let k=0;k<5;k++)bx(.037,.005,.072,0,-.04+k*.025,0,mtl,rifleParts[4]);bx(.038,.008,.074,0,.07,0,brs,rifleParts[4]);
// --- pistolet
{const g=wg[2],s=wm[2];for(let k=0;k<6;k++)bx(.034,.036,.004,0,.02,-.02-k*.009,dk,s);bx(.03,.004,.2,0,.042,-.12,mtl,s);bx(.006,.012,.01,0,.054,-.205,rdM,s);bx(.004,.025,.05,.0165,.02,-.15,dk,s);
bx(.008,.028,.008,0,-.038,-.075,mtl,g);bx(.009,.012,.075,0,-.052,-.1,dk,g);bx(.009,.026,.012,0,-.04,-.135,dk,g);bx(.03,.008,.062,0,-.128,-.035,mtl,g);bx(.016,.02,.04,0,-.02,-.19,dk,g);
for(let k=0;k<4;k++)bx(.032,.006,.05,0,-.04-k*.018,-.035,dk,g).rotation.x=-.12}
const pMag=wg[2].children.find(c=>c.geometry&&c.geometry.parameters&&c.geometry.parameters.height===.11),pMagY=pMag.position.y;
// --- fusil à pompe
{const g=wg[3],p=wm[3];for(let k=0;k<8;k++)bx(.03,.007,.012,0,.037,-.2-k*.04,mtl,g);for(let k=0;k<6;k++)bx(.057,.047,.006,0,-.014,-.3-k*.02,mtl,p);
bx(.036,.036,.02,0,.022,-.565,mtl,g);bx(.026,.026,.012,0,-.014,-.54,brs,g);bx(.012,.012,.012,0,.044,-.55,rdM,g);bx(.02,.02,.1,0,-.014,-.43,mtl,g);bx(.044,.026,.08,0,-.052,-.02,dk,g);bx(.01,.05,.01,0,-.07,.04,dk,g);
for(let k=0;k<5;k++){const sh=bx(.018,.018,.045,.0285,.006,-.1+k*.05,rdM,g);sh.rotation.y=0;bx(.018,.018,.012,.0285,.006,-.1+k*.05+.026,brs,g)}
bx(.052,.006,.2,0,-.034,-.06,mtl,g);bx(.006,.03,.06,.0265,.012,-.03,dk,g);bx(.045,.015,.04,0,.03,.3,dk,g)}
const shl=new THREE.Group();bx(.02,.02,.05,0,0,0,rdM,shl);bx(.021,.021,.012,0,0,.028,brs,shl);gun.add(shl);shl.visible=false;
// --- fusil de précision
{const g=wg[4];for(let k=0;k<6;k++)bx(.027,.027,.01,0,.015,-.3-k*.07,mtl,g);bx(.034,.034,.09,0,.015,-.74,mtl,g);for(let k=0;k<3;k++)bx(.044,.006,.07,0,.015,-.8+k*0,dk,g).visible=false;
bx(.046,.046,.075,0,.015,-.84,dk,g);for(let k=0;k<3;k++){bx(.048,.014,.012,0,.015,-.82-k*.02,mtl,g)}bx(.05,.005,.05,0,.015,-.84,mtl,g);
bx(.042,.034,.14,0,.07,.3,wd,g);bx(.038,.028,.2,0,.035,.2,mtl,g);bx(.012,.012,.18,.022,-.035,-.52,dk,g);bx(.012,.012,.18,-.022,-.035,-.52,dk,g);bx(.044,.018,.04,0,-.035,-.62,mtl,g);
bx(.052,.02,.3,0,.04,0,mtl,g);bx(.006,.04,.22,.0235,.002,-.02,dk,g);bx(.03,.04,.012,0,.054,.18,dk,g);bx(.036,.012,.5,0,-.012,-.45,dk,g)}
const sMag=wg[4].children.find(c=>c.geometry&&c.geometry.parameters&&c.geometry.parameters.height===.09&&c.geometry.parameters.depth===.07),sMagY=sMag.position.y;
// --- animations
const WAO={x:0,y:0,z:0,rx:0,ry:0,rz:0,cyc:0},pls=(u,a,b)=>u>a&&u<b?Math.sin(Math.PI*(u-a)/(b-a)):0;let wsd=0,shF=-1;
function wAnim(i,ru,ip,rl,is){const O=WAO;O.cyc=0;if(ru===0){wsd=0;shF=-1}
let x=-rl*.04-is*.12,y=-rl*.2+is*.04,z=rl*.05,rx=rl*.45-is*.2,ry=rl*.15+is*1.1,rz=rl*.35+is*Math.sin(ip*12.6)*.5;
if(i===0){rx=rl*.5-is*.25;rz=rl*.45+is*Math.sin(ip*9.4)*.4;rfCH.position.z=.1+.07*(reloadEmpty?pls(ru,.78,.93):0)+.07*pls(ip,.55,.7)}
else if(i===1){rx=rl*.4-is*.2;rz=rl*.3+is*Math.sin(ip*9.4)*.45}
else if(i===2){x=-rl*.05-is*.05;y=-rl*.03+is*.05;z=rl*.1;rx=rl*.8-is*.3;ry=rl*.12+is*2.5;rz=rl*.45+is*Math.sin(ip*6.28)*.3;O.cyc=pls(ip,.58,.78)+(reloadEmpty?0:0);
 const d=ru<.22?0:ru<.38?(ru-.22)/.16:ru<.58?1:ru<.72?1-(ru-.58)/.14:0;pMag.position.y=pMagY-.2*d;pMag.visible=!(ru>.38&&ru<.58);
 if(ru>.2&&wsd<1){wsd=1;snd(240,.05,.2,'square')}if(ru>.68&&wsd<2){wsd=2;snd(300,.06,.25,'square')}if(reloadEmpty&&ru>.84&&wsd<3){wsd=3;snd(190,.07,.3,'square')}}
else if(i===3){x=rl*.03;y=-rl*.1;z=rl*.04;rx=rl*.18-is*.15;ry=rl*.1+is*.9;rz=rl*.95+is*Math.sin(ip*6.28)*.25;O.cyc=pls(ru,.88,.99)+pls(ip,.28,.42)+pls(ip,.5,.64);
 if(ru>.88&&wsd<9){wsd=9;snd(110,.12,.3,'square')}}
else if(i===4){x=rl*.02;rx=rl*.3-is*.35;ry=rl*.08+is*1.4;rz=rl*.55+is*Math.sin(ip*6.28)*.2;O.cyc=pls(ru,.04,.2)+pls(ru,.8,.97)+pls(ip,.4,.7);
 const d=ru<.3?0:ru<.45?(ru-.3)/.15:ru<.58?1:ru<.7?1-(ru-.58)/.12:0;sMag.position.y=sMagY-.18*d;sMag.visible=!(ru>.45&&ru<.58);
 if(ru>.06&&wsd<1){wsd=1;snd(130,.08,.3,'square')}if(ru>.32&&wsd<2){wsd=2;snd(220,.06,.2,'square')}if(ru>.62&&wsd<3){wsd=3;snd(280,.07,.25,'square')}if(ru>.83&&wsd<4){wsd=4;snd(150,.1,.3,'square')}}
else if(i===5){x=rl*.02;y=rl*.05;rx=rl*.35-is*.3;ry=rl*.1+is*1.2;rz=rl*.4+is*Math.sin(ip*6.28)*.25;
 const d=ru<.2?0:ru<.38?(ru-.2)/.18:ru<.62?1:ru<.8?1-(ru-.62)/.18:0;hmgBox.position.y=-.14*d;hmgBox.visible=!(ru>.38&&ru<.62);
 if(ru>.18&&wsd<1){wsd=1;snd(120,.1,.3,'square')}if(ru>.4&&wsd<2){wsd=2;snd(90,.15,.25,'square')}if(ru>.64&&wsd<3){wsd=3;snd(240,.07,.3,'square')}if(ru>.85&&wsd<4){wsd=4;snd(150,.12,.3,'square')}}
if(i!==5){hmgBox.position.y=0;hmgBox.visible=true}if(i!==2)pMag.visible=true;if(i!==4)sMag.visible=true;if(i!==3)shl.visible=false;
O.x=x;O.y=y;O.z=z;O.rx=rx;O.ry=ry;O.rz=rz;return O}
function wHand(i,ru,H){const R_={h:H,mv:true};
if(i===2)R_.h=kf([[0,H],[.1,[0,-.1,-.02]],[.22,[0,-.15,-.03]],[.38,[0,-.34,-.03]],[.5,[-.08,-.42,.04]],[.6,[-.02,-.26,0]],[.72,[0,-.13,-.03]],[.82,[0,-.11,-.04]],[.9,[.02,-.04,-.14]],[1,H]],ru);
else if(i===3){if(ru<.88){const u=Math.min(.999,ru/.88)*6,f=u%1,n=Math.floor(u);R_.h=kf([[0,[-.1,-.36,.03]],[.45,[0,-.095,-.03]],[.62,[0,-.09,-.04]],[1,[-.1,-.36,.03]]],f);
 shl.visible=f<.62;shl.position.set(R_.h[0],R_.h[1]+.025,R_.h[2]-.03);shl.rotation.x=f<.45?-.5:0;if(f>.5&&n!==shF){shF=n;snd(180,.05,.18,'square')}}
 else{shl.visible=false;R_.h=kf([[.88,[0,-.09,-.04]],[1,H]],ru)}}
else if(i===4)R_.h=kf([[0,H],[.12,[0,-.12,.05]],[.28,[0,-.2,.05]],[.42,[-.1,-.42,.05]],[.56,[-.05,-.26,.05]],[.7,[0,-.11,.03]],[.82,[0,-.1,.02]],[.95,H],[1,H]],ru);
return R_}
