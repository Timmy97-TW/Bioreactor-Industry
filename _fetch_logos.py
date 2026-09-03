import json, urllib.parse, subprocess, time, pathlib, re, html
API="https://commons.wikimedia.org/w/api.php"
UA="ReLeaf-iGEM-report/1.0 (https://github.com/Timmy97-TW/Bioreactor-Industry; educational)"
def api(params, tries=4):
    url=API+"?"+urllib.parse.urlencode(params)
    for t in range(tries):
        out=subprocess.run(["curl","-sL","-A",UA,url],capture_output=True,text=True).stdout
        if out.lstrip().startswith("{"):
            try: return json.loads(out)
            except Exception: pass
        time.sleep(15*(t+1))
    return {}
WANT=[("sartorius","File:Sartorius-Logo-2020.svg","Sartorius"),
 ("danaher","File:Danaher Corporation logo.svg","Danaher"),
 ("cytiva","File:Cytiva.svg","Cytiva"),
 ("merck","File:Logo Merck KGaA 2015.svg","Merck KGaA"),
 ("eppendorf","File:Eppendorf-Logo.svg","Eppendorf"),
 ("getinge","File:Getinge.svg","Getinge"),
 ("repligen","File:Repligen Logo.svg","Repligen"),
 ("ginkgo","File:Ginkgo Bioworks logo.svg","Ginkgo Bioworks"),
 ("bayer","File:Bayer Logo.svg","Bayer"),
 ("basf","File:BASF-Logo bw.svg","BASF"),
 ("boehringer","File:Boehringer Ingelheim Logo.svg","Boehringer Ingelheim"),
 ("terumo","File:Terumo.svg","Terumo"),
 ("corteva","File:Corteva-logo.webp","Corteva")]
# find a Thermo Fisher file too
r=api({"action":"query","format":"json","list":"search","srsearch":"Thermo Fisher Scientific logo",
       "srnamespace":"6","srlimit":"5"}); time.sleep(8)
for h_ in r.get("query",{}).get("search",[]):
    if "thermo" in h_["title"].lower():
        WANT.append(("thermofisher",h_["title"],"Thermo Fisher Scientific")); break
rows=[]
for slug,title,label in WANT:
    d=api({"action":"query","format":"json","titles":title,"prop":"imageinfo",
           "iiprop":"url|extmetadata"}); time.sleep(7)
    pg=list((d.get("query",{}).get("pages",{}) or {}).values())
    if not pg or "imageinfo" not in pg[0]:
        rows.append((slug,label,title,"NOT FOUND","","")); continue
    ii=pg[0]["imageinfo"][0]; em=ii.get("extmetadata",{})
    lic=em.get("LicenseShortName",{}).get("value","?")
    art=re.sub("<[^>]+>","",html.unescape(em.get("Artist",{}).get("value","") or "")).strip()[:60]
    if not any(k in lic.lower() for k in ["public domain","cc0","cc by"]):
        rows.append((slug,label,title,"REJECTED "+lic,"","")); continue
    ext=ii["url"].rsplit(".",1)[-1].lower()
    dest=f"img/logo-{slug}.{ext}"
    subprocess.run(["curl","-sL","-A",UA,"-o",dest,ii["url"]])
    time.sleep(3)
    sz=pathlib.Path(dest).stat().st_size if pathlib.Path(dest).exists() else 0
    rows.append((slug,label,title,lic,art,f"{dest} ({sz}B)"))
pathlib.Path("_logos_found.tsv").write_text("\n".join("\t".join(r) for r in rows))
for r in rows: print(f"{r[1][:24]:24s} | {r[3][:24]:24s} | {r[5]}")
