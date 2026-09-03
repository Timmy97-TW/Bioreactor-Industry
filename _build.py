#!/usr/bin/env python3
"""Assemble index.html from the parts. Run: python3 _build.py"""
import pathlib, re
d = pathlib.Path(__file__).parent
parts = sorted(p for p in d.glob('_p*.html'))
css = (d/'_base.css').read_text()
js  = (d/'_charts.js').read_text()
html = ''.join(p.read_text() for p in parts)
html = html.replace('__BASE_CSS__', css).replace('__CHARTS_JS__', js)
(d/'index.html').write_text(html)
print(f"built index.html  {len(html):,} bytes from {len(parts)} parts: {[p.name for p in parts]}")
