import json, urllib.parse, subprocess, time, pathlib, re
API="https://commons.wikimedia.org/w/api.php"
UA="ReLeaf-iGEM-report/1.0 (https://github.com/Timmy97-TW/Bioreactor-Industry; educational)"
def get(params, tries=4):
    url=API+"?"+urllib.parse.urlencode(params)
    for t in range(tries):
        out=subprocess.run(["curl","-sL","-A",UA,url],capture_output=True,text=True).stdout
        if out.lstrip().startswith("{"):
            try: return json.loads(out)
            except Exception: pass
        time.sleep(12*(t+1))
    return {}
TARGETS=[("Eppendorf","Eppendorf logo"),("Getinge","Getinge logo"),("Repligen","Repligen logo"),
 ("Lonza","Lonza logo"),("WuXi Biologics","WuXi logo"),("Ginkgo Bioworks","Ginkgo Bioworks logo"),
 ("LanzaTech","LanzaTech logo"),("Corteva","Corteva logo"),("Bayer","Bayer logo"),
 ("Syngenta","Syngenta logo"),("BASF","BASF logo"),("Amgen","Amgen logo"),
 ("Boehringer Ingelheim","Boehringer Ingelheim logo"),("Pall","Pall Corporation logo"),
 ("Novonesis","Novonesis logo"),("Terumo","Terumo logo"),("Miltenyi Biotec","Miltenyi Biotec logo"),
 ("Cellares","Cellares logo"),("Sartorius Stedim","Sartorius Stedim Biotech logo")]
rows=[]
for name,q in TARGETS:
    r=get({"action":"query","format":"json","list":"search","srsearch":q,"srnamespace":"6","srlimit":"4"})
    hits=[h["title"] for h in r.get("query",{}).get("search",[])]
    time.sleep(8)
    if not hits:
        rows.append((name,"NO HIT","","")); continue
    r2=get({"action":"query","format":"json","titles":"|".join(hits),"prop":"imageinfo",
            "iiprop":"url|extmetadata"})
    time.sleep(8)
    picked=None
    for pid,pg in (r2.get("query",{}).get("pages",{}) or {}).items():
        ii=(pg.get("imageinfo") or [{}])[0]; em=ii.get("extmetadata",{})
        lic=em.get("LicenseShortName",{}).get("value","?")
        if any(k in lic.lower() for k in ["public domain","cc0","cc by"]):
            picked=(pg.get("title",""),lic,ii.get("url",""),ii.get("descriptionurl","")); break
    if picked: rows.append((name,picked[1],picked[0],picked[2]))
    else: rows.append((name,"no free licence found","",""))
pathlib.Path("_logos_found.tsv").write_text("\n".join("\t".join(r) for r in rows))
print("\n".join(f"{r[0]:22s} | {r[1][:26]:26s} | {r[2]}" for r in rows))
