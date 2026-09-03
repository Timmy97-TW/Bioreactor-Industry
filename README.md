# The bioreactor industry in 2026

An industry report on the global bioreactor and biomanufacturing equipment market, written
for **GEMS Taiwan, iGEM 2026, project ReLeaf**. Light mode, bilingual English and 繁體中文,
fourteen original figures, single file, no dependencies and no network calls.

**Live:** https://timmy97-tw.github.io/Bioreactor-Industry/

## What it covers

| Section | Question it answers |
|---|---|
| 01 Market | How big is this industry, and why do nine publishers disagree by a factor of 4.3 |
| 02 The cycle | What the post-pandemic destocking did, and where the cycle sits in 2026 |
| 03 Players | Five layers, and why nobody bought a bioreactor company for its bioreactor |
| 04 Technology | Intensification, single-use, process analytics and digital twins, at four different stages |
| 05 Entrants | The challengers, the pivots to software, and the year's biggest reversal |
| 06 To 2035 | Policy, point of need, and the open hardware segment nobody sizes |
| 07 The farm | Brazil's on-farm bioinput movement and the contamination data from it |
| 08 ReLeaf | Where a farm-side reactor sits, and which earlier claims survive checking |
| 09 How to write it | Page order, homepage framing options, and the sentences to delete |

## Sourcing rule

Load-bearing claims come from company filings, peer-reviewed papers, regulator and government
documents, and named industry surveys. Commercial market-report landing pages are used only for
market sizing, always as a range with the publisher named, because none of them discloses a
methodology. Vendor performance claims are labelled as vendor claims. Sponsored content is named
as sponsored. Figures that could not be traced to a document were left out, and the report says
which ones those were. Research was carried out on 3 September 2026.

## Building

`index.html` is generated. Edit the parts, then rebuild:

```bash
python3 _build.py
```

- `_base.css` design system, kept consistent with the companion pages below
- `_charts.js` SVG figure renderers, no dependencies
- `_p*.html` sections, assembled in filename order
- `_build.py` inlines the CSS and JS and writes `index.html`

Every figure is drawn from a data literal inside `_p90_script.html`, so the numbers stay
auditable in one place.

## Companion pages

- [iGEM bioreactor landscape](https://timmy97-tw.github.io/igem-bioreactor-landscape/) — competitive audit of seventeen student bioreactor projects
- [Bioreactor invariant explorer](https://timmy97-tw.github.io/releaf-invariant-explorer/) — the scale-up model behind the ReLeaf design

## Licence

CC BY 4.0. Text and figures are original; the underlying publications carry their own terms.
