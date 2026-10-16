// One-time removal of redundant translated quote fields. Structural IDs stay intact.
import fs from 'node:fs';
for(const f of ['app/page.tsx','app/camilloff-intercut.tsx','app/camilloff-return-map.tsx']){
 let s=fs.readFileSync(f,'utf8').replaceAll('BilingualQuote','SourceQuote')
  .replaceAll(' zh=""','').replaceAll(' zh={currentRoute.zh}','')
  .replaceAll(' zh: string;','').replaceAll('; zh: string','')
  .replace(/\n\s*zh: "",/g,'');
 fs.writeFileSync(f,s);
}
