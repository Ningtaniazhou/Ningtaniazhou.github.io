"""Generate exact source-context evidence for manual punctuation review."""
import json, re, sys, unicodedata
from pathlib import Path
from pypdf import PdfReader
pdf=PdfReader(sys.argv[1]); ledger=json.loads(Path('localization/source-quotes.json').read_text())
records=[]
for q in ledger['quotes']:
 pages=q['pdfPages']; text='\n'.join(pdf.pages[p-1].extract_text() for p in pages)
 norm=''; mapping=[]
 for i,c in enumerate(text):
  if c.isalnum(): norm+=c.lower(); mapping.append(i)
 cursor=0; segments=[]
 for part in re.split(r'\[…\]',q['quote']):
  key=''.join(c.lower() for c in part if c.isalnum())
  if not key:continue
  start=norm.index(key,cursor);end=start+len(key);cursor=end
  a=mapping[start];b=mapping[end-1]+1
  segments.append({'game':part,'source':text[a:b], 'before':text[max(0,a-70):a], 'after':text[b:b+100]})
 records.append({'id':q['id'],'pages':pages,'segments':segments})
Path('localization/quotation-review.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
for r in records:
 print('\n'+r['id']+' PDF '+str(r['pages']))
 for s in r['segments']:
  clean=lambda x:re.sub(r'\s+',' ',x).strip()
  print('GAME '+clean(s['game'])+'\nPDF  '+clean(s['before'])+' ⟦'+clean(s['source'])+'⟧ '+clean(s['after']))
