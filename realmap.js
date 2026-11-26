(function(S){'use strict';
// Real Cairo (proof): real OSM roads - Zamalek, 6th October Bridge, Downtown.
// Data: realmap-data.json, (c) OpenStreetMap contributors, ODbL 1.0. Static file, no runtime API.
const T=window.THREE;if(!T)return;
const {CARS,Vehicle,wrap,clamp:cl}=S,$=id=>document.getElementById(id);
const col=h=>new T.Color(h).convertSRGBToLinear();
const W2=[8,7,6,4.5,3.5],TINT=[[.06,.06,.075],[.065,.065,.08],[.07,.07,.085],[.075,.075,.09],[.08,.08,.095]],LH=8;
class RealMap{
 constructor(g){this.g=g;this.on=false;this.built=false;this.cy=0;this.initMenu();
  addEventListener('keydown',e=>{if(!this.on)return;if(e.code==='KeyC')this.g.view=this.g.view?0:1;if(e.code==='KeyM'&&this.mapZs)this.mapR=this.mapZs[this.mapZi=(this.mapZi+1)%this.mapZs.length];if(e.code==='KeyR'&&this.wx)this.wx.forced=this.wx.forced===null?!this.wx.on:!this.wx.forced;if(e.code==='KeyX'&&this.chain&&this.chain.on){this.chain.on=false;this.chain.cd=40;this.g.popup('لغيت السلسلة.. الشغل العادي رجع')}if(e.code==='KeyV')this.photoTg();if(this.photo&&this.photo.on){if(e.code==='KeyQ')this.photo.dist=Math.min(30,this.photo.dist*1.18);if(e.code==='KeyE')this.photo.dist=Math.max(3.5,this.photo.dist/1.18)}})}
 initMenu(){const m=document.querySelector('.modes-card');if(!m||$('realCard'))return;const c=document.createElement('div');c.className='card';c.id='realCard';
  c.innerHTML='<h2>طرق مصر</h2><p class="foot">قُد على طرقات القاهرة الحقيقية: من الزمالك على كوبري 6 أكتوبر لوسط البلد، وطريق الهرم لحد الأهرامات. بيانات الخريطة © OpenStreetMap contributors (ODbL)</p><button class="btn primary" id="realGo">قُد على كوبري أكتوبر</button>';m.parentNode.insertBefore(c,m);
  $('realGo').onclick=()=>{this.g.audio.init();this.start()}}
 async start(){const g=this.g;if(!g.world)return;
  if(!this.data){try{const r=await fetch('realmap-data.json');this.data=await r.json()}catch(e){console.error(e);g.popup('بيانات الخريطة مش موجودة');return}}
  if(!g.own[CARS[g.sel].id]){g.popup('العربية مقفولة');return}
  try{if(!this.built)this.build()}catch(e){console.error(e);g.popup('الخريطة مش متاحة على الجهاز ده');return}
  {const w=g.world;this.pm0=w.prMax;w.prMax=Math.min(w.prMax,matchMedia('(pointer:coarse)').matches?1.25:1.6);if(w.pr>w.prMax)w.setPR(w.prMax)}
  this.prevAtm=g.atm;g.atm='night';g.world.atm('night');this.scene.environment=g.world.rt.texture;
  this.low=!!g.opt.low;this.moon.castShadow=!this.low&&!matchMedia('(pointer:coarse)').matches;
  this.mkCar();this.on=true;g.state='REAL';g.paused=false;g.keys={};
  document.body.classList.toggle('low',this.low);
  ['menu','over','pause','hud','count'].forEach(i=>{const e=$(i);if(e)e.hidden=true});$('realHud').hidden=false;g.shiftUi();$('touch').hidden=!matchMedia('(pointer:coarse)').matches;g.audio.init();
  g.popup('طرقات القاهرة الحقيقية من OpenStreetMap. روح شرق على كوبري 6 أكتوبر')}
 stop(){if(!this.on)return;{const w=this.g.world;if(this.pm0)w.prMax=this.pm0}this.on=false;const g=this.g;$('realHud').hidden=true;if(this.pcar)this.scene.remove(this.pcar.g);this.scene.environment=null;
  if(this.prevAtm){g.atm=this.prevAtm;g.world.atm(g.atm)}g.setAtm(0);document.body.classList.toggle('low',!!g.opt.low)}
 restart(){const p=this.pl,sp2=this.spawn;p.reset(sp2.x,sp2.z,sp2.h);this.cy=sp2.y;this.g.resume();this.g.popup('رجعنا لأول الكوبري')}
 mkCar(){const g=this.g,d=CARS[g.sel];if(this.pcar)this.scene.remove(this.pcar.g);
  const p=this.pl=new Vehicle(g.tuned(d));p.opt=g.opt;const sp2=this.spawn;p.reset(sp2.x,sp2.z,sp2.h);this.cy=sp2.y;
  this.pcar=S.makeCar(d,true);this.scene.add(this.pcar.g);this.ch=p.h;this.bump=0}
 build(){const g=this.g,w=g.world,sc3=this.scene=new T.Scene();
  sc3.background=new T.Color(0x070b16);sc3.fog=new T.FogExp2(col(0x070b16),.0006);
  this.hemi=new T.HemisphereLight(col(0x7f94c8),col(0x1e2028),.7);sc3.add(this.hemi);
  this.moon=new T.DirectionalLight(col(0xa8bce8),.75);this.moon.castShadow=true;{const s=this.moon.shadow;s.mapSize.set(1024,1024);Object.assign(s.camera,{left:-55,right:55,top:55,bottom:-55,near:1,far:400});s.camera.updateProjectionMatrix();s.bias=-.0005;s.normalBias=.05}sc3.add(this.moon,this.moon.target);
  const gnd=new T.Mesh(new T.PlaneGeometry(24000,24000),new T.MeshStandardMaterial({color:col(0x24231f),roughness:1}));gnd.rotation.x=-Math.PI/2;gnd.position.set(-2800,-.03,2600);gnd.receiveShadow=true;sc3.add(gnd);
  // decode ways to meter polylines with deck heights
  const ways=[];let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;
  for(const w2 of this.data.w){const f=w2[4],n=f.length/2,pts=[];const H=w2[1]?Math.max(1,w2[2])*LH:0;
   let L=0;const seg=[];for(let i=0;i<n;i++){const x=f[2*i]/10,z=f[2*i+1]/10;pts.push([x,z]);if(i)L+=Math.hypot(x-pts[i-1][0],z-pts[i-1][1]);seg.push(L)}
   for(let i=0;i<n;i++){const t=L?seg[i]/L:0,r=t<.5?Math.min(1,t/.12):Math.min(1,(1-t)/.12),s=r*r*(3-2*r);pts[i][2]=w2[1]?Math.max(.06,H*s):.06}
   ways.push({c:w2[0],b:w2[1],p:pts});for(const q of pts){if(q[0]<bx0)bx0=q[0];if(q[0]>bx1)bx1=q[0];if(q[1]<bz0)bz0=q[1];if(q[1]>bz1)bz1=q[1]}}
  this.ways=ways;this.bounds={x0:bx0-40,x1:bx1+40,z0:bz0-40,z1:bz1+40};
  // merged road ribbons (one mesh) + center dashes (one mesh) + parapets/piers (one mesh + instanced)
  const rp=[],rn=[],rc=[],ri=[],dp=[],dn=[],du=[],dc=[],di=[];
  const quad=(P,N,C,I2,a,b,c2,d2,n2,t2)=>{const k=P.length/3;P.push(a[0],a[1],a[2],b[0],b[1],b[2],c2[0],c2[1],c2[2],d2[0],d2[1],d2[2]);for(let q2=0;q2<4;q2++){N.push(n2[0],n2[1],n2[2]);C.push(t2[0],t2[1],t2[2])}I2.push(k,k+2,k+1,k,k+3,k+2)};
  for(const w2 of ways){const p=w2.p,hw=W2[w2.c],t2=TINT[w2.c];
   for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.01)continue;const nx=-dz/L,nz=dx/L,y0=a[2]||.06,y1=b[2]||.06;
    quad(rp,rn,rc,ri,[a[0]+nx*hw,y0,a[1]+nz*hw],[a[0]-nx*hw,y0,a[1]-nz*hw],[b[0]-nx*hw,y1,b[1]-nz*hw],[b[0]+nx*hw,y1,b[1]+nz*hw],[0,1,0],t2);
    if(w2.c<=2){const lw=.14;dp.push(a[0]+nx*lw,(y0+.02),a[1]+nz*lw,a[0]-nx*lw,(y0+.02),a[1]-nz*lw,b[0]-nx*lw,(y1+.02),b[1]-nz*lw,b[0]+nx*lw,(y1+.02),b[1]+nz*lw);for(let q2=0;q2<4;q2++){dn.push(0,1,0);dc.push(.5,.48,.4)}const k=dp.length/3-4;du.push(0,0,1,0,1,1,0,1);di.push(k,k+2,k+1,k,k+3,k+2)}
    if(w2.b){const ph=1.1;for(const s of[-1,1])quad(rp,rn,rc,ri,[a[0]+nx*hw*s,y0,a[1]+nz*hw*s],[a[0]+nx*(hw+.5)*s,y0,a[1]+nz*(hw+.5)*s],[b[0]+nx*(hw+.5)*s,y1,b[1]+nz*(hw+.5)*s],[b[0]+nx*hw*s,y1,b[1]+nz*hw*s],[0,1,0],[.16,.15,.14]),
     quad(rp,rn,rc,ri,[a[0]+nx*hw*s,y0+ph,a[1]+nz*hw*s],[b[0]+nx*hw*s,y1+ph,b[1]+nz*hw*s],[b[0]+nx*hw*s,y1,b[1]+nz*hw*s],[a[0]+nx*hw*s,y0,a[1]+nz*hw*s],[-nx*s,0,-nz*s],[.18,.17,.16])}}}
  const mk=(P,N,C,I2,uv,U2,mat)=>{const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(P,3));gg.setAttribute('normal',new T.Float32BufferAttribute(N,3));gg.setAttribute('color',new T.Float32BufferAttribute(C,3));if(uv)gg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));gg.setIndex(I2);return new T.Mesh(gg,mat)};
  const rm=mk(rp,rn,rc,ri,null,null,new T.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.05,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));rm.receiveShadow=true;sc3.add(rm);this.roadM=rm.material;
  if(dp.length)sc3.add(mk(dp,dn,dc,di,du,null,new T.MeshBasicMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));
  // piers under bridge decks
  const prs=[];for(const w2 of ways){if(!w2.b)continue;const p=w2.p;let acc=0;
   for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);let d2=35-acc;
    while(d2<L){const t=d2/L,y=a[2]+(b[2]-a[2])*t;if(y>3)prs.push([a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t]);d2+=35}acc=(acc+L)%35}}
  const pi=new T.InstancedMesh(new T.BoxGeometry(3,1,3),new T.MeshStandardMaterial({color:col(0x55534e),roughness:.95}),prs.length),o=new T.Object3D();
  prs.forEach((q2,i)=>{o.position.set(q2[0],q2[1]/2,q2[2]);o.scale.set(1,q2[1],1);o.updateMatrix();pi.setMatrixAt(i,o.matrix)});sc3.add(pi);
  // spatial hash for onRoad + deck height
  const CS=25,hash=new Map(),key=(x,z)=>Math.floor(x/CS)+','+Math.floor(z/CS);
  ways.forEach((w2,wi2)=>{const p=w2.p;for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];
   for(let cx=Math.floor(Math.min(a[0],b[0])/CS);cx<=Math.floor(Math.max(a[0],b[0])/CS);cx++)for(let cz=Math.floor(Math.min(a[1],b[1])/CS);cz<=Math.floor(Math.max(a[1],b[1])/CS);cz++){const k=cx+','+cz;if(!hash.has(k))hash.set(k,[]);hash.get(k).push([wi2,i])}}});
  this.hash=hash;
  this.query=(x,z)=>{let best=null;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const L2=this.hash.get(Math.floor(x/CS+dx)+','+Math.floor(z/CS+dz));if(!L2)continue;
   for(const q2 of L2){const w2=ways[q2[0]],p=w2.p,a=p[q2[1]],b=p[q2[1]+1],abx=b[0]-a[0],abz=b[1]-a[1],ll=abx*abx+abz*abz;if(ll<.001)continue;let t=((x-a[0])*abx+(z-a[1])*abz)/ll;t=cl(t,0,1);
    const px=a[0]+abx*t,pz=a[1]+abz*t,d=Math.hypot(x-px,z-pz),hw=W2[w2.c],y=(a[2]||.06)+((b[2]||.06)-(a[2]||.06))*t;
    if(!best||d<best.d)best={d,y,hw,b:w2.b}}}return best};
  // v45: night-city look - buildings with lit windows, street lamps, sky, skyline, signals, pyramids
  const rnd=(s2=>()=>{s2|=0;s2=s2+0x6D2B79F5|0;let t=Math.imul(s2^s2>>>15,1|s2);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(77);
  const PYX=-9230,PYZ=8932;
  {const bpos=[],occ=new Set();
   for(const w2 of ways){const p=w2.p,hw=W2[w2.c];
    for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<14)continue;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,nx=-dz,nz=dx;
     for(let d=10;d<L;d+=42){const t=d/L,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
      for(const sd of[-1,1]){if(rnd()<.66)continue;
       const dep=10+rnd()*13,w3=10+rnd()*15,off=hw+6+dep/2+rnd()*5,bx=x+nx*off*sd,bz=z+nz*off*sd;
       const core=Math.hypot(bx+300,bz-1600)<2300,pyr=Math.hypot(bx-PYX,bz-PYZ)<1300;
       if(!core&&!pyr)continue;if(pyr&&rnd()<.55)continue;
       const key=Math.floor(bx/26)+','+Math.floor(bz/26);if(occ.has(key))continue;
       const u=this.query(bx,bz);if(u&&u.d<8)continue;
       occ.add(key);const h=pyr?6+rnd()*10:10+rnd()*(rnd()<.12?55:26);
       bpos.push([bx,h,bz,w3,dep,Math.atan2(dx,dz),.42+rnd()*.32])}}}}
   if(bpos.length){const wtx=S.winTex(),bm=new T.MeshStandardMaterial({map:wtx.map,emissiveMap:wtx.em,emissive:0xffffff,emissiveIntensity:1.1,vertexColors:true,roughness:.85});
    const bs=new T.InstancedMesh(new T.BoxGeometry(1,1,1),bm,bpos.length),o2=new T.Object3D(),cc=new T.Color();
    bpos.forEach((b2,k)=>{o2.position.set(b2[0],b2[1]/2,b2[2]);o2.rotation.set(0,b2[5],0);o2.scale.set(b2[3],b2[1],b2[4]);o2.updateMatrix();bs.setMatrixAt(k,o2.matrix);cc.setRGB(b2[6],b2[6]*.97,b2[6]*.9);bs.setColorAt(k,cc)});
    o2.rotation.set(0,0,0);o2.scale.set(1,1,1);bs.receiveShadow=true;sc3.add(bs);this.nBld=bpos.length}}
  {const lp=[];
   for(const w2 of ways){if(w2.c>2)continue;const p=w2.p,hw=W2[w2.c];let side=1;
    for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<20)continue;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,nx=-dz,nz=dx;
     for(let d=27;d<L;d+=340){side=-side;if(rnd()<.75)continue;const t=d/L,y=(a[2]||.06)+((b[2]||.06)-(a[2]||.06))*t;
      lp.push([a[0]+(b[0]-a[0])*t+nx*(hw+1.2)*side,y,a[1]+(b[1]-a[1])*t+nz*(hw+1.2)*side,side,nx,nz])}}}
   if(lp.length){const o2=new T.Object3D();
    const pm2=new T.InstancedMesh(new T.CylinderGeometry(.09,.13,7.5,4),new T.MeshStandardMaterial({color:col(0x4a4e55),metalness:.5,roughness:.6}),lp.length);
    const hm2=new T.InstancedMesh(new T.BoxGeometry(.5,.12,1.3),new T.MeshBasicMaterial({color:0xffd6a0}),lp.length);
    const gm2=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:S.glowTex(),transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.65,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),lp.length);
    lp.forEach((q2,k)=>{o2.rotation.set(0,0,0);o2.scale.set(1,1,1);o2.position.set(q2[0],q2[1]+3.75,q2[2]);o2.updateMatrix();pm2.setMatrixAt(k,o2.matrix);
     o2.position.set(q2[0]-q2[4]*1.2*q2[3],q2[1]+7.4,q2[2]-q2[5]*1.2*q2[3]);o2.updateMatrix();hm2.setMatrixAt(k,o2.matrix);
     o2.position.set(q2[0]-q2[4]*1.8*q2[3],q2[1]+.12,q2[2]-q2[5]*1.8*q2[3]);o2.rotation.set(-Math.PI/2,0,0);o2.scale.set(15,15,1);o2.updateMatrix();gm2.setMatrixAt(k,o2.matrix)});
    o2.rotation.set(0,0,0);o2.scale.set(1,1,1);sc3.add(pm2,hm2,gm2);this.nLamp=lp.length}}
  {const N2=750,pa=new Float32Array(N2*3);for(let q=0;q<N2;q++){const th=rnd()*6.283,ph=rnd()*.45+.05,r=8000;pa[q*3]=-2800+r*Math.cos(th)*Math.cos(ph);pa[q*3+1]=r*Math.sin(ph);pa[q*3+2]=2600+r*Math.sin(th)*Math.cos(ph)}
   const gg2=new T.BufferGeometry();gg2.setAttribute('position',new T.BufferAttribute(pa,3));
   const st=new T.Points(gg2,new T.PointsMaterial({color:0xafc4ee,size:2.4,sizeAttenuation:false,transparent:true,opacity:.8,fog:false,depthWrite:false}));st.frustumCulled=false;sc3.add(st);
   const spr=new T.Sprite(new T.SpriteMaterial({map:S.glowTex(),color:0xbfd4ff,fog:false,depthWrite:false}));spr.scale.set(1600,1600,1);spr.position.set(5200,3800,-4200);sc3.add(spr)}
  {const N3=120,o2=new T.Object3D(),cc=new T.Color(),sm=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({vertexColors:true,roughness:.95}),N3);
   for(let k=0;k<N3;k++){const th=k/N3*6.283+rnd()*.2,r=1400+rnd()*800,h=45+rnd()*130,w3=25+rnd()*45;
    o2.position.set(Math.cos(th)*r,h/2,1600+Math.sin(th)*r);o2.rotation.set(0,rnd()*3,0);o2.scale.set(w3,h,w3);o2.updateMatrix();sm.setMatrixAt(k,o2.matrix);
    cc.setRGB(.05+rnd()*.04,.06+rnd()*.04,.09+rnd()*.05);sm.setColorAt(k,cc)}
   o2.rotation.set(0,0,0);o2.scale.set(1,1,1);sc3.add(sm)}
  if(this.data.tl&&this.data.tl.length){const tl=this.data.tl.filter(q2=>{const u=this.query(q2[0]+6,q2[1]+6);return u&&u.d<30&&u.y<2});
   if(tl.length){const o2=new T.Object3D(),cc=new T.Color();
    const pm3=new T.InstancedMesh(new T.CylinderGeometry(.08,.11,4.6,5),new T.MeshStandardMaterial({color:col(0x3c4046),metalness:.5,roughness:.6}),tl.length);
    const lm3=this.tlL=new T.InstancedMesh(new T.SphereGeometry(.22,8,6),new T.MeshBasicMaterial({color:0xffffff,fog:false}),tl.length);
    tl.forEach((q2,k)=>{o2.position.set(q2[0]+6,2.3,q2[1]+6);o2.updateMatrix();pm3.setMatrixAt(k,o2.matrix);
     o2.position.set(q2[0]+6,4.8,q2[1]+6);o2.updateMatrix();lm3.setMatrixAt(k,o2.matrix);lm3.setColorAt(k,cc.set(k%2?0xff3226:0x2fe06a))});
    this.tlN=tl.length;this.sig=tl;sc3.add(pm3,lm3)}}
  {const m2=new T.MeshStandardMaterial({color:col(0xcaa877),roughness:.9,emissive:col(0x4a3a20),emissiveIntensity:1.1});
   const pg=new T.Mesh(new T.PlaneGeometry(1100,1100),new T.MeshBasicMaterial({map:S.glowTex(),color:0xffc98a,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.4,fog:false}));pg.rotation.x=-Math.PI/2;pg.position.set(PYX+160,.4,PYZ+10);sc3.add(pg);
   for(const q2 of[[0,0,115,139],[215,-60,105,136],[430,90,52,65]]){const py=new T.Mesh(new T.ConeGeometry(q2[2],q2[3],4),m2);py.position.set(PYX+q2[0],q2[3]/2,PYZ+q2[1]);py.rotation.y=Math.PI/4;sc3.add(py)}}

  // the Nile: wide dark ribbons along water polylines
  const wp=[],wn=[],wc=[],wi=[];
  for(const pl of this.data.n){for(let i=0;i<pl.length/2-1;i++){const a=[pl[2*i]/10,pl[2*i+1]/10],b=[pl[2*i+2]/10,pl[2*i+3]/10],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.01)continue;const nx=-dz/L,nz=dx/L,hw=170;
   quad(wp,wn,wc,wi,[a[0]+nx*hw,.02,a[1]+nz*hw],[a[0]-nx*hw,.02,a[1]-nz*hw],[b[0]-nx*hw,.02,b[1]-nz*hw],[b[0]+nx*hw,.02,b[1]+nz*hw],[0,1,0],[.05,.14,.24])}}
  if(wp.length){const wm=mk(wp,wn,wc,wi,null,null,new T.MeshStandardMaterial({vertexColors:true,roughness:.08,metalness:.6,emissive:col(0x12395c),emissiveIntensity:1.35}));sc3.add(wm)}
  // Cairo Tower at its real coordinates
  const tw=this.data.lm.find(l=>l[0]==='برج القاهرة');
  if(tw){const tg=new T.Group(),m1=new T.MeshStandardMaterial({color:col(0xb9b4a8),roughness:.7,emissive:col(0x2a2b33),emissiveIntensity:.5});
   const t1=new T.Mesh(new T.CylinderGeometry(6,9,90,14),m1);t1.position.y=45;const t2=new T.Mesh(new T.CylinderGeometry(13,7,14,14),new T.MeshStandardMaterial({color:col(0xa9a398),emissive:col(0xffd890),emissiveIntensity:.9}));t2.position.y=95;
   const t3=new T.Mesh(new T.CylinderGeometry(1.2,2.5,16,8),m1);t3.position.y=110;const bc=new T.Mesh(new T.SphereGeometry(1.6,8,6),new T.MeshBasicMaterial({color:0xff3040,fog:false}));bc.position.y=119;tg.add(t1,t2,t3,bc);this.towerBc=bc;tg.position.set(tw[1],0,tw[2]);sc3.add(tg)}
  // spawn at the west end of the longest bridge way (6th October Bridge)
  let bw=null;for(const w2 of ways){if(!w2.b)continue;const cx=w2.p.reduce((a2,q2)=>a2+q2[0],0)/w2.p.length,cz=w2.p.reduce((a2,q2)=>a2+q2[1],0)/w2.p.length;if(Math.hypot(cx+300,cz-1600)>3400)continue;if(!bw||w2.p.length>bw.p.length)bw=w2}
  const si=Math.min(6,bw.p.length-2),sp0=bw.p[si],sp1=bw.p[si+1];const sq=this.query(sp0[0],sp0[1]);this.spawn={x:sp0[0],z:sp0[1],y:(sq?sq.y:sp0[2]||.06)+.02,h:Math.atan2(sp1[0]-sp0[0],sp1[1]-sp0[1])};
  this.trafficBuild();this.rushBuild();this.wxBuild();this.pedBuild();this.fareBuild();this.chainBuild();this.dealerBuild();this.areaBuild();this.svcBuild();this.shopBuild();this.feluBuild();this.mosqueBuild();this.sphinxBuild();this.msBuild();this.rdrBuild();
  // minimal HUD
  if(!$('realHud')){const h=document.createElement('div');h.id='realHud';h.hidden=true;h.style.cssText='position:fixed;inset:0;z-index:2;pointer-events:none;direction:rtl';
   h.innerHTML='<div style="position:absolute;top:calc(var(--sat) + 10px);left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:14px" class="glass"><small>طرق مصر - © OpenStreetMap contributors</small></div>'+
   '<div class="glass" style="position:absolute;left:50%;transform:translateX(-50%);bottom:calc(var(--sab) + 12px);padding:6px 18px;border-radius:16px;text-align:center"><b id="realSpd" style="font-size:28px">0</b> <small>كم/س</small></div>'
   +'<div class="glass" style="position:absolute;top:calc(var(--sat) + 10px);inset-inline-start:10px;padding:6px 14px;border-radius:14px"><small>💰 <b id="erMoney">0</b> جنيه</small></div>'
   +'<div class="glass" id="erFare" style="position:absolute;top:calc(var(--sat) + 10px);inset-inline-end:10px;padding:6px 14px;border-radius:14px"><small>دور على راكب يا كابتن</small></div>'
   +'<div class="glass" style="position:absolute;top:calc(var(--sat) + 48px);left:50%;transform:translateX(-50%);padding:3px 14px;border-radius:12px;display:none"><small id="erArea"></small></div>'
   +'<div class="glass" id="erMsnW" style="position:absolute;top:calc(var(--sat) + 48px);inset-inline-end:10px;padding:3px 14px;border-radius:12px;display:none"><small id="erMsn"></small></div>'
   +'<div class="glass" style="position:absolute;top:calc(var(--sat) + 86px);inset-inline-end:10px;padding:3px 14px;border-radius:12px;display:none"><small id="erRad"></small></div>'
   +'<div class="glass" id="erChainW" style="position:absolute;top:calc(var(--sat) + 124px);inset-inline-end:10px;padding:3px 14px;border-radius:12px;display:none"><small id="erChain"></small></div>'
   +'<canvas id="erMap" width="176" height="176" style="position:absolute;bottom:calc(var(--sab) + 12px);inset-inline-end:10px;border-radius:50%;opacity:.94"></canvas>'
   +'<div class="glass" style="position:absolute;top:calc(var(--sat) + 48px);inset-inline-start:10px;padding:3px 14px;border-radius:12px;display:none"><small id="erRush"></small></div>'
   +'<div class="glass" style="position:absolute;top:calc(var(--sat) + 86px);inset-inline-start:10px;padding:3px 14px;border-radius:12px;display:none"><small id="erRain">\u{1F327} \u0645\u0637\u0631</small></div>'
   +'<div class="glass" style="position:absolute;bottom:calc(var(--sab) + 64px);left:50%;transform:translateX(-50%);padding:3px 14px;border-radius:12px"><small id="erFuel">⛽ 100%</small></div>'
   +'<div class="glass" style="position:absolute;bottom:calc(var(--sab) + 64px);inset-inline-start:10px;padding:3px 14px;border-radius:12px;display:none"><small id="erBuff"></small></div>';
   document.body.appendChild(h)}
  this.mapBuild();this.built=true}
 // ---------- v63: kiosk / ahwa stops (tea, sugarcane juice, koshary buffs) ----------
 shopBuild(){this.buffTea=0;this.buffQasab=0;this.buffKosh=0;this.shopOpen=false;this.shT=0;
  const pw=this.pways;if(!pw||!pw.length)return;
  const names=['وسط البلد','الدقي','الهرم'];this.shop=[];
  for(const nm of names){const zn=(this.zones||[]).find(z=>z.n===nm);if(!zn||zn.nile)continue;
   let best=null,bd=1e9;for(const e of pw)for(const f of[.15,.3,.5,.7,.85]){const pos=this.posAt(e,e.L*f),d=Math.hypot(pos[0]-zn.x,pos[1]-zn.z);if(d<bd){bd=d;best={e,pos}}}
   if(!best)continue;const e=best.e,pos=best.pos,nx2=this.posAt(e,Math.min(e.L/2+4,e.L));
   let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const off=e.hw+2.6;
   this.shop.push({x:pos[0]-dz*off,z:pos[1]+dx*off,y:pos[2]||.06,h:Math.atan2(dx,dz),n:nm})}
  if(!this.shop.length){const e=pw[0],pos=this.posAt(e,e.L/2);this.shop.push({x:pos[0],z:pos[1],y:.06,h:0,n:'وسط البلد'})}
  const o2=new T.Object3D();
  const box=new T.InstancedMesh(new T.BoxGeometry(2.4,2.2,1.8),new T.MeshStandardMaterial({color:col(0x2a2016),roughness:.85}),this.shop.length),
   sgn=new T.InstancedMesh(new T.BoxGeometry(2.6,.7,.2),new T.MeshStandardMaterial({color:col(0x1a140c),emissive:col(0xc98a4b),emissiveIntensity:1.2}),this.shop.length);
  this.shop.forEach((s3,k)=>{o2.position.set(s3.x,s3.y+1.1,s3.z);o2.rotation.set(0,s3.h,0);o2.scale.set(1,1,1);o2.updateMatrix();box.setMatrixAt(k,o2.matrix);
   o2.position.set(s3.x,s3.y+2.6,s3.z);o2.updateMatrix();sgn.setMatrixAt(k,o2.matrix);
   const bcn=new T.Mesh(new T.CylinderGeometry(1.6,2,24,10,1,true),new T.MeshBasicMaterial({color:0xc98a4b,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false,fog:false}));bcn.position.set(s3.x,s3.y+12,s3.z);s3.bcn=bcn;this.scene.add(bcn)});
  o2.rotation.set(0,0,0);this.scene.add(box,sgn);
  if(!$('shopP')){const dv=document.createElement('div');dv.id='shopP';dv.hidden=true;dv.style.cssText='position:fixed;left:50%;bottom:calc(var(--sab) + 76px);transform:translateX(-50%);z-index:3;direction:rtl';
   dv.innerHTML='<div class="glass" style="padding:10px 16px;border-radius:18px;text-align:center;min-width:250px">'+
    '<b style="font-size:15px">كشك وقهوة ☕</b><div id="shpInfo" style="margin:6px 0;font-size:13px"></div>'+
    '<div style="display:flex;gap:8px;justify-content:center;pointer-events:auto">'+
    '<button class="btn tint" id="shpTea"></button><button class="btn tint" id="shpQas"></button><button class="btn tint" id="shpKosh"></button></div></div>';
   document.body.appendChild(dv);
   dv.querySelector('#shpTea').onclick=()=>this.shopAct('tea');dv.querySelector('#shpQas').onclick=()=>this.shopAct('qasab');dv.querySelector('#shpKosh').onclick=()=>this.shopAct('kosh')}}
 shopAct(kind){const g=this.g;
  const pay=c=>{if(g.coins<c){g.popup('فلوسك مش كفاية يا كابتن');return false}g.coins-=c;g.saveCoins();return true};
  if(kind==='tea'){if(this.buffTea>0)return g.popup('الشاي لسه شغال');if(!pay(10))return;this.buffTea=2;g.popup('شاي بالنعناع ☕ الأجرة الجاية واللي بعدها +15%');g.audio.coin()}
  else if(kind==='qasab'){if(this.buffQasab>0)return g.popup('القصب لسه في دمك');if(!pay(15))return;this.buffQasab=90;g.popup('عصير قصب 🎋 90 ثانية من غير غرامات رادار');g.audio.coin()}
  else{if(this.buffKosh>0)return g.popup('الكشري لسه ماسك');if(!pay(30))return;this.buffKosh=1;g.popup('كشري 🍲 أول خبطة مش هتكسر السلسلة');g.audio.coin()}
  this.shopShow()}
 shopShow(){const g=this.g;
  $('shpInfo').textContent='فلوسك '+g.coins+' ج';
  const b1=$('shpTea'),b2=$('shpQas'),b3=$('shpKosh');
  b1.textContent='شاي 10ج';b1.disabled=g.coins<10||this.buffTea>0;
  b2.textContent='قصب 15ج';b2.disabled=g.coins<15||this.buffQasab>0;
  b3.textContent='كشري 30ج';b3.disabled=g.coins<30||this.buffKosh>0;
  for(const b of[b1,b2,b3])b.style.opacity=b.disabled?.55:1}
 shopUpd(dt){const g=this.g,pl=this.pl;
  if(this.buffQasab>0)this.buffQasab=Math.max(0,this.buffQasab-dt);
  this.shT+=dt;if(this.shT>.5){this.shT=0;const e=$('erBuff');
   if(e){let tx='';if(this.buffTea>0)tx+='🍵×'+this.buffTea+' ';if(this.buffQasab>0)tx+='🎋 '+Math.ceil(this.buffQasab)+'ث ';if(this.buffKosh>0)tx+='🍲';
    e.textContent=tx.trim();e.parentElement.style.display=tx?'':'none'}}
  let best=null,bd=1e9;for(const s3 of this.shop){const d=Math.hypot(s3.x-pl.x,s3.z-pl.z);if(d<bd){bd=d;best=s3}}
  if(best&&best.bcn)best.bcn.material.opacity=.16+.1*Math.sin(g.t*2.6);
  if(!this.shopOpen&&bd<8&&pl.speed*3.6<8){this.shopOpen=true;g.keys={};this.shopShow();$('shopP').hidden=false;g.popup('كشك '+best.n+'.. اتفضل اطلب ☕')}
  else if(this.shopOpen&&bd>16){this.shopOpen=false;$('shopP').hidden=true}}
 // ---------- v62: photo mode (hide HUD, free orbit camera) ----------
 photoTg(){if(!this.on)return;const g=this.g,ph=this.photo||(this.photo={on:false,yaw:0,pitch:.38,dist:9});
  ph.on=!ph.on;
  if(ph.on){ph.yaw=this.ch+Math.PI;ph.pitch=.38;ph.dist=9;
   if(!$('erPhotoCss')){const st=document.createElement('style');st.id='erPhotoCss';st.textContent='#realHud,#svcP,#dealerP,#tuneP,#touch{display:none!important}';document.head.appendChild(st)}
   g.keys={};g.popup('وضع التصوير 📸 الأسهم تلف بالكاميرا، Q/E زوم، V ترجع')}
  else{const st=$('erPhotoCss');if(st)st.remove();g.popup('رجعنا للقيادة')}}
 photoUpd(dt){const ph=this.photo,k=this.g.keys;
  ph.yaw+=((k.right?1:0)-(k.left?1:0))*dt*1.9;
  ph.pitch=cl(ph.pitch+((k.up?1:0)-(k.down?1:0))*dt*1.1,.06,1.35);
  this.g.keys={}}
 // ---------- v61: service stops (fuel / wash / repair) ----------
 svcBuild(){const pw=this.pways;if(!pw||!pw.length)return;
  this.fuel=parseFloat(localStorage.getItem('er_fuel')||'100');if(isNaN(this.fuel))this.fuel=100;this.fuelWarn=false;this.svcOpen=false;this.svT=0;
  const names=['الزمالك','المهندسين','الجيزة'];this.svc=[];
  for(const nm of names){const zn=(this.zones||[]).find(z=>z.n===nm);if(!zn||zn.nile)continue;
   let best=null,bd=1e9;for(const e of pw)for(const f of[.15,.3,.5,.7,.85]){const pos=this.posAt(e,e.L*f),d=Math.hypot(pos[0]-zn.x,pos[1]-zn.z);if(d<bd){bd=d;best={e,pos}}}
   if(!best||bd>900)continue;const e=best.e,pos=best.pos,nx2=this.posAt(e,Math.min(e.L/2+4,e.L));
   let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const off=e.hw+3.4;
   this.svc.push({x:pos[0]-dz*off,z:pos[1]+dx*off,y:pos[2]||.06,h:Math.atan2(dx,dz),n:nm})}
  if(!this.svc.length){const e=pw[0],pos=this.posAt(e,e.L/2);this.svc.push({x:pos[0],z:pos[1],y:.06,h:0,n:'وسط البلد'})}
  const o2=new T.Object3D();
  const roof=new T.InstancedMesh(new T.BoxGeometry(9,.4,6),new T.MeshStandardMaterial({color:col(0x1a1f2c),roughness:.7}),this.svc.length),
   tot=new T.InstancedMesh(new T.BoxGeometry(1.1,3.4,.3),new T.MeshStandardMaterial({color:col(0x141824),emissive:col(0xff9f43),emissiveIntensity:1.1}),this.svc.length);
  this.svc.forEach((s3,k)=>{o2.position.set(s3.x,s3.y+3.6,s3.z);o2.rotation.set(0,s3.h,0);o2.scale.set(1,1,1);o2.updateMatrix();roof.setMatrixAt(k,o2.matrix);
   o2.position.set(s3.x,s3.y+1.7,s3.z);o2.updateMatrix();tot.setMatrixAt(k,o2.matrix);
   const bcn=new T.Mesh(new T.CylinderGeometry(2,2.4,26,10,1,true),new T.MeshBasicMaterial({color:0xff9f43,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false,fog:false}));bcn.position.set(s3.x,s3.y+13,s3.z);s3.bcn=bcn;this.scene.add(bcn)});
  o2.rotation.set(0,0,0);this.scene.add(roof,tot);
  if(!$('svcP')){const dv=document.createElement('div');dv.id='svcP';dv.hidden=true;dv.style.cssText='position:fixed;left:50%;bottom:calc(var(--sab) + 76px);transform:translateX(-50%);z-index:3;direction:rtl';
   dv.innerHTML='<div class="glass" style="padding:10px 16px;border-radius:18px;text-align:center;min-width:250px">'+
    '<b style="font-size:15px">محطة خدمة ⛽</b><div id="svcInfo" style="margin:6px 0;font-size:13px"></div>'+
    '<div style="display:flex;gap:8px;justify-content:center;pointer-events:auto">'+
    '<button class="btn tint" id="svcFuel"></button><button class="btn tint" id="svcWash"></button><button class="btn tint" id="svcFix"></button></div></div>';
   document.body.appendChild(dv);
   dv.querySelector('#svcFuel').onclick=()=>this.svcAct('fuel');dv.querySelector('#svcWash').onclick=()=>this.svcAct('wash');dv.querySelector('#svcFix').onclick=()=>this.svcAct('fix')}}
 svcAct(kind){const g=this.g,p=this.pl,fx=this.fx;
  if(kind==='fuel'){const need=Math.ceil(100-this.fuel),cost=need*3;if(need<2)return;if(g.coins<cost)return g.popup('فلوسك مش كفاية للتفويلة');
   g.coins-=cost;this.fuel=100;this.fuelWarn=false;g.saveCoins();g.popup('التنك مليان.. بالهنا ⛽');g.audio.coin()}
  else if(kind==='wash'){if(g.coins<25)return g.popup('الغسيل بـ 25 جنيه');g.coins-=25;g.saveCoins();if(fx)fx.tip=true;g.popup('العربية بقت تلمع ✨ الراكب الجاي هيبقّش');g.audio.flash()}
  else{const d=Math.ceil(p.dmg),cost=d*2;if(d<1)return g.popup('العربية سليمة');if(g.coins<cost)return g.popup('فلوسك مش كفاية للتصليح');g.coins-=cost;p.dmg=0;g.saveCoins();g.popup('اتظبطت.. زيرو عطل 🔧');g.audio.unlock()}
  this.svcShow()}
 svcShow(){const g=this.g,p=this.pl,need=Math.ceil(100-this.fuel),fc=need*3,dm=Math.ceil(p.dmg);
  $('svcInfo').textContent='⛽ '+Math.round(this.fuel)+'% · العطل '+dm+'% · فلوسك '+g.coins+' ج';
  const b1=$('svcFuel'),b2=$('svcWash'),b3=$('svcFix');
  b1.textContent='املأ التنك '+fc+'ج';b1.disabled=need<2||g.coins<fc;
  b2.textContent='غسيل 25ج';b2.disabled=g.coins<25;
  b3.textContent='تصليح '+(dm*2)+'ج';b3.disabled=dm<1||g.coins<dm*2;
  for(const b of[b1,b2,b3])b.style.opacity=b.disabled?.55:1}
 svcUpd(dt){const g=this.g,pl=this.pl;
  this.fuel=Math.max(0,this.fuel-pl.speed*dt*.004);
  if(this.fuel<15&&!this.fuelWarn){this.fuelWarn=true;g.popup('البنزين قرب يخلص.. روح أقرب محطة ⛽')}
  if(this.fuel>=30)this.fuelWarn=false;
  this.svT+=dt;if(this.svT>.5){this.svT=0;const e=$('erFuel');if(e){e.textContent='⛽ '+Math.round(this.fuel)+'%';e.parentElement.style.borderColor=this.fuel<15?'#ff5a4e':''}
   try{localStorage.setItem('er_fuel',String(Math.round(this.fuel)))}catch(e2){}}
  let best=null,bd=1e9;for(const s3 of this.svc){const d=Math.hypot(s3.x-pl.x,s3.z-pl.z);if(d<bd){bd=d;best=s3}}
  if(best&&best.bcn)best.bcn.material.opacity=.16+.1*Math.sin(g.t*2.6);
  if(!this.svcOpen&&bd<9&&pl.speed*3.6<8){this.svcOpen=true;g.keys={};this.svcShow();$('svcP').hidden=false;g.popup('محطة '+best.n+'.. ارتاح ثانية')}
  else if(this.svcOpen&&bd>18){this.svcOpen=false;$('svcP').hidden=true}}
 // ---------- v60: night rain + wet roads ----------
 wxBuild(){const N=this.low?350:800,pos=new Float32Array(N*6);
  for(let i=0;i<N;i++){const x=(Math.random()-.5)*110,y=Math.random()*28,z=(Math.random()-.5)*110;
   pos.set([x,y,z,x+.32,y-1.35,z+.14],i*6)}
  const g2=new T.BufferGeometry();g2.setAttribute('position',new T.BufferAttribute(pos,3));
  const ln=this.wxL=new T.LineSegments(g2,new T.LineBasicMaterial({color:0x9db8dd,transparent:true,opacity:.32,fog:false,depthWrite:false}));
  ln.frustumCulled=false;ln.visible=false;this.scene.add(ln);
  this.wx={n:N,pos,on:false,forced:null,f:0}}
 wxUpd(dt){const g=this.g,wx=this.wx,auto=((g.t+270)%390)<130,on=wx.forced===null?auto:wx.forced;
  if(on!==wx.on){wx.on=on;this.wxL.visible=on;
   if(this.roadM){this.roadM.roughness=on?.42:.85;this.roadM.metalness=on?.5:.05;this.roadM.needsUpdate=true}
   const e=$('erRain');if(e)e.parentElement.style.display=on?'':'none';
   if(on)g.popup('\u0627\u0644\u062F\u0646\u064A\u0627 \u0628\u062A\u0645\u0637\u0631.. \u0633\u0648\u0642 \u0628\u0631\u0627\u062D\u0629 \u064A\u0627 \u0643\u0627\u0628\u062A\u0646 \u{1F327}')}
  if(!on)return;wx.f^=1;if(this.low&&wx.f)return;
  const p=this.pl,pos=wx.pos,n=wx.n,vy=26*dt,vx=1.9*dt,vz=.8*dt;
  for(let i=0;i<n;i++){const j=i*6;let x=pos[j]+vx,y=pos[j+1]-vy,z=pos[j+2]+vz;
   let dx=x-p.x,dz=z-p.z;
   if(y<0||dx*dx+dz*dz>4900){x=p.x+(Math.random()-.5)*110;z=p.z+(Math.random()-.5)*110;y=22+Math.random()*8}
   pos[j]=x;pos[j+1]=y;pos[j+2]=z;pos[j+3]=x+.32;pos[j+4]=y-1.35;pos[j+5]=z+.14}
  this.wxL.geometry.attributes.position.needsUpdate=true}
 // ---------- v59: rush-hour traffic jams ----------
 rushBuild(){this.rushOn=false;
  let cands=this.tways.filter(e2=>e2.L>700&&(W2[e2.w.c]||3)>=7);if(!cands.length)cands=this.tways.filter(e2=>e2.L>500);
  for(let i=0;i<Math.min(3,cands.length);i++){const e2=cands[Math.floor((i+.5)*cands.length/3)];if(e2&&e2.jam===undefined)e2.jam=e2.L*(.3+Math.random()*.4)}}
 rushUpd(dt){const g=this.g,rt=(g.t+310)%420,on=rt<110,e0=$('erRush');
  if(on===this.rushOn){if(e0&&on)e0.textContent='\u{1F6A6} \u0632\u062D\u0645\u0629 \u062F\u0644\u0648\u0642\u062A\u064A.. \u0627\u0644\u0623\u062C\u0631\u0629 ×1.5';return}
  this.rushOn=on;const N0=this.agBase||14,CAP=this.ag.length;
  if(on){for(let k=0;k<CAP;k++){const a=this.ag[k];if(!a.on){a.on=true;a.hid=0;a.cruise=this.trnd(7,11);this.agPlace(a,k,120)}}
   g.popup('\u0633\u0627\u0639\u0629 \u0627\u0644\u0630\u0631\u0648\u0629.. \u0632\u062D\u0645\u0629 \u0641\u064A \u0643\u0644 \u062D\u062A\u0629\u060C \u0628\u0633 \u0627\u0644\u0623\u062C\u0631\u0629 ×1.5 \u{1F6A6}');g.audio.flash()}
  else{for(let k=N0;k<CAP;k++){const a=this.ag[k];a.on=false;a.hid=0}g.popup('\u0627\u0644\u0632\u062D\u0645\u0629 \u0641\u0643\u062A.. \u0627\u0644\u0633\u0643\u0629 \u0633\u0647\u0644\u0629 \u062A\u0627\u0646\u064A')}
  if(e0){e0.parentElement.style.display=on?'':'none';if(on)e0.textContent='\u{1F6A6} \u0632\u062D\u0645\u0629 \u062F\u0644\u0648\u0642\u062A\u064A.. \u0627\u0644\u0623\u062C\u0631\u0629 ×1.5'}}
 // ---------- v58: minimap / GPS ----------
 mapBuild(){this.mapZs=[250,450,900];this.mapZi=1;this.mapR=450;this.mapAcc=1;
  const cv=$('erMap');if(!cv)return;this.map={cv,ctx:cv.getContext('2d')}}
 mapUpd(dt){this.mapAcc+=dt;if(this.mapAcc<(this.low?.2:.11))return;this.mapAcc=0;this.mapDraw()}
 mapDraw(){const ctx=this.map.ctx,C=88,R=this.mapR,k=C/R,pl=this.pl,h=pl.h,ch=Math.cos(h),sh=Math.sin(h);
  ctx.clearRect(0,0,176,176);ctx.save();ctx.beginPath();ctx.arc(C,C,C-1,0,6.2832);ctx.clip();
  ctx.fillStyle='rgba(8,12,26,.84)';ctx.fillRect(0,0,176,176);
  const RR=(R+90)*(R+90),X=(x,z)=>C+((x-pl.x)*ch-(z-pl.z)*sh)*k,Y=(x,z)=>C-((x-pl.x)*sh+(z-pl.z)*ch)*k;
  ctx.lineCap='round';const maj=new Path2D(),min=new Path2D();
  for(const w2 of this.ways){const p=w2.p,pa=W2[w2.c]>=6?maj:min;let pen=false;
   for(let i=0;i<p.length;i++){const dx=p[i][0]-pl.x,dz=p[i][1]-pl.z;if(dx*dx+dz*dz<RR){const X2=X(p[i][0],p[i][1]),Y2=Y(p[i][0],p[i][1]);if(pen)pa.lineTo(X2,Y2);else pa.moveTo(X2,Y2);pen=true}else pen=false}}
  ctx.strokeStyle='rgba(92,102,138,.55)';ctx.lineWidth=1.2;ctx.stroke(min);
  ctx.strokeStyle='rgba(158,178,220,.8)';ctx.lineWidth=2.3;ctx.stroke(maj);
  const np=new Path2D();for(const pl2 of this.data.n){let pen=false;for(let i=0;i<pl2.length/2;i++){const x=pl2[2*i]/10,z=pl2[2*i+1]/10,dx=x-pl.x,dz=z-pl.z;if(dx*dx+dz*dz<RR){const X2=X(x,z),Y2=Y(x,z);if(pen)np.lineTo(X2,Y2);else np.moveTo(X2,Y2);pen=true}else pen=false}}
  ctx.strokeStyle='rgba(44,116,196,.9)';ctx.lineWidth=4.5;ctx.stroke(np);
  const pin=(x,z,c2,r2)=>{let X2=X(x,z),Y2=Y(x,z);const ox=X2-C,oy=Y2-C,od=Math.hypot(ox,oy),mx=C-9;if(od>mx){X2=C+ox/od*mx;Y2=C+oy/od*mx}ctx.fillStyle=c2;ctx.beginPath();ctx.arc(X2,Y2,r2,0,6.2832);ctx.fill()};
  for(const r2 of this.rd){const dx=r2.x-pl.x,dz=r2.z-pl.z;if(dx*dx+dz*dz<RR)pin(r2.x,r2.z,'#ff5a4e',2.6)}
  const fx=this.fx;if(fx){if(fx.st===0)pin(fx.pax.x,fx.pax.z,'#35e08a',4);else if(fx.dst)pin(fx.dst.x,fx.dst.z,'#ffb02e',4.5)}
  if(this.ms&&this.ms.st===1)pin(this.ms.x,this.ms.z,'#c77dff',4);
  if(this.dlr)pin(this.dlr.x,this.dlr.z,'#7ec8ff',3.5);
  if(this.svc)for(const s3 of this.svc)pin(s3.x,s3.z,'#ff9f43',3);
  if(this.shop)for(const s3 of this.shop)pin(s3.x,s3.z,'#c98a4b',3);
  ctx.fillStyle='#ffd75e';ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(C,C-7);ctx.lineTo(C-4.6,C+5.4);ctx.lineTo(C+4.6,C+5.4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('\u0634',C+sh*(C-13),C+ch*(C-13)+3.5);
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='9px sans-serif';ctx.fillText(R+' \u0645',C,169);
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(C,C,C-1,0,6.2832);ctx.stroke()}
 // ---------- v46: ambient traffic on the real roads ----------
 posAt(e,s){const c=e.cum,p=e.w.p;let lo=0,hi=c.length-1;while(lo<hi-1){const m=(lo+hi)>>1;if(c[m]<=s)lo=m;else hi=m}const t=cl((s-c[lo])/((c[lo+1]-c[lo])||1e-6),0,1),a=p[lo],b=p[lo+1];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,((a[2]||.06)+((b[2]||.06)-(a[2]||.06))*t)]}
 trafficBuild(){const tw=[];for(const w2 of this.ways){if(w2.c>4)continue;let L=0;const cum=[0];for(let k=1;k<w2.p.length;k++){L+=Math.hypot(w2.p[k][0]-w2.p[k-1][0],w2.p[k][1]-w2.p[k-1][1]);cum.push(L)}if(L>150)tw.push({w:w2,L,cum})}
  this.tways=tw;if(!tw.length)return;const N=this.low?8:14,CAP=this.low?14:26;this.ag=[];this.agBase=N;this.agCap=CAP;const rnd2=(a,b)=>a+Math.random()*(b-a),pk=a2=>a2[Math.floor(Math.random()*a2.length)];this.trnd=rnd2;this.tpk=pk;
  const bg=new T.BoxGeometry(1.78,.62,4.15);bg.translate(0,.64,0);
  const cg=new T.BoxGeometry(1.56,.55,2.05);cg.translate(0,1.18,-.2);
  const tg2=new T.BoxGeometry(1.5,.15,.1);tg2.translate(0,.74,-2.06);
  const hg2=new T.BoxGeometry(1.5,.13,.1);hg2.translate(0,.66,2.06);
  const bm=this.agB=new T.InstancedMesh(bg,new T.MeshStandardMaterial({roughness:.5,metalness:.4}),CAP),
   cm=new T.InstancedMesh(cg,new T.MeshStandardMaterial({color:col(0x10131a),roughness:.35,metalness:.2}),CAP),
   tm=new T.InstancedMesh(tg2,new T.MeshBasicMaterial({color:0xff2a20,fog:false}),CAP),
   hm=new T.InstancedMesh(hg2,new T.MeshBasicMaterial({color:0xfff0c8,fog:false}),CAP);
  this.agM=[bm,cm,tm,hm];this.agO=new T.Object3D();this.scene.add(bm,cm,tm,hm);
  const cc=new T.Color();for(let k=0;k<CAP;k++){const a={v:0,cruise:rnd2(8,13),lane:2.4,x:0,z:0,y:.06,h:0,s:0,dir:1,e:tw[0],on:k<N,hid:0};this.ag.push(a);this.agPlace(a,k,60);bm.setColorAt(k,cc.setHex(pk([0x9da1a6,0xeeeeee,0x2a3140,0x7a1f1f,0x244a6a,0x6b6b60,0xb8b2a0,0xd8d8d0,0x1a1a1c])))}
  const dc=new T.Color(0x8f1a14);for(let k=0;k<CAP;k++)tm.setColorAt(k,dc);if(tm.instanceColor)tm.instanceColor.needsUpdate=true;if(bm.instanceColor)bm.instanceColor.needsUpdate=true;this.tlC=new T.Color()}
 agPlace(a,k,minD){const tw=this.tways,rnd2=this.trnd,pl=this.pl;
  for(let t=0;t<30;t++){const e=tw[Math.floor(Math.random()*tw.length)],s=rnd2(15,e.L-15),pos=this.posAt(e,s);
   if(pl&&Math.hypot(pos[0]-pl.x,pos[1]-pl.z)<minD)continue;let ok=true;for(const o of this.ag)if(o!==a&&o.e===e&&Math.abs(o.s-s)<18){ok=false;break}if(!ok)continue;
   a.e=e;a.s=s;a.dir=Math.random()<.5?1:-1;a.v=a.cruise*.7;return}
  a.e=tw[0];a.s=15;a.dir=1}
 agCont(a){const e=a.e,rnd2=this.trnd;let best=null,bd=15;for(const e2 of this.tways){if(e2===e)continue;
   for(const end of[[0,1],[e2.L,-1]]){const p=this.posAt(e2,end[0]==0?0:e2.L),d=Math.hypot(p[0]-a.x,p[1]-a.z);if(d<bd){const hd=Math.atan2(Math.sin(a.h)*end[1],Math.cos(a.h)*end[1]);if(Math.abs(wrap(hd-a.h))<1.4){best=[e2,end[1]];bd=d}}}}
  if(best){a.e=best[0];a.dir=best[1];a.s=best[1]>0?4:best[0].L-4}else a.dir=-a.dir}
 trafficUpd(dt){const pl=this.pl,o=this.agO,sig=this.sig,tp=this.tlP,tm=this.agM[2],ru=this.rushOn;
  if(this.fx&&this.fx.hitCd>0)this.fx.hitCd-=dt;
  for(let k=0;k<this.ag.length;k++){const a=this.ag[k],e=a.e;
   if(!a.on){if(!a.hid){a.hid=1;o.position.set(0,-60,0);o.scale.set(.001,.001,.001);o.updateMatrix();for(const m2 of this.agM)m2.setMatrixAt(k,o.matrix)}continue}
   const pos=this.posAt(e,a.s),nx2=this.posAt(e,cl(a.s+a.dir*4,0,e.L));let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const rx=-dz,rz=dx;
   let vt=a.cruise*(ru?.55:1);if(ru&&e.jam!==undefined){const dj=Math.abs(a.s-e.jam);if(dj<200)vt=Math.min(vt,a.cruise*(dj<50?.14:.4))}
   if(sig)for(let j=0;j<sig.length;j++){const q2=sig[j],sx=q2[0]+6-a.x,sz=q2[1]+6-a.z,f=sx*dx+sz*dz;if(f>0&&f<42){const l=sx*rx+sz*rz;if(Math.abs(l)<11&&((j%2===0)===tp))vt=Math.min(vt,Math.max(0,(f-7)*.8))}}
   const chk=(ox,oz)=>{const ddx=ox-a.x,ddz=oz-a.z,f=ddx*dx+ddz*dz,l=ddx*rx+ddz*rz;if(f>0&&f<15+a.v&&Math.abs(l)<2.5)vt=Math.min(vt,Math.max(0,(f-5.2)*.7))};
   chk(pl.x,pl.z);for(const o2 of this.ag)if(o2!==a&&o2.on)chk(o2.x,o2.z);
   if(vt<a.cruise*.55&&a.v<2.5){a.hk=(a.hk||0)-dt;if(a.hk<=0){a.hk=2.5+Math.random()*5;const dd=Math.hypot(a.x-pl.x,a.z-pl.z);if(dd<110)this.g.audio.honkAt(.09*(1-dd/110),.85+Math.random()*.4)}}else if(a.hk===undefined||a.hk<.15)a.hk=.15;
   a.v+=cl(vt-a.v,-9*dt,3*dt);a.s+=a.dir*a.v*dt;
   if(a.s>e.L-5||a.s<5){a.s=cl(a.s,4,e.L-4);const p2=this.posAt(e,a.s);a.x=p2[0];a.z=p2[1];a.h=Math.atan2(dx,dz);this.agCont(a)}
   const pp=this.posAt(e,a.s);a.x=pp[0]+rx*a.lane;a.z=pp[1]+rz*a.lane;a.y=pp[2];
   const th=Math.atan2(dx,dz);a.h+=wrap(th-a.h)*Math.min(1,5*dt);
   if(Math.hypot(a.x-pl.x,a.z-pl.z)>540){this.agPlace(a,k,170);
    const e3=a.e,p3=this.posAt(e3,a.s),n3=this.posAt(e3,cl(a.s+a.dir*4,0,e3.L));let hx=n3[0]-p3[0],hz=n3[1]-p3[1];const hl=Math.hypot(hx,hz)||1;hx/=hl;hz/=hl;
    a.x=p3[0]-hz*a.lane;a.z=p3[1]+hx*a.lane;a.y=p3[2];a.h=Math.atan2(hx,hz)}
   o.position.set(a.x,a.y+.03,a.z);o.rotation.set(0,a.h,0);o.scale.set(1,1,1);o.updateMatrix();
   tm.setColorAt(k,this.tlC.setHex(vt<a.v-1?0xff4535:0x8f1a14));
   for(const m of this.agM)m.setMatrixAt(k,o.matrix)}
  for(const m of this.agM)m.instanceMatrix.needsUpdate=true;
  if(tm.instanceColor)tm.instanceColor.needsUpdate=true;
  const p=pl,sn=Math.sin(p.h),cs=Math.cos(p.h);
  for(const a of this.ag){if(!a.on)continue;for(const o1 of[-1.2,1.2]){const px=p.x+sn*o1,pz=p.z+cs*o1,dx2=px-a.x,dz2=pz-a.z,d=Math.hypot(dx2,dz2);if(d<2.6&&d>.01){const nx=dx2/d,nz=dz2/d,ov=2.6-d;p.x+=nx*ov*.65;p.z+=nz*ov*.65;a.v*=.85;
   if(this.fx&&this.fx.hitCd<=0&&p.speed*3.6>15){this.fx.hits++;this.fx.hitCd=2;if(this.fx.streak>0){if(this.buffKosh>0){this.buffKosh--;this.g.popup('الكشري أنقذ السلسلة 🍲')}else{this.fx.streak=0;this.g.popup('خبطة! السلسلة اتكسرت')}}this.g.audio.thud()}const wv=p.wv(),vin=wv[0]*nx+wv[1]*nz;if(vin<0)p.setWv(wv[0]-1.2*vin*nx,wv[1]-1.2*vin*nz)}}}}
 // ---------- v51: pedestrians on the sidewalks ----------
 pedBuild(){const pw=[];for(const w2 of this.ways){if(w2.b||w2.c>4)continue;let L=0;const cum=[0];for(let k=1;k<w2.p.length;k++){L+=Math.hypot(w2.p[k][0]-w2.p[k-1][0],w2.p[k][1]-w2.p[k-1][1]);cum.push(L)}if(L>80)pw.push({w:w2,L,cum,hw:W2[w2.c]})}
  this.pways=pw;if(!pw.length)return;const N=this.low?6:12;this.pd=[];const rnd2=this.trnd,pk=this.tpk;
  const bg=new T.BoxGeometry(.36,1.02,.24);bg.translate(0,.56,0);
  const hg2=new T.BoxGeometry(.2,.24,.21);hg2.translate(0,1.2,0);
  const bm=this.pdB=new T.InstancedMesh(bg,new T.MeshStandardMaterial({roughness:.9,metalness:0}),N),
   hm=new T.InstancedMesh(hg2,new T.MeshStandardMaterial({color:col(0x8a6748),roughness:.85}),N);
  this.pdM=[bm,hm];this.pdO=new T.Object3D();this.scene.add(bm,hm);
  const cc=new T.Color(),pal=[0xd8d2c4,0xefe9dc,0x2c3140,0x3a3f4a,0x6b4a2f,0x7a1f1f,0x244a6a,0x4a5d3a,0xb8b2a0,0x1a1a1c,0xc9c2b2,0x54423a];
  for(let k=0;k<N;k++){const a={v:rnd2(1,1.7),side:Math.random()<.5?1:-1,ph:rnd2(0,6.3),scl:rnd2(.92,1.08),x:0,z:0,h:0,s:0,dir:1,e:pw[0]};this.pd.push(a);this.pedPlace(a,40,280);bm.setColorAt(k,cc.setHex(pk(pal)))}
  if(bm.instanceColor)bm.instanceColor.needsUpdate=true}
 pedPlace(a,minD,maxD){const pw=this.pways,rnd2=this.trnd,pl=this.pl;
  for(let t=0;t<40;t++){const e=pw[Math.floor(Math.random()*pw.length)],s=rnd2(8,e.L-8),pos=this.posAt(e,s);
   const d=pl?Math.hypot(pos[0]-pl.x,pos[1]-pl.z):0;if(d<minD||d>maxD)continue;
   a.e=e;a.s=s;a.dir=Math.random()<.5?1:-1;return}
  if(maxD<700)return this.pedPlace(a,minD,700);
  a.e=pw[0];a.s=10;a.dir=1}
 pedUpd(dt){const pl=this.pl,o=this.pdO,t=this.g.t;
  for(let k=0;k<this.pd.length;k++){const a=this.pd[k],e=a.e;
   a.s+=a.dir*a.v*dt;if(a.s>e.L-6||a.s<6){a.s=cl(a.s,6,e.L-6);a.dir=-a.dir;if(Math.random()<.4)a.side=-a.side}
   const pos=this.posAt(e,a.s),nx2=this.posAt(e,cl(a.s+a.dir*2,0,e.L));let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;
   const off=e.hw+1.4;a.x=pos[0]-dz*off*a.side;a.z=pos[1]+dx*off*a.side;a.h=Math.atan2(dx,dz);
   if(Math.hypot(a.x-pl.x,a.z-pl.z)>380){this.pedPlace(a,50,300)}
   const bob=Math.abs(Math.sin(t*7*a.v+a.ph))*.045,sway=Math.sin(t*7*a.v+a.ph)*.05;
   o.position.set(a.x,(pos[2]||.06)+bob,a.z);o.rotation.set(0,a.h,sway);o.scale.set(a.scl,a.scl,a.scl);o.updateMatrix();
   for(const m of this.pdM)m.setMatrixAt(k,o.matrix)}
  for(const m of this.pdM)m.instanceMatrix.needsUpdate=true}
 // ---------- v52: passengers, fares and money ----------
 fareBuild(){const pw=this.pways;if(!pw||!pw.length)return;
  const bg=new T.BoxGeometry(.36,1.02,.24);bg.translate(0,.56,0);
  const hg2=new T.BoxGeometry(.2,.24,.21);hg2.translate(0,1.2,0);
  const bm=new T.Mesh(bg,new T.MeshStandardMaterial({color:col(0xe8e2d2),roughness:.9,emissive:col(0x403a2c),emissiveIntensity:.35})),
   hm=new T.Mesh(hg2,new T.MeshStandardMaterial({color:col(0x8a6748),roughness:.85}));
  const grp=this.paxG=new T.Group();grp.add(bm,hm);this.scene.add(grp);
  const mk2=cc=>{const m2=new T.Mesh(new T.CylinderGeometry(1.2,1.5,26,10,1,true),new T.MeshBasicMaterial({color:cc,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false,fog:false}));m2.position.y=13;m2.visible=false;this.scene.add(m2);return m2};
  this.bcnP=mk2(0x35e08a);this.bcnD=mk2(0xffb02e);
  this.fx={st:0,pax:{x:0,z:0,y:.06,h:0},dst:null,fare:0,dname:'',rush:false,t:0,hits:0,hitCd:0,streak:0};
  this.dests=['الزمالك','المهندسين','كورنيش النيل','الدقي','وسط البلد','الجيزة','المعادي','مدينة نصر','مصر الجديدة','إمبابة','عين شمس','الهرم'];
  this.pUp=['عايز أروح D يا كابتن','لو سمحت يا أسطى، D','مشوار على D، متأخرش عليا','يلا بينا D يا معلم','D يا كابتن، وانت نجم'];
  this.pRu=['عجلة يا كابتن، ورايا معاد في D','يلا بسرعة يا أسطى، D ومتأخرش عليا','لو لحقتنا D بدري هزودلك الأجرة'];
  this.pDn=['كده تمام، اتفضل','ربنا يخليك يا كابتن','تسلم إيدك، وصلنا بالسلامة','ممنونك يا معلم'];
  this.pCh=['الجو حلو النهاردة بالليل والله','انت سايق من زمان يا كابتن؟','الزحمة بقت مش طبيعية في كل حتة','يا ريت كل السواقين هاديين زيك','الراديو شغال ولا عطلان؟','انا نازل أقضي مشوار وأرجع تاني','خد بالك من المطباط هنا','القاهرة بالليل ليها حنية تانية','انت عارف الطرق كويس، باين عليك'];
  this.pHit=['يا نهار أسود! خد بالك يا كابتن','هدى شوية يا أسطى، احنا مش في سباق','ربنا يستر.. الحمد لله عدت','متخفش، بس خد بالك بعد كده','يا ساتر! العربية سليمة؟','اهدى يا معلم، الروح غالية'];
  this.pSpd=['بسرعة كده ليه يا كابتن؟ اهدى','انت طيار ولا سواق؟','يا راجل ارحمنا، قلل السرعة','ده أنا حسيت إني بطير','السرعة دي تقلق والله','الرادار هياخدنا لو فضلنا كده'];
  this.pRain=['المطر نزل.. الطريق بقى صابون','خد بالك، الأرض بتزحلق في المطر','يا ريت المساحات شغالة','أنا بحب المشاوير في المطر بصراحة','الجو ده يستاهل شاي بالنعناع','متقربش من الميكروباصات في المطر'];
  this.pRush=['الزحمة دي مش طبيعية النهاردة','ساعة الذروة دي هتجنني','كل دي عربيات جت منين؟','يا ريت الطريق يفضى شوية','عايزين كباري زيادة في البلد دي','خش من الحتة الفاضية يا أسطى'];
  this.pFuel=['البنزين بيقل يا كابتن، عينك على العدة','لو العربية وقفت بينا هنمشي؟','في محطة بنزين قريبة؟','التنك قرب يخلص ولا إيه؟'];
  this.pNear=['قربنا ولا لسه؟','هنزل هنا جنب الرصيف','تمام، أنا عارف المكان من هنا','قربنا، الحمد لله','بص، أنا نازل عند الشجرة دي'];
  this.pZone=['إحنا دخلنا D كده؟ حلوة المنطقة دي','D ليها ذكريات كتير معايا','شوف D شكلها حلو بالليل','أنا اتربيت في D يا كابتن','زمان كانت D أهدى من كده','الشوارع في D ليها طعم تاني'];
  this.paxPlace()}
 paxPlace(){const pw=this.pways,pl=this.pl,rnd2=this.trnd,fx=this.fx;
  for(let t=0;t<60;t++){const e=pw[Math.floor(Math.random()*pw.length)],s=rnd2(8,e.L-8),pos=this.posAt(e,s);
   const d=pl?Math.hypot(pos[0]-pl.x,pos[1]-pl.z):200;if(d<120||d>350)continue;
   const nx2=this.posAt(e,cl(s+2,0,e.L));let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;
   fx.pax={x:pos[0]-dz*(e.hw+1.4),z:pos[1]+dx*(e.hw+1.4),y:pos[2]||.06,h:Math.atan2(dx,dz)};
   this.paxG.visible=true;this.bcnP.visible=true;return}
  const e0=pw[0],p0=this.posAt(e0,10);fx.pax={x:(pl?pl.x:p0[0])+150,z:(pl?pl.z:p0[1]),y:.06,h:0}}
 fareUpd(dt){const g=this.g,pl=this.pl,fx=this.fx,t=g.t;
  const sp=pl.speed*3.6;
  this.paxG.position.set(fx.pax.x,fx.pax.y+Math.abs(Math.sin(t*3))*.04,fx.pax.z);this.paxG.rotation.y=fx.pax.h+Math.sin(t*.8)*.4;
  this.bcnP.position.set(fx.pax.x,13+fx.pax.y,fx.pax.z);this.bcnP.material.opacity=.22+.12*Math.sin(t*3);
  const m$=x=>Math.round(x)+' م';
  if(fx.st===0){const d=Math.hypot(fx.pax.x-pl.x,fx.pax.z-pl.z);
   if(d>520)this.paxPlace();
   const e2=$('erFare');if(e2)e2.innerHTML='<small>أقرب راكب: '+m$(d)+'</small>';
   if(d<5&&sp<8){fx.st=1;fx.dname=this.dests[Math.floor(Math.random()*this.dests.length)];fx.rush=Math.random()<.35;fx.hits=0;fx.chatT=t+5;fx.topSpd=0;fx.zoneSaid='';
    let zn=null;for(const z2 of this.zones||[])if(z2.n===fx.dname){zn=z2;break}
    let best=null;
    if(zn&&zn.nile){for(let t2=0;t2<80&&!best;t2++){const e3=this.pways[Math.floor(Math.random()*this.pways.length)],s3=this.trnd(8,e3.L-8),pos=this.posAt(e3,s3);
      if(this.nearNile(pos[0],pos[1],300)&&(t2>60||Math.hypot(pos[0]-pl.x,pos[1]-pl.z)>150))best={x:pos[0],z:pos[1],y:pos[2]||.06,d:Math.hypot(pos[0]-pl.x,pos[1]-pl.z)}}
     if(!best){const ns=this.nileS[Math.floor(Math.random()*this.nileS.length)];let bd=1e18;
      for(const e3 of this.pways){const pos=this.posAt(e3,e3.L/2),dx=pos[0]-ns[0],dz=pos[1]-ns[1],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best={x:pos[0],z:pos[1],y:pos[2]||.06,d:Math.hypot(pos[0]-pl.x,pos[1]-pl.z)}}}}}
    else if(zn){let bc=null,bcd=1e18;
     for(let t2=0;t2<80&&!best;t2++){const e3=this.pways[Math.floor(Math.random()*this.pways.length)],s3=this.trnd(8,e3.L-8),pos=this.posAt(e3,s3),dx=pos[0]-zn.x,dz=pos[1]-zn.z,d2=dx*dx+dz*dz,dd=Math.hypot(pos[0]-pl.x,pos[1]-pl.z);
      if(d2<bcd){bcd=d2;bc={x:pos[0],z:pos[1],y:pos[2]||.06,d:dd}}
      if(d2<zn.r*zn.r*.64&&(t2>60||dd>150))best={x:pos[0],z:pos[1],y:pos[2]||.06,d:dd}}
     if(!best)best=bc&&bcd<zn.r*zn.r?bc:{x:zn.x,z:zn.z,y:.06,d:Math.hypot(zn.x-pl.x,zn.z-pl.z)}}
    if(!best){for(let t2=0;t2<60;t2++){const e3=this.pways[Math.floor(Math.random()*this.pways.length)],s3=this.trnd(8,e3.L-8),pos=this.posAt(e3,s3);
     const dd=Math.hypot(pos[0]-pl.x,pos[1]-pl.z);if(dd>400&&dd<1600){best={x:pos[0],z:pos[1],y:pos[2]||.06,d:dd};break}}
     if(!best)best={x:pl.x+600,z:pl.z+400,y:.06,d:721}}
    fx.dst=best;fx.fare=10+Math.round(best.d*.045);if(this.rushOn){fx.fare=Math.round(fx.fare*1.5);fx.zahma=true}else fx.zahma=false;
    if(fx.rush){fx.t=best.d/11+20;fx.fare=Math.round(fx.fare*1.5)}
    this.paxG.visible=false;this.bcnP.visible=false;this.bcnD.visible=true;
    if(fx.rush)g.popup(this.pRu[Math.floor(Math.random()*this.pRu.length)].replace('D',fx.dname));
    else g.popup(this.pUp[Math.floor(Math.random()*this.pUp.length)].replace('D',fx.dname));g.audio.flash();
    if(this.chain&&this.chain.offer>0&&!this.chain.on){const ch=this.chain;ch.on=true;ch.offer=0;ch.leg=0;ch.legs=2+ch.lvl;
     setTimeout(()=>g.popup('بدأت السلسلة! مشوار 1 من '+ch.legs+'.. الأجرة بتزيد مع كل مشوار (X للإلغاء)'),1200)}}}
  else{const d=Math.hypot(fx.dst.x-pl.x,fx.dst.z-pl.z);
   this.bcnD.position.set(fx.dst.x,13+fx.dst.y,fx.dst.z);this.bcnD.material.opacity=.22+.12*Math.sin(t*(fx.rush?8:3));
   if(fx.rush){fx.t-=dt;if(fx.t<=0){fx.rush=false;fx.fare=Math.round(fx.fare/1.5);g.popup('اتأخرنا شوية، بس يلا بينا')}}
   if(sp>fx.topSpd)fx.topSpd=sp;
   if(t>fx.chatT){fx.chatT=t+13+Math.random()*7;let pool=this.pCh;
    if(fx.hitCd>1.2)pool=this.pHit;
    else if(sp>105)pool=this.pSpd;
    else if(this.wx&&this.wx.on)pool=this.pRain;
    else if(this.rushOn)pool=this.pRush;
    else if(this.fuel!==undefined&&this.fuel<15)pool=this.pFuel;
    else if(d<150)pool=this.pNear;
    else if(this.arCur&&this.arCur!==fx.zoneSaid){fx.zoneSaid=this.arCur;pool=this.pZone}
    g.popup('الراكب: '+pool[Math.floor(Math.random()*pool.length)].replace('D',this.arCur||fx.dname))}
   const e2=$('erFare');if(e2)e2.innerHTML='<small>الوجهة: '+fx.dname+' - '+m$(d)+' ('+fx.fare+' ج)'+(fx.rush?' ⏱ '+Math.ceil(fx.t)+' ث':'')+'</small>';
   if(d<6&&sp<8){fx.st=0;if(this.buffTea>0){this.buffTea--;fx.fare+=Math.round(fx.fare*.15)}if(this.chain&&this.chain.on)fx.fare=Math.round(fx.fare*(1+this.chain.leg*.5));g.coins+=fx.fare;
    if(fx.tip){fx.tip=false;g.coins+=15;setTimeout(()=>g.popup('الراكب عجبته العربية النضيفة.. بقشيش +15'),900)}
    if(fx.hits===0){fx.streak++;if(fx.streak%3===0){g.coins+=60;setTimeout(()=>g.popup('سلسلة نضيفة! '+fx.streak+' مشاوير من غير خبطة +60 جنيه'),900)}}
    else fx.streak=0;
    g.saveCoins();
    g.popup(this.pDn[Math.floor(Math.random()*this.pDn.length)]+' +'+fx.fare+' جنيه');g.audio.coin();
    const st5=Math.max(1,Math.min(5,5-fx.hits-(fx.topSpd>120?1:0))),tip5=st5===5?20:st5===4?10:0;
    if(tip5){g.coins+=tip5;g.saveCoins()}
    setTimeout(()=>g.popup('الراكب: '+'⭐'.repeat(st5)+(st5>=4?' مشوار نضيف':st5===3?' مشوار عادي':' خد بالك المرة الجاية')+(tip5?'.. بقشيش +'+tip5:'')),1700);
    if(this.chain&&this.chain.on){const ch=this.chain;ch.leg++;
     if(ch.leg>=ch.legs){ch.on=false;ch.cd=this.trnd(50,80);const bn=100+50*ch.lvl;g.coins+=bn;
      ch.lvl=Math.min(5,ch.lvl+1);try{localStorage.setItem('er_chain',String(ch.lvl))}catch(e4){}
      g.saveCoins();
      setTimeout(()=>{g.popup('السلسلة خلصت! شغل نضيف يا معلم.. بونص +'+bn+' جنيه 🎉');g.audio.coin()},2600);
      setTimeout(()=>g.popup('مستوى السلاسل بقى '+ch.lvl+'.. مشاوير أطول وأجرة أحسن 🔗'),4400)}
     else setTimeout(()=>g.popup('مشوار '+ch.leg+' من '+ch.legs+' تمام! اللي بعده مستنيك 🔗'),2600)}
    this.bcnD.visible=false;this.paxPlace()}}
  const em=$('erMoney');if(em&&em.textContent!==String(g.coins))em.textContent=g.coins}
 // ---------- v65: progressing mission chains (مشاوير متتالية) ----------
 chainBuild(){let lvl=1;try{lvl=+localStorage.getItem('er_chain')||1}catch(e2){}lvl=Math.max(1,Math.min(5,lvl|0||1));
  this.chain={on:false,leg:0,legs:3,lvl,offer:0,cd:45}}
 chainUpd(dt){const ch=this.chain,g=this.g,fx=this.fx;
  const eW=$('erChainW'),e=$('erChain');
  if(ch.on){if(eW)eW.style.display='';if(e)e.innerHTML='<small>🔗 مشوار '+(ch.leg+1)+'/'+ch.legs+' - أجرة ×'+(1+ch.leg*.5)+'</small>'}
  else if(eW)eW.style.display='none';
  if(this.bcnP){const cc=(ch.on||ch.offer>0)?0xc77dff:0x35e08a;if(this.bcnP.material.color.getHex()!==cc)this.bcnP.material.color.set(cc)}
  if(ch.on||!fx)return;
  if(ch.offer>0){ch.offer-=dt;if(ch.offer<=0){ch.offer=0;ch.cd=this.trnd(35,55);g.popup('عرض الشغل المتوالي راح.. ممكن يتعرض تاني بعد شوية')}return}
  if(fx.st!==0)return;
  ch.cd-=dt;if(ch.cd<=0){ch.cd=0;ch.offer=25;const N=2+ch.lvl;
   g.popup('عرض شغل متوالي يا كابتن! خد الراكب اللي جاي خلال 25 ثانية وابدأ سلسلة '+N+' مشاوير بأجرة بتزيد 🔗');g.audio.flash()}}
 // ---------- v57: speed radars + police ----------
 rdrBuild(){const cands=this.pways.filter(e=>e.hw>=7&&e.L>300);if(!cands.length)return;
  this.rd=[];
  for(let t2=0;t2<200&&this.rd.length<6;t2++){const e=cands[Math.floor(Math.random()*cands.length)],s2=this.trnd(60,e.L-60),pos=this.posAt(e,s2);
   let ok=true;for(const r2 of this.rd)if(Math.hypot(pos[0]-r2.x,pos[1]-r2.z)<700){ok=false;break}
   if(!ok)continue;
   const nx2=this.posAt(e,cl(s2+3,0,e.L));let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;
   this.rd.push({x:pos[0],z:pos[1],y:pos[2]||.06,dx,dz,hw:e.hw,cd:0,lim:90,fl:0})}
  if(!this.rd.length)return;
  const N=this.rd.length,o=new T.Object3D();
  const pm=new T.InstancedMesh(new T.CylinderGeometry(.09,.12,4.4,5),new T.MeshStandardMaterial({color:col(0x9aa0a8),metalness:.5,roughness:.5}),N),
   cm=new T.InstancedMesh(new T.BoxGeometry(.5,.34,.34),new T.MeshStandardMaterial({color:col(0x2b2f36),roughness:.6}),N);
  this.rdFlash=new T.InstancedMesh(new T.SphereGeometry(.16,6,5),new T.MeshBasicMaterial({color:0xffffff,fog:false}),N);
  this.rd.forEach((r2,k)=>{const sx=r2.x-r2.dz*(r2.hw+1.1),sz=r2.z+r2.dx*(r2.hw+1.1);r2.sx=sx;r2.sz=sz;
   o.rotation.set(0,0,0);o.scale.set(1,1,1);o.position.set(sx,r2.y+2.2,sz);o.updateMatrix();pm.setMatrixAt(k,o.matrix);
   o.position.set(sx,r2.y+4.2,sz);o.rotation.set(0,Math.atan2(r2.dx,r2.dz),0);o.updateMatrix();cm.setMatrixAt(k,o.matrix);
   o.rotation.set(0,0,0);this.rdFlash.setMatrixAt(k,o.matrix)});
  const cc=new T.Color(0x333333);for(let k=0;k<N;k++)this.rdFlash.setColorAt(k,cc);
  this.scene.add(pm,cm,this.rdFlash);
  const r0=this.rd[0],gx=r0.x+r0.dz*(r0.hw+3.5),gz=r0.z-r0.dx*(r0.hw+3.5),h2=Math.atan2(r0.dx,r0.dz);
  const grp=new T.Group();
  const bd=new T.Mesh(new T.BoxGeometry(1.85,.6,4.3),new T.MeshStandardMaterial({color:col(0xe8e8e8),roughness:.5,metalness:.3}));bd.position.y=.62;
  const tp=new T.Mesh(new T.BoxGeometry(1.6,.5,2),new T.MeshStandardMaterial({color:col(0x14161c),roughness:.4}));tp.position.set(0,1.15,-.2);
  const st2=new T.Mesh(new T.BoxGeometry(1.9,.28,2.2),new T.MeshStandardMaterial({color:col(0x1a1a1a),roughness:.7}));st2.position.set(0,.86,1);
  this.polA=new T.Mesh(new T.BoxGeometry(.5,.16,.3),new T.MeshBasicMaterial({color:0x2e6bff,fog:false}));this.polA.position.set(-.35,1.5,-.4);
  this.polB=new T.Mesh(new T.BoxGeometry(.5,.16,.3),new T.MeshBasicMaterial({color:0xff2e2e,fog:false}));this.polB.position.set(.35,1.5,-.4);
  grp.add(bd,tp,st2,this.polA,this.polB);grp.position.set(gx,r0.y,gz);grp.rotation.y=h2;this.scene.add(grp);this.pol=grp}
 rdrUpd(dt){const pl=this.pl,g=this.g,t=g.t,sp=pl.speed*3.6;
  let near=null,nd=1e9;
  for(let k=0;k<this.rd.length;k++){const r2=this.rd[k];if(r2.cd>0)r2.cd-=dt;
   const d=Math.hypot(r2.x-pl.x,r2.z-pl.z);if(d<nd){nd=d;near=r2}
   if(r2.cd<=0&&d<13&&sp>r2.lim&&!(this.buffQasab>0)){r2.cd=25;
    const fine=this.pol&&Math.hypot(r2.x-this.pol.position.x,r2.z-this.pol.position.z)<40?100:50,
     took=Math.min(g.coins,fine);g.coins-=took;g.saveCoins();
    if(this.fx)this.fx.streak=0;
    this.rdFlash.setColorAt(k,new T.Color(0xffffff));this.rdFlash.instanceColor.needsUpdate=true;r2.fl=.6;
    g.popup(took>0?('📸 رادار! غرامة '+took+' جنيه.. اهدى شوية'):'📸 رادار! المرة الجاية هتتغرّم');g.audio.flash()}
   if(r2.fl>0){r2.fl-=dt;if(r2.fl<=0){this.rdFlash.setColorAt(k,new T.Color(0x333333));this.rdFlash.instanceColor.needsUpdate=true}}}
  const e=$('erRad');
  if(near&&nd<150){const ahead=(near.x-pl.x)*Math.sin(pl.h)+(near.z-pl.z)*Math.cos(pl.h);
   if(e&&ahead>-10){e.parentElement.style.display='';e.innerHTML='<small>📸 رادار: '+Math.round(nd)+' م</small>'}
   else if(e)e.parentElement.style.display='none'}
  else if(e)e.parentElement.style.display='none';
  if(this.polA){const ph=Math.sin(t*9)>0;this.polA.visible=ph;this.polB.visible=!ph}}
 // ---------- v56: landmark missions + time trials ----------
 msBuild(){const bcn=new T.Mesh(new T.CylinderGeometry(1.6,2,30,10,1,true),new T.MeshBasicMaterial({color:0xc77dff,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false,fog:false}));
  bcn.visible=false;this.scene.add(bcn);this.bcnM=bcn;
  this.lms=[];
  for(const l of this.data.lm||[]){const s2=this.snapP(l[1],l[2]);if(s2.d<900)this.lms.push({n:l[0],x:s2.x,z:s2.z})}
  if(this.mosque)this.lms.push({n:'مسجد مصطفى محمود',x:this.mosque.position.x,z:this.mosque.position.z});
  if(this.sphinx)this.lms.push({n:'أبو الهول',x:this.sphinx.position.x,z:this.sphinx.position.z});
  this.ms={st:0,lm:null,x:0,z:0,d:0,trl:false,t:0,pay:0,cd:20,last:-1,done:0}}
 msSpawn(){const ms=this.ms,pl=this.pl;ms.lm=null;
  const ord=[];for(let i=0;i<this.lms.length;i++)if(i!==ms.last)ord.push(i);
  for(let t2=0;t2<24;t2++){const i=ord[Math.floor(Math.random()*ord.length)],l=this.lms[i],d=Math.hypot(l.x-pl.x,l.z-pl.z);
   if(d>500&&d<4200){ms.lm=l;ms.last=i;ms.x=l.x;ms.z=l.z;ms.d=d;break}}
  if(!ms.lm||Math.hypot(ms.x-pl.x,ms.z-pl.z)<=500){ms.cd=15;return}
  ms.st=1;ms.trl=Math.random()<.3;ms.pay=25+Math.round(ms.d*.06);
  if(ms.trl){ms.t=ms.d/13+15;ms.pay=Math.round(ms.pay*1.8)}
  this.bcnM.visible=true;
  const m$=x=>Math.round(x)+' م';
  if(ms.trl)this.g.popup('تحدي وقت: لحّق '+ms.lm.n+' في '+Math.ceil(ms.t)+' ثانية وخد '+ms.pay+' جنيه');
  else this.g.popup('مهمة: روح '+ms.lm.n+' ('+m$(ms.d)+') وخد '+ms.pay+' جنيه');
  this.g.audio.flash()}
 msUpd(dt){const ms=this.ms,pl=this.pl,g=this.g,t=g.t,m$=x=>Math.round(x)+' م';
  const e=$('erMsn'),ew=$('erMsnW');
  if(ms.st===0){if(ew)ew.style.display='none';
   ms.cd-=dt;if(ms.cd<=0)this.msSpawn();
   this.bcnM.visible=false;return}
  this.bcnM.visible=true;this.bcnM.position.set(ms.x,15,ms.z);this.bcnM.material.opacity=.2+.12*Math.sin(t*4.2);
  const d=Math.hypot(ms.x-pl.x,ms.z-pl.z);
  if(ms.trl){ms.t-=dt;
   if(ms.t<=0){ms.st=0;ms.cd=this.trnd(35,60);this.bcnM.visible=false;g.popup('الوقت خلص، المهمة ضاعت.. جرب اللي بعدها');return}}
  if(e)e.innerHTML='<small>🎯 '+ms.lm.n+': '+m$(d)+(ms.trl?' ⏱ '+Math.ceil(ms.t)+' ث':'')+'</small>';
  if(ew)ew.style.display='';
  if(d<14){ms.st=0;ms.done++;ms.cd=this.trnd(40,75);g.coins+=ms.pay;g.saveCoins();
   this.bcnM.visible=false;
   g.popup((ms.trl?'وصلت في الوقت! ':'مهمة تمت! ')+'+'+ms.pay+' جنيه');g.audio.coin()}}
 // ---------- v55: area depth - zones, landmarks, feluccas ----------
 snapP(x,z){let bx=x,bz=z,bd=1e18;for(const e of this.pways){const p=e.w.p;for(let i=0;i<p.length;i++){const dx=p[i][0]-x,dz=p[i][1]-z,d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bx=p[i][0];bz=p[i][1]}}}return{x:bx,z:bz,d:Math.sqrt(bd)}}
 nearNile(x,z,r2){if(!this.nileS)return false;for(const s2 of this.nileS){const dx=x-s2[0],dz=z-s2[1];if(dx*dx+dz*dz<r2*r2)return true}return false}
 areaBuild(){const pw=this.pways;if(!pw||!pw.length)return;
  this.nileS=[];let lx=1e9,lz=1e9;for(const pl2 of this.data.n)for(let i=0;i<pl2.length/2;i++){const x=pl2[2*i]/10,z=pl2[2*i+1]/10,dx=x-lx,dz=z-lz;if(dx*dx+dz*dz>14400){this.nileS.push([x,z]);lx=x;lz=z}}
  const Z=[['الزمالك',-800,600,1100],['المهندسين',-2700,1000,850],['الدقي',-1730,2430,700],['وسط البلد',554,1722,850],['الجيزة',-2080,5200,900],['الهرم',-7708,8069,1200],['إمبابة',-2213,-1662,800],['المعادي',2897,10500,900],['مدينة نصر',11260,980,1300],['مصر الجديدة',9640,-2990,1100],['عين شمس',6750,-6270,1000]];
  this.zones=[{n:'كورنيش النيل',nile:true,r:0,x:0,z:0}];
  for(const z2 of Z){const s2=this.snapP(z2[1],z2[2]);if(s2.d<900)this.zones.push({n:z2[0],x:s2.x,z:s2.z,r:z2[3]})}
  this.arCur='';this.arPop=-99}
 areaUpd(dt){this.arT=(this.arT||0)-dt;if(this.arT>0)return;this.arT=.5;
  const pl=this.pl;let cur='';
  for(const z2 of this.zones){if(z2.nile)continue;const dx=pl.x-z2.x,dz=pl.z-z2.z;if(dx*dx+dz*dz<z2.r*z2.r){cur=z2.n;break}}
  if(!cur&&this.nearNile(pl.x,pl.z,240))cur='كورنيش النيل';
  if(cur!==this.arCur){const was=this.arCur;this.arCur=cur;const e=$('erArea');
   if(e){e.textContent=cur?'📍 '+cur:'';e.parentElement.style.display=cur?'':'none'}
   const t=this.g.t;if(cur&&cur!==was&&t-this.arPop>8){this.arPop=t;this.g.popup('أنت في '+cur)}}}
 feluBuild(){const lines=[];
  for(const pl2 of this.data.n){const pts=[];let L=0;for(let i=0;i<pl2.length/2;i++){const x=pl2[2*i]/10,z=pl2[2*i+1]/10;if(i)L+=Math.hypot(x-pts[i-1][0],z-pts[i-1][1]);pts.push([x,z,L])}if(L>400)lines.push({p:pts,L})}
  if(!lines.length)return;
  const N2=this.low?4:7;
  const hg=new T.BoxGeometry(1.3,.55,5.2);hg.translate(0,.3,0);
  const hm2=this.flH=new T.InstancedMesh(hg,new T.MeshStandardMaterial({color:col(0x54402a),roughness:.9}),N2),
   sm2=this.flS=new T.InstancedMesh(new T.CircleGeometry(3.1,3),new T.MeshStandardMaterial({color:col(0xf0ead8),roughness:.8,emissive:col(0x9a9484),emissiveIntensity:.4,side:T.DoubleSide}),N2);
  hm2.frustumCulled=false;sm2.frustumCulled=false;
  this.fl=[];for(let k=0;k<N2;k++){const e=lines[k%lines.length];this.fl.push({e,s:20+Math.random()*(e.L-40),dir:k%2?1:-1,v:1.1+Math.random()*.9})}
  this.flO=new T.Object3D();this.scene.add(hm2,sm2)}
 feluUpd(dt){const o=this.flO,t=this.g.t;
  for(let k=0;k<this.fl.length;k++){const a=this.fl[k],e=a.e,p=e.p;a.s+=a.dir*a.v*dt;
   if(a.s>e.L-15||a.s<15){a.s=cl(a.s,15,e.L-15);a.dir=-a.dir}
   let lo=0,hi=p.length-1;while(lo<hi-1){const m2=(lo+hi)>>1;if(p[m2][2]<=a.s)lo=m2;else hi=m2}
   const A=p[lo],B=p[lo+1],tt=cl((a.s-A[2])/((B[2]-A[2])||1e-6),0,1),x=A[0]+(B[0]-A[0])*tt,z=A[1]+(B[1]-A[1])*tt,h2=Math.atan2(B[0]-A[0],B[1]-A[1]);
   const bob=Math.sin(t*.9+k*2.1)*.1,roll=Math.sin(t*.7+k*1.3)*.06;
   o.rotation.set(0,h2,roll);o.scale.set(1,1,1);o.position.set(x,.28+bob,z);o.updateMatrix();this.flH.setMatrixAt(k,o.matrix);
   o.rotation.set(0,h2+Math.PI/2,.42+roll);o.position.set(x,3+bob,z);o.updateMatrix();this.flS.setMatrixAt(k,o.matrix)}
  this.flH.instanceMatrix.needsUpdate=true;this.flS.instanceMatrix.needsUpdate=true}
 mosqueBuild(){const s2=this.snapP(-2704,1600);if(s2.d>900)return;
  let mx=s2.x+30,mz=s2.z;
  for(const c2 of[[30,0],[-30,0],[0,30],[0,-30],[26,26],[-26,-26],[26,-26],[-26,26]]){const u=this.query(s2.x+c2[0],s2.z+c2[1]);if(u&&u.d>u.hw+9){mx=s2.x+c2[0];mz=s2.z+c2[1];break}}
  const g2=new T.Group(),stone=new T.MeshStandardMaterial({color:col(0xcfc3a8),roughness:.85,emissive:col(0x35301f),emissiveIntensity:.5});
  const base=new T.Mesh(new T.BoxGeometry(26,10,20),stone);base.position.y=5;
  const dome=new T.Mesh(new T.SphereGeometry(7,14,10,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:col(0x3f8a5a),roughness:.6,emissive:col(0x1f5a3a),emissiveIntensity:.8}));dome.position.y=10;
  const m1=new T.Mesh(new T.CylinderGeometry(1.1,1.5,24,8),stone);m1.position.set(12,12,8);
  const m3=new T.Mesh(new T.CylinderGeometry(1.1,1.5,24,8),stone);m3.position.set(-12,12,-8);
  const tip=new T.MeshBasicMaterial({color:0x54ff9a,fog:false});
  const t1=new T.Mesh(new T.SphereGeometry(.7,6,5),tip);t1.position.set(12,24.6,8);
  const t2=new T.Mesh(new T.SphereGeometry(.7,6,5),tip);t2.position.set(-12,24.6,-8);
  g2.add(base,dome,m1,m3,t1,t2);g2.position.set(mx,.06,mz);this.scene.add(g2);this.mosque=g2}
 sphinxBuild(){const PX=-9230,PZ=8932;let px=PX+620,pz=PZ+40;
  for(const c2 of[[620,40],[560,150],[500,-120],[680,220],[420,260]]){const u=this.query(PX+c2[0],PZ+c2[1]);if(!u||u.d>u.hw+8){px=PX+c2[0];pz=PZ+c2[1];break}}
  const m2=new T.MeshStandardMaterial({color:col(0xcaa877),roughness:.9,emissive:col(0x3a2e18),emissiveIntensity:.9});
  const body=new T.Mesh(new T.BoxGeometry(10,6,22),m2);body.position.y=3;
  const head=new T.Mesh(new T.BoxGeometry(5.5,5.5,6),m2);head.position.set(0,7.5,9);
  const g3=new T.Group();g3.add(body,head);g3.position.set(px,.06,pz);g3.rotation.y=Math.PI/2;this.scene.add(g3);this.sphinx=g3}
 // ---------- v53: the car dealership ----------
 dealerBuild(){const pw=this.pways;if(!pw||!pw.length)return;
  const sp2=this.spawn;let best=null,bd=1e9;
  for(const e of pw){const pos=this.posAt(e,e.L/2),d=Math.hypot(pos[0]-sp2.x,pos[1]-sp2.z);if(d<bd&&d>150){bd=d;best=e}}
  const e=best||pw[0],pos=this.posAt(e,e.L/2),nx2=this.posAt(e,e.L/2+4);
  let dx=nx2[0]-pos[0],dz=nx2[1]-pos[1];const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;
  const off=e.hw+3.2;
  this.dlr={x:pos[0]-dz*off,z:pos[1]+dx*off,y:pos[2]||.06,h:Math.atan2(dx,dz)};
  const sgn=new T.Mesh(new T.BoxGeometry(4.6,1.5,.3),new T.MeshStandardMaterial({color:col(0x141824),emissive:col(0x7ab8ff),emissiveIntensity:.9}));sgn.position.set(this.dlr.x,this.dlr.y+3.4,this.dlr.z);sgn.rotation.y=this.dlr.h;
  const pl2=new T.Mesh(new T.BoxGeometry(.3,3.2,.3),new T.MeshStandardMaterial({color:col(0x2a2e38),roughness:.8}));pl2.position.set(this.dlr.x,this.dlr.y+1.6,this.dlr.z);
  const bcn=new T.Mesh(new T.CylinderGeometry(2.2,2.6,30,10,1,true),new T.MeshBasicMaterial({color:0x7ab8ff,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false,fog:false}));bcn.position.set(this.dlr.x,this.dlr.y+15,this.dlr.z);
  this.dlrBcn=bcn;this.scene.add(sgn,pl2,bcn);
  if(!$('dealerP')){const dv=document.createElement('div');dv.id='dealerP';dv.hidden=true;dv.style.cssText='position:fixed;left:50%;bottom:calc(var(--sab) + 76px);transform:translateX(-50%);z-index:3;direction:rtl';
   dv.innerHTML='<div class="glass" style="padding:10px 16px;border-radius:18px;text-align:center;min-width:240px">'+
    '<b style="font-size:15px">معرض العربيات</b><div style="margin:6px 0"><b id="dlName" style="font-size:19px"></b></div>'+
    '<div id="dlPrice" style="margin:2px 0 8px"></div>'+
    '<div style="display:flex;gap:8px;justify-content:center;pointer-events:auto">'+
    '<button class="btn tint" id="dlPr">▶</button><button class="btn primary" id="dlAct"></button><button class="btn tint" id="dlNx">◀</button></div>'+
    '<div style="margin-top:8px;pointer-events:auto"><button class="btn tint" id="dlTune">🔧 عدّل عربيتك</button></div></div>';
   document.body.appendChild(dv);
   dv.querySelector('#dlPr').onclick=()=>this.dlMove(-1);dv.querySelector('#dlNx').onclick=()=>this.dlMove(1);
   dv.querySelector('#dlTune').onclick=()=>this.tuneOpen();
   dv.querySelector('#dlAct').onclick=()=>this.dlAct()}
  this.dlI=0;this.dlOpen=false}
 dlMove(d2){this.dlI=(this.dlI+d2+CARS.length)%CARS.length;this.dlShow();this.g.audio.flash()}
 dlShow(){const d2=CARS[this.dlI],own=!!this.g.own[d2.id],cur=CARS[this.g.sel].id===d2.id;{const tb=$('dlTune');if(tb)tb.style.display=cur?'':'none'}
  $('dlName').textContent=d2.name;
  $('dlPrice').innerHTML=own?(cur?'العربية اللي معاك دلوقتي':'عندك العربية دي'):'السعر: <b>'+S.PRICE[d2.id]+'</b> جنيه';
  const b=$('dlAct');
  if(cur){b.textContent='تمام';b.disabled=false}
  else if(own){b.textContent='سوقها';b.disabled=false}
  else{b.textContent='اشتريها';b.disabled=this.g.coins<S.PRICE[d2.id];b.style.opacity=b.disabled?.55:1}}
 dlAct(){const g=this.g,d2=CARS[this.dlI],cur=CARS[g.sel].id===d2.id;
  if(cur){this.dlClose();return}
  if(!g.own[d2.id]){const p=S.PRICE[d2.id];if(g.coins<p)return;g.coins-=p;g.own[d2.id]=1;g.saveCoins();g.audio.unlock();g.popup('اتفتحت: '+d2.name)}
  const ox=this.pl.x,oz=this.pl.z,oh=this.pl.h;g.sel=this.dlI;this.mkCar();
  this.pl.x=ox;this.pl.z=oz;this.pl.h=oh;this.pl.setWv(0,0);this.ch=oh;
  this.dlShow();g.popup('ركبت: '+d2.name)}
 dlClosePanel(){const e=$('dealerP');if(e)e.hidden=true;this.dlOpen=false}
 tuneOpen(){const g=this.g;$('dealerP').hidden=true;
  if(!$('tuneP')){const dv=document.createElement('div');dv.id='tuneP';dv.hidden=true;dv.style.cssText='position:fixed;left:50%;bottom:calc(var(--sab) + 76px);transform:translateX(-50%);z-index:3;direction:rtl';
   dv.innerHTML='<div class="glass" style="padding:10px 16px;border-radius:18px;text-align:center;min-width:250px">'+
    '<b style="font-size:15px">ورشة التعديل 🔧</b><div id="tnInfo" style="margin:6px 0;font-size:13px"></div>'+
    '<div id="tnRows"></div>'+
    '<div style="margin-top:8px;pointer-events:auto"><button class="btn tint" id="tnBack">ارجع للمعرض</button></div></div>';
   document.body.appendChild(dv);
   dv.querySelector('#tnBack').onclick=()=>{$('tuneP').hidden=true;$('dealerP').hidden=false;this.dlShow()}}
  $('tuneP').hidden=false;this.tuneShow();g.popup('أهلاً بيك في الورشة.. عدّل عربيتك براحتك')}
 tuneShow(){const g=this.g,d=CARS[g.sel],l=g.upLv(d.id);
  $('tnInfo').textContent=d.name+' — فلوسك '+g.coins+' ج';
  const T2=[['e','الموتور'],['t','الكاوتش'],['b','الفرامل']],rows=$('tnRows');rows.innerHTML='';
  for(const [k,nm] of T2){const lv=l[k],row=document.createElement('div');row.style.cssText='display:flex;gap:8px;justify-content:space-between;align-items:center;margin:4px 0;pointer-events:auto';
   const sp2=document.createElement('span');sp2.textContent=nm+' '+'★'.repeat(lv)+'☆'.repeat(3-lv);
   const b=document.createElement('button');b.className='btn tint';const mx=lv>=3,cost=g.upCost(d,lv);
   b.textContent=mx?'أقصى مستوى':'ارفع '+cost+' ج';b.disabled=mx||g.coins<cost;b.style.opacity=b.disabled?.55:1;
   b.onclick=()=>this.tuneBuy(k);row.appendChild(sp2);row.appendChild(b);rows.appendChild(row)}}
 tuneBuy(k){const g=this.g,d=CARS[g.sel],l=g.upLv(d.id),nm={e:'الموتور',t:'الكاوتش',b:'الفرامل'}[k];
  if(l[k]>=3){g.popup('ده أقصى مستوى يا كابتن');return}
  const cost=g.upCost(d,l[k]);if(g.coins<cost){g.popup('فلوسك مش كفاية يا كابتن');return}
  g.coins-=cost;l[k]++;const u=g.upg();u[d.id]=l;try{localStorage.setItem('er_up',JSON.stringify(u))}catch(e2){}
  g.saveCoins();g.audio.coin();
  const ox=this.pl.x,oz=this.pl.z,oh=this.pl.h;this.mkCar();this.pl.x=ox;this.pl.z=oz;this.pl.h=oh;this.pl.setWv(0,0);this.ch=oh;
  g.popup('تم التعديل: '+nm+' بقى مستوى '+l[k]+' ★');this.tuneShow()}
 dealerUpd(dt){const pl=this.pl,t=this.g.t,d=this.dlr;
  this.dlrBcn.material.opacity=.16+.1*Math.sin(t*2.4);
  const dist=Math.hypot(d.x-pl.x,d.z-pl.z);
  if(!this.dlOpen&&dist<10&&pl.speed*3.6<8){this.dlOpen=true;this.g.keys={};this.dlI=this.g.sel;this.dlShow();$('dealerP').hidden=false;this.g.popup('أهلاً بيك في المعرض')}
  else if(this.dlOpen&&dist>16){this.dlClosePanel();const tp=$('tuneP');if(tp)tp.hidden=true}}
 onRoad(x,z){const q=this.query(x,z);return q&&q.d<q.hw+2.5}
 update(dt){if(this.photo&&this.photo.on)this.photoUpd(dt);const n=Math.max(1,Math.min(8,Math.ceil(dt*120))),h=dt/n;for(let i=0;i<n;i++)this.sim(h);
  if(this.towerBc)this.towerBc.visible=Math.sin(this.g.t*2.4)>0;
  if(this.tlL){this.tlT=(this.tlT||0)+dt;if(this.tlT>5){this.tlT=0;this.tlP=!this.tlP;const cc=new T.Color();for(let k=0;k<this.tlN;k++)this.tlL.setColorAt(k,cc.set((k%2===0)===this.tlP?0xff3226:0x2fe06a));this.tlL.instanceColor.needsUpdate=true}}
  const p=this.pl,q=this.query(p.x,p.z);let ty=0;if(q){if(q.b&&q.d<q.hw+1.5)ty=q.y;else if(q.y>1&&q.d<q.hw+6)ty=q.y}
  this.cy+=(ty-this.cy)*Math.min(1,5*dt);if(this.ag&&this.rushOn!==undefined)this.rushUpd(dt);if(this.agM)this.trafficUpd(dt);if(this.pdM)this.pedUpd(dt);if(this.fx)this.fareUpd(dt);if(this.chain)this.chainUpd(dt);if(this.dlr)this.dealerUpd(dt);if(this.fl)this.feluUpd(dt);if(this.zones)this.areaUpd(dt);if(this.ms)this.msUpd(dt);if(this.rd)this.rdrUpd(dt);if(this.map)this.mapUpd(dt);if(this.wx)this.wxUpd(dt);if(this.svc)this.svcUpd(dt);if(this.shop)this.shopUpd(dt)}
 sim(h){const g=this.g,p=this.pl,k=g.keys;let s=(k.right?1:0)-(k.left?1:0);if(g.opt.tilt&&matchMedia('(pointer:coarse)').matches)s=cl(s+(g.opt.inv?-1:1)*g.tilt/20,-1,1);s=cl(s+(g.wv||0),-1,1);
  const I={steer:s,thr:k.up?1:0,brk:k.down?1:0,hb:k.hb?1:0};p.grip=(this.onRoad(p.x,p.z)?1:.85)*(this.wx&&this.wx.on?.9:1);if(p.dmg>=100)I.thr=0;if(this.fuel!==undefined&&this.fuel<=0)I.thr*=.12;
  p.step(h,I);const B=this.bounds;if(p.x<B.x0)p.x=B.x0;if(p.x>B.x1)p.x=B.x1;if(p.z<B.z0)p.z=B.z0;if(p.z>B.z1)p.z=B.z1}
 draw(dt){const g=this.g,w=g.world,p=this.pl,c=w.cam,sp=p.speed,wv=p.wv();g.wheelStep(dt);S.updCar(this.pcar,p,dt,1);this.pcar.g.position.y=this.cy;
  const lit=!!g.hl,ps=this.pcar;if(ps.spot)ps.spot.intensity=lit?3.5:0;ps.hl.emissiveIntensity=lit?4:.6;
  let ah=p.h;if(sp>5)ah=p.h+cl(wrap(Math.atan2(wv[0],wv[1])-p.h),-.6,.6)*.4;this.ch+=wrap(ah-this.ch)*(1-Math.exp(-7*dt));const sn=Math.sin(this.ch),cs=Math.cos(this.ch);let px,py,pz,lx,ly,lz,fov;
  if(this.photo&&this.photo.on){const ph=this.photo,cp2=Math.cos(ph.pitch);px=p.x+Math.sin(ph.yaw)*cp2*ph.dist;pz=p.z+Math.cos(ph.yaw)*cp2*ph.dist;py=this.cy+.6+Math.sin(ph.pitch)*ph.dist;lx=p.x;lz=p.z;ly=this.cy+1;fov=55}
  else if(g.view===0){const dist=5.7+sp*.011;px=p.x-sn*dist;pz=p.z-cs*dist;py=this.cy+2+sp*.003;lx=p.x+sn*8;lz=p.z+cs*8;ly=this.cy+1.1;fov=58+Math.min(34,sp*.62)}
  else{px=p.x+Math.sin(p.h)*.3;pz=p.z+Math.cos(p.h)*.3;py=this.cy+1.2;lx=p.x+Math.sin(p.h)*30;lz=p.z+Math.cos(p.h)*30;ly=this.cy+1.05;fov=68+Math.min(18,sp*.3)}
  this.bump*=Math.exp(-5*dt);const shk=(this.bump*.24+sp*.0009)*Math.sin(g.t*53);c.position.set(px,py+shk,pz);c.lookAt(lx,ly,lz);if(Math.abs(c.fov-fov)>.05){c.fov=fov;c.updateProjectionMatrix()}
  this.moon.position.set(p.x+40,120,p.z+30);this.moon.target.position.set(p.x,0,p.z);this.moon.target.updateMatrixWorld();
  const r=w.r;r.shadowMap.needsUpdate=true;r.clear();r.render(this.scene,c);
  $('realSpd').textContent=Math.round(sp*3.6);g.audio.prof=p.d.id;g.audio.atm=(this.wx&&this.wx.on)?'rain':'night';if(!g.paused)g.audio.update(p.rpm/p.d.rl,p.slip>.14&&sp>4,true,p.thr)}}
S.RealMap=RealMap;})(window.SS);
