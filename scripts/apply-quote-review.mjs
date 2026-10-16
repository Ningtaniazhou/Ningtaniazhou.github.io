// Editorial decisions after reading all 37 relevant PDF pages, 1-based indexing.
import fs from 'node:fs';
const ledger=JSON.parse(fs.readFileSync('localization/source-quotes.json','utf8'));
const changes={
 'OM-0101':[['Tinha tomado','tinha tomado'],'Retain source lowercase at the start of this mid-sentence excerpt.'],
 'OM-0160':[['relva verde; e','relva verde: e'],'Restore colon from PDF p.17.'],
 'OM-0214':[['Ti Chin-Fu...','Ti Chin-Fu […]'],'Truncated before source semicolon; mark editorial omission.'],
 'OM-0223':[['cocottes...','cocottes […]'],'Source continues with a comma; mark editorial omission.'],
 'OM-0227':[['Teve de provar','teve de provar'],['Império...','Império […]'],'Retain lowercase and mark editorial omission before semicolon.'],
 'OM-0229':[['Ao lado','ao lado'],'Retain source lowercase. Existing bracketed omissions are accurate.'],
 'OM-0231':[['Centenares','centenares'],['arroz...','arroz […]'],'Retain lowercase; source continues with a semicolon.'],
 'OM-0237':[['Lao-Tsé...','Lao-Tsé […]'],'Source continues with a comma; mark editorial omission.'],
 'OM-0515':[['General:','general:'],'Restore lowercase general from PDF p.48.'],
 'OM-0527':[['Quando o general','quando o general'],['o yamen','o Yamen'],'Restore source casing from PDF p.54.'],
 'OM-0579':[['matinas.','matinas:'],'Restore colon from PDF p.81 before bracketed omission.'],
};
const files=['app/page.tsx','app/camilloff-intercut.tsx','app/camilloff-return-map.tsx','app/supplication-sequence.tsx'];
for(const q of ledger.quotes){
 const original=q.quote;const decision=changes[q.id];
 if(decision){for(const change of decision)if(Array.isArray(change))q.quote=q.quote.replace(...change);q.editorialNote=[q.editorialNote,decision.at(-1)].filter(Boolean).join(' ');}
 let found=false;
 for(const f of files){let text=fs.readFileSync(f,'utf8');if(text.includes(original)){found=true;if(q.quote!==original)fs.writeFileSync(f,text.replaceAll(original,q.quote));}}
 if(!found)throw new Error('Quote not found in live Portuguese source: '+q.id);
 q.verification='pdf-text-and-visual-reviewed';
 q.reviewDate='2026-10-14';
 if(!q.editorialNote)q.editorialNote='Wording, case, punctuation and omission boundaries checked against the cited PDF pages. Display quotation marks and reflowed line breaks are editorial typography.';
}
ledger.limits='Final review against the user-supplied PDF, not a critical-edition collation. PDF spelling retained, including E on p.46. Editorial omissions use […]; quotation wrappers and line reflow are presentation, not new wording.';
ledger.reviewedPdfPages=[...new Set(ledger.quotes.flatMap(q=>q.pdfPages))].sort((a,b)=>a-b);
fs.writeFileSync('localization/source-quotes.json',JSON.stringify(ledger,null,2)+'\n');
console.log('63 quotations reviewed; 11 corrected in this pass.');
