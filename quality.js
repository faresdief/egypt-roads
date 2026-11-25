// Auto quality scaler — طرق مصر. Keeps weak phones smooth: starts low on
// weak devices, then steps render quality up/down from measured FPS.
(function(S){
const STEPS=[
 {pr:1.0,shadow:true},   // 0 full (world prMax already caps dpr at 2)
 {pr:0.8,shadow:true},
 {pr:0.75,shadow:false}, // == game low mode
 {pr:0.6,shadow:false},
];
class Quality{
 constructor(g){this.g=g;const w=g.world;this.lvl=0;this.cap=STEPS.length-1;
  const weak=/Mobi|Android/i.test(navigator.userAgent)&&(navigator.hardwareConcurrency<=4||(navigator.deviceMemory&&navigator.deviceMemory<=4));
  this.maxLvl=weak?2:0;      // weak phones never go above step 2; start at 2
  this.lvl=weak?2:0;
  this.acc=0;this.n=0;this.calm=0;this.bad=0;this.last=performance.now();
  this.apply();
  const loop=t=>{const dt=t-this.last;this.last=t;this.tick(dt);requestAnimationFrame(loop)};
  requestAnimationFrame(loop)}
 apply(){const g=this.g,w=g.world,st=STEPS[this.lvl];
  if(!w)return;
  if(!w.pr0)w.pr0=w.prMax;
  w.prMax=w.pr0*st.pr;w.setPR(Math.min(w.pr,w.prMax));
  if(w.sun)w.sun.castShadow=st.shadow;
  document.body.classList.toggle('low',!st.shadow)}
 tick(dt){if(dt<=0||dt>500)return; // ignore tab-switch gaps
  const fps=1000/dt;this.acc+=fps;this.n++;
  if(this.n<50)return;             // ~50 frames per window
  const avg=this.acc/this.n;this.acc=0;this.n=0;
  if(this.g.state!=='REAL')return; // only tune while driving
  if(avg<42){this.bad++;this.calm=0}else if(avg>56){this.calm++;this.bad=0}else{this.bad=0;this.calm=0}
  if(this.bad>=3&&this.lvl<this.cap){this.bad=0;this.lvl++;this.apply()}
  else if(this.calm>=6&&this.lvl>this.maxLvl){this.calm=0;this.lvl--;this.apply()}}
}
S.Quality=Quality;})(window.SS=window.SS||{});
