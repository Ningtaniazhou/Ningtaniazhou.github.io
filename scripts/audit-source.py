"""Read-only PDF comparison; writes an editorial ledger, not game content.
Usage: python3 scripts/audit-source.py SOURCE.pdf CHINESE_INVENTORY.json
Normalised matches do not certify punctuation or editorial omissions.
"""
import json, re, sys, unicodedata
from pathlib import Path
from pypdf import PdfReader

def normal(s):
    return ''.join(c for c in unicodedata.normalize('NFC',s).lower() if c.isalnum())

pdf, inventory=sys.argv[1:]
existing=Path('localization/source-quotes.json')
if existing.exists() and any(q.get('verification')=='pdf-text-and-visual-reviewed' for q in json.loads(existing.read_text()).get('quotes',[])):
    raise SystemExit('Final editorial ledger exists; do not overwrite it with the initial automated audit.')
pages=[p.extract_text() or '' for p in PdfReader(pdf).pages]
norm=[normal(p) for p in pages]
rows=json.loads(Path(inventory).read_text())['rows']
corrections={
 'OM-0080':('ouro vivo','oiro vivo'),
 'OM-0492':('! É uma vasta','! E uma vasta'),
 'OM-0497':('velha Pequim...','velha Pequim […]'),
 'OM-0632':('um engano...','um engano […]'),
 'OM-0634':('Grande Muralha...','Grande Muralha […]'),
}
ledger=[]
for row in rows:
    if not row.get('original'): continue
    q=row['original']
    if row['id'] in corrections: q=q.replace(*corrections[row['id']])
    parts=[normal(s) for s in re.split(r'\[…\]|\[\.\.\.\]',q) if normal(s)]
    matches=[]
    for start in range(len(pages)):
        # A quote may cross one page boundary; preserve page-number convention.
        text=''.join(norm[start:start+2]); pos=0; ok=True
        for part in parts:
            index=text.find(part,pos)
            if index<0: ok=False; break
            pos=index+len(part)
        if ok:
            first=text.find(parts[0]); firstpage=start+1+(first>=len(norm[start]))
            lastpage=start+1+(pos>len(norm[start]))
            match=list(range(firstpage,lastpage+1))
            if match not in matches: matches.append(match)
    ledger.append({'id':row['id'],'file':row['file'],'stage':row['stage'],
        'kind':'source-quotation','quote':q,'pdfPages':min(matches,key=len) if matches else [],
        'verification':'normalised-letter-match' if matches else 'needs-review',
        'editorialNote': 'Visually checked PDF p. 46: source prints E, not É.' if row['id']=='OM-0492' else 'Visually checked PDF p. 59: oiro.' if row['id']=='OM-0080' else ''})
Path('localization/source-quotes.json').write_text(json.dumps({'source':Path(pdf).name,'pageConvention':'PDF page index, 1-based; not printed pagination','limits':'Letter-level comparison ignores punctuation and spaces. Full punctuation/omission review remains editorial work.','quotes':ledger},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'total':len(ledger),'matched':sum(bool(r['pdfPages']) for r in ledger),'unmatched':[r['id'] for r in ledger if not r['pdfPages']]},ensure_ascii=False))
