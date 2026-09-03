/* ReLeaf · Bioreactor Industry Report · figure renderers
   Every figure is drawn from a data literal so the numbers stay auditable
   in one place. SVG only, no dependencies, light mode. */
(function(){
const NS='http://www.w3.org/2000/svg';
const C={ink:'#22261f',muted:'#5c6259',neutral:'#7d837a',rule:'#e2e5dd',rule2:'#c3c8bb',
  brand:'#66c902',brandDeep:'#4eaf02',accent:'#2f6b26',sky:'#2f6f9e',skyDeep:'#1d4f75',
  warn:'#9a5b12',bad:'#96302a',plum:'#6b3f7a',sand:'#8a7434',paper2:'#f4f5f1',paper3:'#eceee7',white:'#fff'};
const PAL=[C.accent,C.sky,C.warn,C.plum,C.sand,C.bad,C.brandDeep,C.neutral];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmt=(n,d)=>{d=(d===undefined)?0:d;return n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});};
function svg(w,h,body,cls){return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" class="fig ${cls||''}" preserveAspectRatio="xMidYMid meet" font-family="Inter,system-ui,sans-serif">${body}</svg>`;}
function txt(x,y,s,o){o=o||{};return `<text x="${x}" y="${y}" fill="${o.fill||C.muted}" font-size="${o.size||11}" font-weight="${o.weight||400}" text-anchor="${o.anchor||'start'}" font-family="${o.mono?'Geist Mono,ui-monospace,Menlo,monospace':'inherit'}" ${o.ls?`letter-spacing="${o.ls}"`:''} ${o.op?`opacity="${o.op}"`:''}>${esc(s)}</text>`;}
function line(x1,y1,x2,y2,o){o=o||{};return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke||C.rule}" stroke-width="${o.w||1}" ${o.dash?`stroke-dasharray="${o.dash}"`:''} ${o.cap?`stroke-linecap="${o.cap}"`:''}/>`;}
function rect(x,y,w,h,o){o=o||{};return `<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" fill="${o.fill||C.brand}" ${o.r?`rx="${o.r}"`:''} ${o.stroke?`stroke="${o.stroke}" stroke-width="${o.sw||1}"`:''} ${o.op?`opacity="${o.op}"`:''}/>`;}

/* ── horizontal bars, optional range whisker ─────────────── */
window.hbar=function(d,o){
  o=o||{}; const W=o.w||760, labW=o.labW||190, valW=o.valW||96, rowH=o.rowH||30, pad=o.pad||14;
  const H=pad*2+d.length*rowH+(o.axis?22:0);
  const max=o.max||Math.max(...d.map(r=>Math.max(r.v,r.hi||0)))*1.02;
  const x0=labW, plotW=W-labW-valW;
  let s='';
  if(o.gridAt) o.gridAt.forEach(g=>{const gx=x0+plotW*g/max; s+=line(gx,pad-4,gx,H-pad-(o.axis?18:0),{stroke:C.rule,dash:'2 3'});
    s+=txt(gx,H-pad-(o.axis?6:-8),o.gridFmt?o.gridFmt(g):fmt(g),{size:9.5,anchor:'middle',fill:C.neutral,mono:1});});
  d.forEach((r,i)=>{
    const y=pad+i*rowH, cy=y+rowH/2, bh=o.bh||13, by=cy-bh/2;
    s+=txt(labW-10,cy+4,r.k,{anchor:'end',size:11.5,fill:r.hi2?C.ink:C.muted,weight:r.em?650:400});
    if(r.lo!==undefined&&r.hi!==undefined){
      s+=line(x0+plotW*r.lo/max,cy,x0+plotW*r.hi/max,cy,{stroke:C.rule2,w:5,cap:'round'});
    }
    s+=rect(x0,by,plotW*r.v/max,bh,{fill:r.c||(r.em?C.accent:C.brand),r:2});
    s+=txt(W-8,cy+4,r.lab!==undefined?r.lab:fmt(r.v,o.dp),{anchor:'end',size:11,fill:C.ink,mono:1,weight:r.em?650:400});
  });
  return svg(W,H,s);
};

/* ── grouped vertical bars over categories ───────────────── */
window.gbar=function(cats,series,o){
  o=o||{}; const W=o.w||760,H=o.h||300,L=o.L||48,R=14,T=o.T||24,B=o.B||44;
  const max=o.max||Math.max(...series.flatMap(s=>s.v))*1.1;
  const pw=(W-L-R)/cats.length, gw=pw*0.72, bw=gw/series.length;
  let s='';
  const ticks=o.ticks||4;
  for(let i=0;i<=ticks;i++){const v=max*i/ticks,y=H-B-(H-B-T)*i/ticks;
    s+=line(L,y,W-R,y,{stroke:i?C.rule:C.rule2});
    s+=txt(L-8,y+3.5,o.yfmt?o.yfmt(v):fmt(v),{anchor:'end',size:9.5,mono:1,fill:C.neutral});}
  cats.forEach((c,i)=>{
    const gx=L+pw*i+(pw-gw)/2;
    series.forEach((se,j)=>{const v=se.v[i]; if(v===null||v===undefined)return;
      const h=(H-B-T)*v/max; s+=rect(gx+bw*j,H-B-h,bw-2,h,{fill:se.c||PAL[j],r:1.5});});
    s+=txt(L+pw*i+pw/2,H-B+16,c,{anchor:'middle',size:10.5,fill:C.muted});});
  if(o.legend!==false){let lx=L; series.forEach((se,j)=>{
      s+=rect(lx,T-18,9,9,{fill:se.c||PAL[j],r:1.5});
      s+=txt(lx+13,T-10,se.k,{size:10.5,fill:C.muted}); lx+=se.k.length*6.1+30;});}
  if(o.ylab) s+=txt(12,T-8,o.ylab,{size:9.5,mono:1,fill:C.neutral,ls:'.06em'});
  return svg(W,H,s);
};

/* ── multi-series line chart ─────────────────────────────── */
window.lines=function(xs,series,o){
  o=o||{}; const W=o.w||760,H=o.h||320,L=o.L||52,R=o.R||96,T=o.T||26,B=44;
  const vals=series.flatMap(s=>s.v.filter(v=>v!==null&&v!==undefined));
  const max=o.max!==undefined?o.max:Math.max(...vals)*1.08, min=o.min!==undefined?o.min:0;
  const X=i=>L+(W-L-R)*i/(xs.length-1), Y=v=>H-B-(H-B-T)*(v-min)/(max-min);
  let s='';
  const ticks=o.ticks||4;
  for(let i=0;i<=ticks;i++){const v=min+(max-min)*i/ticks,y=Y(v);
    s+=line(L,y,W-R,y,{stroke:i?C.rule:C.rule2});
    s+=txt(L-8,y+3.5,o.yfmt?o.yfmt(v):fmt(v),{anchor:'end',size:9.5,mono:1,fill:C.neutral});}
  if(o.mark) o.mark.forEach(m=>{const mx=X(m.i);
    s+=line(mx,T-6,mx,H-B,{stroke:C.rule2,dash:'3 3'});
    s+=txt(mx+4,T+2,m.k,{size:9.5,fill:C.neutral,mono:1});});
  if(o.base!==undefined) s+=line(L,Y(o.base),W-R,Y(o.base),{stroke:C.rule2,dash:'4 3'});
  xs.forEach((x,i)=>{ if(o.everyX&&i%o.everyX)return;
    s+=txt(X(i),H-B+16,x,{anchor:'middle',size:10,fill:C.muted});});
  series.forEach((se,j)=>{
    const pts=se.v.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean);
    const dd=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const col=se.c||PAL[j];
    if(se.area) s+=`<path d="${dd} L ${pts[pts.length-1][0]} ${Y(min)} L ${pts[0][0]} ${Y(min)} Z" fill="${col}" opacity=".08"/>`;
    s+=`<path d="${dd}" fill="none" stroke="${col}" stroke-width="${se.w||2}" stroke-linejoin="round" stroke-linecap="round" ${se.dash?`stroke-dasharray="${se.dash}"`:''}/>`;
    if(se.dot!==false) pts.forEach(p=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="${C.white}" stroke="${col}" stroke-width="1.6"/>`;});
    const last=pts[pts.length-1];
    s+=txt(last[0]+9,last[1]+4,se.k,{size:10.5,fill:col,weight:600});
  });
  if(o.ylab) s+=txt(12,T-10,o.ylab,{size:9.5,mono:1,fill:C.neutral,ls:'.06em'});
  return svg(W,H,s);
};

/* ── 2x2 positioning scatter ─────────────────────────────── */
window.matrix=function(pts,o){
  o=o||{}; const W=o.w||760,H=o.h||520,L=92,R=28,T=34,B=64;
  const X=v=>L+(W-L-R)*v/100, Y=v=>H-B-(H-B-T)*v/100;
  let s='';
  s+=rect(L,T,W-L-R,H-B-T,{fill:C.paper2,r:4});
  if(o.quad) o.quad.forEach(q=>{
    s+=rect(X(q.x0),Y(q.y1),X(q.x1)-X(q.x0),Y(q.y0)-Y(q.y1),{fill:q.c,op:q.op||.5,r:3});
    if(q.k){ const br=q.at==='br';
      s+=txt(br?X(q.x1)-12:X(q.x0)+10, br?Y(q.y0)-12:Y(q.y1)+18, q.k,
             {size:10,mono:1,fill:C.neutral,ls:'.08em',anchor:br?'end':'start'});}});
  s+=line(X(50),T,X(50),H-B,{stroke:C.rule2,dash:'4 4'});
  s+=line(L,Y(50),W-R,Y(50),{stroke:C.rule2,dash:'4 4'});
  s+=line(L,H-B,W-R,H-B,{stroke:C.rule2}); s+=line(L,T,L,H-B,{stroke:C.rule2});
  pts.forEach(p=>{
    const x=X(p.x),y=Y(p.y),r=p.r||6;
    if(p.halo) s+=`<circle cx="${x}" cy="${y}" r="${r+7}" fill="${p.c||C.brand}" opacity=".16"/>`;
    s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.c||C.sky}" stroke="${C.white}" stroke-width="1.6"/>`;
    const ax=p.lx||0, ay=p.ly||-12;
    s+=txt(x+ax,y+ay,p.k,{size:p.em?12:10.8,anchor:p.anchor||'middle',fill:p.em?C.ink:C.muted,weight:p.em?650:500});
    if(p.k2) s+=txt(x+ax,y+ay+12,p.k2,{size:9.5,anchor:p.anchor||'middle',fill:C.neutral});
  });
  s+=txt((L+W-R)/2,H-18,o.xlab||'',{anchor:'middle',size:10.5,fill:C.muted,weight:600});
  s+=txt(-(T+H-B)/2,20,o.ylab||'',{anchor:'middle',size:10.5,fill:C.muted,weight:600});
  s=s.replace(/<text x="-([\d.]+)" y="20"/, '<text transform="rotate(-90)" x="-$1" y="20"');
  s+=txt(L,H-36,o.xlo||'',{size:9.5,mono:1,fill:C.neutral});
  s+=txt(W-R,H-36,o.xhi||'',{size:9.5,mono:1,fill:C.neutral,anchor:'end'});
  return svg(W,H,s);
};

/* ── stacked horizontal composition ──────────────────────── */
window.stack=function(rows,keys,o){
  o=o||{}; const W=o.w||760,labW=o.labW||150,rowH=o.rowH||34,pad=14;
  const H=pad*2+rows.length*rowH+26;
  let s='';
  rows.forEach((r,i)=>{
    const y=pad+i*rowH+20, tot=keys.reduce((a,k)=>a+(r[k.k]||0),0);
    s+=txt(labW-10,y+12,r.name,{anchor:'end',size:11.5,fill:C.ink,weight:r.em?650:400});
    let x=labW;
    keys.forEach((k,j)=>{const v=r[k.k]||0, w=(W-labW-8)*v/(o.total||tot);
      if(w>0){s+=rect(x,y,w-1,17,{fill:k.c||PAL[j],r:1.5});
        if(w>34) s+=txt(x+w/2,y+12,o.cellfmt?o.cellfmt(v):fmt(v),{anchor:'middle',size:9.5,fill:C.white,mono:1,weight:600});}
      x+=w;});
  });
  let lx=labW;
  keys.forEach((k,j)=>{s+=rect(lx,pad,9,9,{fill:k.c||PAL[j],r:1.5});
    s+=txt(lx+13,pad+8,k.k2||k.k,{size:10.5,fill:C.muted}); lx+=(k.k2||k.k).length*6.1+30;});
  return svg(W,H,s);
};

/* ── event timeline ──────────────────────────────────────── */
window.timeline=function(ev,o){
  o=o||{}; const W=o.w||760, lanes=o.lanes||[], laneH=o.laneH||86, T=54;
  const H=T+lanes.length*laneH+26, L=126, R=26;
  const ink=o.dark?'#f1f4ee':C.ink, sub=o.dark?'#b4beb0':C.neutral,
        rule=o.dark?'#2b3f3e':C.rule, rule2=o.dark?'#3b514f':C.rule2, ring=o.dark?'#152b2b':'#fff';
  const y0=o.y0, y1=o.y1, X=y=>L+(W-L-R)*(y-y0)/(y1-y0);
  let s='';
  for(let y=Math.ceil(y0);y<=y1;y++){s+=line(X(y),T-18,X(y),H-22,{stroke:rule});
    s+=txt(X(y),T-24,y,{anchor:'middle',size:10,mono:1,fill:sub});}
  lanes.forEach((ln,i)=>{
    const ly=T+i*laneH+laneH/2;
    s+=txt(L-14,ly+4,ln.k,{anchor:'end',size:11,fill:ink,weight:600});
    s+=line(L,ly,W-R,ly,{stroke:rule2,dash:'1 4'});
  });
  ev.forEach(e=>{
    const ly=T+e.lane*laneH+laneH/2, x=X(e.t), dy=(e.dy!==undefined)?e.dy:22;
    const up=dy<0, ax=x+(e.dx||0), an=e.anchor||'middle';
    s+=line(x,ly,ax,ly+dy-(up?-3:3),{stroke:rule2});
    s+=`<circle cx="${x}" cy="${ly}" r="5" fill="${e.c||C.brand}" stroke="${ring}" stroke-width="1.5"/>`;
    if(up && e.k2) s+=txt(ax,ly+dy-11,e.k2,{anchor:an,size:9,fill:sub});
    s+=txt(ax,ly+dy,e.k,{anchor:an,size:10.5,fill:ink,weight:600});
    if(!up && e.k2) s+=txt(ax,ly+dy+11,e.k2,{anchor:an,size:9,fill:sub});
  });
  return svg(W,H,s);
};

/* ── slope / dumbbell comparison ─────────────────────────── */
window.dumbbell=function(d,o){
  o=o||{}; const W=o.w||760,labW=o.labW||210,rowH=o.rowH||30,pad=22,R=110;
  const H=pad*2+d.length*rowH+16;
  const max=o.max||Math.max(...d.flatMap(r=>[r.a,r.b]))*1.05;
  const X=v=>labW+(W-labW-R)*v/max;
  let s='';
  (o.gridAt||[]).forEach(g=>{s+=line(X(g),pad-8,X(g),H-pad,{stroke:C.rule,dash:'2 3'});
    s+=txt(X(g),pad-12,o.gridFmt?o.gridFmt(g):fmt(g),{anchor:'middle',size:9.5,mono:1,fill:C.neutral});});
  d.forEach((r,i)=>{const y=pad+i*rowH+rowH/2;
    s+=txt(labW-12,y+4,r.k,{anchor:'end',size:11.5,fill:C.ink});
    s+=line(X(r.a),y,X(r.b),y,{stroke:C.rule2,w:2.5,cap:'round'});
    s+=`<circle cx="${X(r.a)}" cy="${y}" r="5" fill="${C.white}" stroke="${o.ca||C.neutral}" stroke-width="2"/>`;
    s+=`<circle cx="${X(r.b)}" cy="${y}" r="5.5" fill="${o.cb||C.accent}"/>`;
    s+=txt(W-8,y+4,r.lab||'',{anchor:'end',size:10.5,mono:1,fill:C.muted});});
  if(o.legend){s+=`<circle cx="${labW+6}" cy="${H-4}" r="4.5" fill="${C.white}" stroke="${o.ca||C.neutral}" stroke-width="2"/>`;
    s+=txt(labW+16,H,o.legend[0],{size:10,fill:C.muted});
    s+=`<circle cx="${labW+110}" cy="${H-4}" r="5" fill="${o.cb||C.accent}"/>`;
    s+=txt(labW+120,H,o.legend[1],{size:10,fill:C.muted});}
  return svg(W,H+10,s);
};

/* ── vessels drawn to scale, two panels at stated magnification ── */
window.vessels=function(panels,o){
  o=o||{}; const W=o.w||760; let s='', y=0;
  panels.forEach((pn,pi)=>{
    const px=pn.px;                      // pixels per metre in this panel
    const items=pn.items.map(it=>{
      // H/D = 2 unless the item states its own geometry
      const V=it.L/1000;                 // m3
      const D=it.d||Math.cbrt(2*V/Math.PI), H=it.h||2*D;
      return Object.assign({},it,{D:D,H:H});
    });
    const maxH=Math.max(...items.map(i=>i.H), pn.ref?pn.ref.h:0);
    const base=y+30+maxH*px, panelH=maxH*px+92;
    s+=txt(0,y+12,pn.k,{size:11,weight:650,fill:C.ink});
    s+=txt(0,y+26,pn.k2||'',{size:9.5,mono:1,fill:C.neutral,ls:'.06em'});
    // metre rule
    const rulesteps=pn.rule||[]; let ruleTxt='';
    rulesteps.forEach(m=>{const ry=base-m*px;
      s+=line(0,ry,W-46,ry,{stroke:C.rule,dash:'2 4'});
      ruleTxt+=rect(W-44,ry-11,44,14,{fill:C.white,op:.92,r:2});
      ruleTxt+=txt(W,ry-2,pn.ruleFmt?pn.ruleFmt(m):(m+' m'),{size:9,mono:1,fill:C.neutral,anchor:'end'});});
    s+=line(0,base,W,base,{stroke:C.rule2});
    let x=pn.x0||14;
    if(pn.ref){ // human or ruler silhouette
      const hh=pn.ref.h*px, hw=hh*0.26;
      s+=`<g opacity=".62" fill="${C.neutral}"><circle cx="${x+hw/2}" cy="${base-hh*0.92}" r="${hh*0.075}"/>`+
         `<rect x="${x+hw*0.28}" y="${base-hh*0.845}" width="${hw*0.44}" height="${hh*0.42}" rx="${hw*0.14}"/>`+
         `<rect x="${x+hw*0.33}" y="${base-hh*0.44}" width="${hw*0.14}" height="${hh*0.44}" rx="${hw*0.06}"/>`+
         `<rect x="${x+hw*0.53}" y="${base-hh*0.44}" width="${hw*0.14}" height="${hh*0.44}" rx="${hw*0.06}"/></g>`;
      s+=txt(x+hw/2,base+14,pn.ref.k,{size:9,anchor:'middle',fill:C.neutral,mono:1});
      x+=hw+42;
    }
    items.forEach(it=>{
      const w=Math.max(it.D*px,3), h=Math.max(it.H*px,4), col=it.c||C.sky;
      const top=base-h, r=Math.min(w/2,h/2);
      s+=`<path d="M ${x} ${top+r} a ${w/2} ${r} 0 0 1 ${w} 0 v ${h-2*r} a ${w/2} ${r*0.9} 0 0 1 ${-w} 0 Z" fill="${col}" opacity=".2"/>`;
      s+=`<path d="M ${x} ${top+r} a ${w/2} ${r} 0 0 1 ${w} 0 v ${h-2*r} a ${w/2} ${r*0.9} 0 0 1 ${-w} 0 Z" fill="none" stroke="${col}" stroke-width="1.4"/>`;
      s+=`<ellipse cx="${x+w/2}" cy="${top+r}" rx="${w/2}" ry="${r}" fill="none" stroke="${col}" stroke-width="1.4"/>`;
      s+=txt(x+w/2,base+14,it.lab,{size:9.5,anchor:'middle',fill:C.ink,mono:1,weight:600});
      if(it.k) s+=txt(x+w/2,base+26,it.k,{size:9,anchor:'middle',fill:C.neutral});
      x+=w+(it.gap||30);
    });
    s+=ruleTxt;
    y+=panelH+(pn.pad||30);
  });
  return svg(W,y,s);
};

/* ── architecture cross-sections, 100x100 local units each ────── */
const ARCH={
 stirred:c=>`<rect x="24" y="16" width="52" height="66" rx="4" fill="none" stroke="${c}" stroke-width="2"/>
   <path d="M24 74 q26 16 52 0" fill="none" stroke="${c}" stroke-width="2"/>
   <line x1="50" y1="6" x2="50" y2="72" stroke="${c}" stroke-width="2"/>
   <rect x="42" y="2" width="16" height="9" rx="2" fill="${c}"/>
   <g stroke="${c}" stroke-width="2"><line x1="36" y1="40" x2="64" y2="40"/><line x1="36" y1="60" x2="64" y2="60"/>
   <line x1="36" y1="36" x2="36" y2="44"/><line x1="64" y1="36" x2="64" y2="44"/>
   <line x1="36" y1="56" x2="36" y2="64"/><line x1="64" y1="56" x2="64" y2="64"/></g>
   <path d="M34 78 h32" stroke="${c}" stroke-width="1.6"/>
   <g fill="${c}" opacity=".55"><circle cx="38" cy="70" r="2"/><circle cx="46" cy="64" r="2"/><circle cx="55" cy="68" r="2"/><circle cx="62" cy="60" r="2"/><circle cx="43" cy="52" r="2"/><circle cx="58" cy="48" r="2"/></g>`,
 wave:c=>`<g transform="rotate(-9 50 55)"><rect x="14" y="42" width="72" height="30" rx="12" fill="none" stroke="${c}" stroke-width="2"/>
   <path d="M16 60 q12 -12 24 0 t24 0 t20 -2 v10 q-10 4 -22 0 t-24 0 t-22 2 Z" fill="${c}" opacity=".28"/>
   <rect x="10" y="74" width="80" height="7" rx="2" fill="${c}" opacity=".5"/></g>
   <path d="M14 90 q12 -8 24 0" fill="none" stroke="${c}" stroke-width="1.6" opacity=".7"/>
   <path d="M62 90 q12 -8 24 0" fill="none" stroke="${c}" stroke-width="1.6" opacity=".7"/>`,
 wheel:c=>`<path d="M22 20 h56 v40 a28 28 0 0 1 -56 0 Z" fill="none" stroke="${c}" stroke-width="2"/>
   <circle cx="50" cy="52" r="23" fill="none" stroke="${c}" stroke-width="2"/>
   <circle cx="50" cy="52" r="3.5" fill="${c}"/>
   <g stroke="${c}" stroke-width="2">${[0,60,120,180,240,300].map(a=>{const r1=6,r2=23,rad=a*Math.PI/180;
     return `<line x1="${50+r1*Math.cos(rad)}" y1="${52+r1*Math.sin(rad)}" x2="${50+r2*Math.cos(rad)}" y2="${52+r2*Math.sin(rad)}"/>`;}).join('')}</g>
   <path d="M78 34 a30 30 0 0 1 -6 34" fill="none" stroke="${c}" stroke-width="1.4" opacity=".6" marker-end=""/>`,
 airlift:c=>`<rect x="28" y="12" width="44" height="72" rx="4" fill="none" stroke="${c}" stroke-width="2"/>
   <rect x="42" y="26" width="16" height="48" fill="none" stroke="${c}" stroke-width="1.8" opacity=".85"/>
   <g stroke="${c}" stroke-width="1.6" fill="none" opacity=".75">
     <path d="M50 70 v-38"/><path d="M46 38 l4 -6 l4 6"/>
     <path d="M36 34 v38"/><path d="M32 66 l4 6 l4 -6"/>
     <path d="M64 34 v38"/><path d="M60 66 l4 6 l4 -6"/></g>
   <g fill="${c}" opacity=".5"><circle cx="47" cy="70" r="1.8"/><circle cx="52" cy="62" r="1.8"/><circle cx="49" cy="54" r="1.8"/><circle cx="53" cy="46" r="1.8"/></g>
   <path d="M50 92 v-8" stroke="${c}" stroke-width="1.8"/><text x="50" y="99" font-size="8" fill="${c}" text-anchor="middle">gas</text>`,
 hollow:c=>`<rect x="12" y="34" width="76" height="30" rx="6" fill="none" stroke="${c}" stroke-width="2"/>
   <rect x="4" y="38" width="10" height="22" rx="3" fill="${c}" opacity=".35"/>
   <rect x="86" y="38" width="10" height="22" rx="3" fill="${c}" opacity=".35"/>
   <g stroke="${c}" stroke-width="1.5" opacity=".9">${[40,45,50,55,60].map(yy=>`<line x1="14" y1="${yy}" x2="86" y2="${yy}"/>`).join('')}</g>
   <path d="M0 49 h6" stroke="${c}" stroke-width="2"/><path d="M94 49 h6" stroke="${c}" stroke-width="2"/>
   <g stroke="${c}" stroke-width="1.6" opacity=".8"><path d="M34 34 v-10"/><path d="M30 28 l4 -6 l4 6"/>
   <path d="M66 64 v10"/><path d="M62 70 l4 6 l4 -6"/></g>
   <text x="50" y="18" font-size="8" fill="${c}" text-anchor="middle">permeate</text>
   <text x="50" y="88" font-size="8" fill="${c}" text-anchor="middle">cells retained</text>`,
 biofilm:c=>`<rect x="26" y="14" width="48" height="70" rx="4" fill="none" stroke="${c}" stroke-width="2"/>
   <g stroke="${c}" stroke-width="1.6">${[26,40,54,68].map(yy=>`<line x1="30" y1="${yy}" x2="70" y2="${yy}"/>`).join('')}</g>
   <g fill="${c}" opacity=".45">${[26,40,54,68].map(yy=>`<rect x="30" y="${yy}" width="40" height="4" rx="2"/>`).join('')}</g>
   <g stroke="${c}" stroke-width="1.8"><path d="M50 4 v8"/><path d="M46 8 l4 -5 l4 5" fill="none"/>
   <path d="M50 84 v10"/><path d="M46 89 l4 6 l4 -6" fill="none"/></g>`,
 gas:c=>`<rect x="26" y="10" width="26" height="74" rx="4" fill="none" stroke="${c}" stroke-width="2"/>
   <rect x="62" y="26" width="14" height="58" rx="4" fill="none" stroke="${c}" stroke-width="2"/>
   <path d="M52 20 h24 v8" fill="none" stroke="${c}" stroke-width="2"/>
   <path d="M52 78 h10" fill="none" stroke="${c}" stroke-width="2"/>
   <g fill="${c}" opacity=".5"><circle cx="33" cy="72" r="2"/><circle cx="42" cy="64" r="2"/><circle cx="36" cy="54" r="2"/><circle cx="44" cy="44" r="2"/><circle cx="34" cy="34" r="2"/></g>
   <path d="M39 92 v-8" stroke="${c}" stroke-width="1.8"/>
   <text x="39" y="99" font-size="8" fill="${c}" text-anchor="middle">CO / CO₂</text>`
};
window.archgrid=function(items,o){
  o=o||{}; const W=o.w||760, cols=o.cols||4, cw=W/cols, ch=o.ch||188;
  const rows=Math.ceil(items.length/cols); let s='';
  items.forEach((it,i)=>{
    const cx=(i%cols)*cw, cy=Math.floor(i/cols)*ch, col=it.c||C.sky;
    s+=`<g transform="translate(${cx+cw/2-56},${cy+8}) scale(1.12)">${ARCH[it.a](col)}</g>`;
    s+=txt(cx+cw/2,cy+140,it.k,{size:11,anchor:'middle',weight:650,fill:C.ink});
    (it.k2||'').split('\n').forEach((l,j)=>{
      s+=txt(cx+cw/2,cy+155+j*12,l,{size:9.5,anchor:'middle',fill:C.muted});});
    if(it.em) s+=rect(cx+6,cy+2,cw-12,ch-14,{fill:'none',stroke:C.brand,sw:1.5,r:6});
  });
  return svg(W,rows*ch,s);
};

/* ── hollow-fibre bundle cross-sections, drawn to scale ───────── */
window.fibres=function(o){
  o=o||{}; const W=o.w||760,H=336; const PPM=o.ppm||34;  // px per mm
  let s='';
  // ReLeaf: 11 fibres, 1.0 mm bore, hex-ish packing inside a shell
  const cx=126, cy=140, rb=0.5*PPM, wall=0.22*PPM;
  const ring=[[0,0]]; for(let k=0;k<5;k++){const a=k*72*Math.PI/180; ring.push([1.5*Math.cos(a),1.5*Math.sin(a)]);}
  for(let k=0;k<5;k++){const a=(k*72+36)*Math.PI/180; ring.push([2.6*Math.cos(a),2.6*Math.sin(a)]);}
  const shellR=3.5*PPM;
  s+=`<circle cx="${cx}" cy="${cy}" r="${shellR}" fill="${C.paper3}" stroke="${C.rule2}" stroke-width="1.5"/>`;
  ring.forEach(pt=>{const fx=cx+pt[0]*PPM, fy=cy+pt[1]*PPM;
    s+=`<circle cx="${fx}" cy="${fy}" r="${rb+wall}" fill="${C.accent}" opacity=".28"/>`;
    s+=`<circle cx="${fx}" cy="${fy}" r="${rb}" fill="${C.white}" stroke="${C.accent}" stroke-width="1.2"/>`;});
  s+=txt(cx,cy+shellR+24,'ReLeaf HFM-01',{anchor:'middle',size:11.5,weight:650,fill:C.ink});
  s+=txt(cx,cy+shellR+38,'11 fibres · 1.0 mm bore · 0.02 m²',{anchor:'middle',size:9.5,mono:1,fill:C.neutral});
  s+=line(cx-rb,cy-0.5*PPM-10,cx+rb,cy-0.5*PPM-10,{stroke:C.ink,w:1});
  s+=txt(cx,cy-0.5*PPM-15,'1.0 mm',{anchor:'middle',size:9,mono:1,fill:C.ink});
  // Terumo detail patch, same scale: 200 um fibres hex packed
  const px0=316, py0=68, patch=136, d=0.2*PPM, pitch=0.26*PPM;
  s+=`<clipPath id="pf"><rect x="${px0}" y="${py0}" width="${patch}" height="${patch}" rx="4"/></clipPath>`;
  s+=rect(px0,py0,patch,patch,{fill:C.paper3,r:4,stroke:C.rule2,sw:1.5});
  let g='';
  for(let r=0;r<Math.ceil(patch/(pitch*0.87))+1;r++)for(let c2=0;c2<Math.ceil(patch/pitch)+1;c2++){
    const fx=px0+c2*pitch+(r%2?pitch/2:0), fy=py0+r*pitch*0.87;
    g+=`<circle cx="${fx}" cy="${fy}" r="${d/2}" fill="none" stroke="${C.sky}" stroke-width=".9"/>`;}
  s+=`<g clip-path="url(#pf)">${g}</g>`;
  s+=txt(px0+patch/2,py0+patch+20,'Terumo BCT Quantum Flex',{anchor:'middle',size:11.5,weight:650,fill:C.ink});
  s+=txt(px0+patch/2,py0+patch+34,'~11,500 fibres · ~200 µm bore · 2.1 m²',{anchor:'middle',size:9.5,mono:1,fill:C.neutral});
  s+=txt(px0+patch/2,py0+patch+48,'drawn at the same scale, one patch of the bundle',{anchor:'middle',size:9,fill:C.neutral});
  // membrane area bar
  const bx=522, bw=160, by=76;
  s+=txt(bx,by-14,'MEMBRANE AREA',{size:9,mono:1,ls:'.1em',fill:C.neutral});
  [['Terumo Quantum Flex',2.1,C.sky],['FiberCell C2018',1.2,C.plum],['ReLeaf HFM-01',0.02,C.accent]]
    .forEach((r,i)=>{const y=by+i*46;
      s+=txt(bx,y,r[0],{size:10,fill:C.ink});
      s+=rect(bx,y+6,Math.max(bw*r[1]/2.1,2),13,{fill:r[2],r:2});
      s+=txt(bx+bw+8,y+16,r[1].toFixed(2)+' m²',{size:10,mono:1,fill:C.ink,anchor:'start'});});
  s+=txt(bx,by+152,'0.02 m² is 0.95 % of 2.1 m².',{size:9.5,fill:C.muted});
  s+=txt(bx,by+166,'Same architecture, two orders apart.',{size:9.5,fill:C.muted});
  s+=txt(cx,cy+shellR+52,'shell diameter is not published; drawn to hold the fibres',{anchor:'middle',size:8.5,fill:C.neutral});
  return svg(W,H,s);
};

window.CHARTC=C;
})();
