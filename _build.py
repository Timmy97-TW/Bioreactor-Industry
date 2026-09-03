#!/usr/bin/env python3
"""Assemble index.html from the parts, inlining CSS, JS and images.
Run: python3 _build.py"""
import pathlib, re, base64, mimetypes

d = pathlib.Path(__file__).parent
parts = sorted(p for p in d.glob('_p*.html'))
css = (d/'_base.css').read_text()
js  = (d/'_charts.js').read_text()
html = ''.join(p.read_text() for p in parts)
html = html.replace('__BASE_CSS__', css).replace('__CHARTS_JS__', js)

# inline every img/ reference so the page stays a single self-contained file
inlined = []
def datauri(m):
    rel = m.group(1)
    f = d / rel
    if not f.exists():
        raise SystemExit(f'missing asset: {rel}')
    mime = {'svg':'image/svg+xml','png':'image/png','webp':'image/webp',
            'jpg':'image/jpeg','jpeg':'image/jpeg'}[f.suffix.lstrip('.').lower()]
    b64 = base64.b64encode(f.read_bytes()).decode()
    inlined.append((rel, f.stat().st_size))
    return f'src="data:{mime};base64,{b64}"'
html = re.sub(r'src="(img/[^"]+)"', datauri, html)

(d/'index.html').write_text(html)
raw = sum(s for _, s in inlined)
print(f"built index.html  {len(html.encode()):,} bytes "
      f"from {len(parts)} parts, {len(inlined)} images inlined ({raw:,} bytes raw)")
