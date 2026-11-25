// Shared canvas textures (extracted from roam.js): building windows + light glows.
(function(S){'use strict';const T=THREE;
function ctex(w,h,fn,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=T.RepeatWrapping;if(rx)t.repeat.set(rx,ry||1);return t}
function mul32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function winTex(){const rn=mul32(11);const e=document.createElement('canvas');e.width=e.height=256;const y=e.getContext('2d');y.fillStyle='#000';y.fillRect(0,0,256,256);
  const t=ctex(256,256,(x,w,h)=>{x.fillStyle='#8f8a82';x.fillRect(0,0,w,h);for(let i=0;i<1800;i++){x.fillStyle='rgba('+(rn()<.5?'0,0,0':'255,255,255')+',.05)';x.fillRect(rn()*w,rn()*h,2,2)}
    const lit=['#ffd98a','#ffe9b8','#ffc46b','#bfe0ff','#ffd98a'];for(let r=0;r<4;r++)for(let q=0;q<4;q++){const px=22+q*58,py=22+r*58;x.fillStyle='#1b222c';x.fillRect(px,py,34,36);x.fillStyle='#46525f';x.fillRect(px,py,34,4);x.fillRect(px+16,py,2,36);
      if(rn()<.45){y.fillStyle=lit[Math.floor(rn()*lit.length)];y.fillRect(px+1,py+4,32,32)}}});
  const em=new T.CanvasTexture(e);em.encoding=T.sRGBEncoding;em.wrapS=em.wrapT=T.RepeatWrapping;em.anisotropy=4;return{map:t,em}}
function glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(255,190,110,.9)');g.addColorStop(.4,'rgba(255,160,70,.3)');g.addColorStop(1,'rgba(255,140,60,0)');x.fillStyle=g;x.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
S.winTex=winTex;S.glowTex=glowTex;})(window.SS=window.SS||{});
