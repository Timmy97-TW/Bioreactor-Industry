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
window.CHARTC=C;
})();
