// One-time migration of the recorded Chinese base. Do not rerun on Portuguese sources.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.tsx?$/.test(p)&&!p.endsWith('asset-path.ts'))files.push(p);}}
walk('app');
for(const file of files){let s=fs.readFileSync(file,'utf8');const sf=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),edits=[];
 function visit(n){if(ts.isStringLiteral(n)&&n.text.startsWith('/')&&!n.text.startsWith('//')&&(fs.existsSync('public'+n.text.split('?')[0])||n.text==='/')){const expression=`asset(${JSON.stringify(n.text)})`;edits.push({start:n.getStart(sf),end:n.end,value:ts.isJsxAttribute(n.parent)?`{${expression}}`:expression});}ts.forEachChild(n,visit);}visit(sf);
 for(const e of edits.sort((a,b)=>b.start-a.start))s=s.slice(0,e.start)+e.value+s.slice(e.end);
 if(edits.length){const rel=path.relative(path.dirname(file),'app/asset-path').replaceAll('\\','/');const imp=`import { asset } from ${JSON.stringify(rel.startsWith('.')?rel:'./'+rel)};\n`;s=s.startsWith('"use client";')?s.replace('"use client";','"use client";\n'+imp):imp+s;}
 s=s.replaceAll('lang="pt"','lang="pt-PT"').replaceAll('lang="zh-CN"','lang="pt-PT"').replaceAll('locale: "zh_CN"','locale: "pt_PT"');
 s=s.replace(/\n\s*<span className="quote-translation">“\{(?:zh|copy.zh)\}”<\/span>/g,'');
 s=s.replace('function BilingualQuote({ pt, zh,','function BilingualQuote({ pt,').replace('function ReturnQuote({ pt, zh }','function ReturnQuote({ pt }');
 s=s.replace(/<(p|span)(?: className="quote-translation devil-final-line")?><\/\1>/g,'');
 // Match the selected source, including its E/É printing anomaly on PDF page 46.
 s=s.replaceAll('amarelo de ouro vivo','amarelo de oiro vivo').replaceAll('Pequim está diante de mim! É uma vasta','Pequim está diante de mim! E uma vasta');
 s=s.replace('Tchin-Fô','Tsing-Fó').replace('Chá-Coua','Chá-Couá');
 // The original final spread paired two languages. A single quotation occupies the spread.
 s=s.replace(/<section className="final-book-leaf">\s*<\/section>/g,'');
 fs.writeFileSync(file,s);
}
let html=fs.readFileSync('github-pages/index.html','utf8').replaceAll('zh-CN','pt-PT').replaceAll('https://ningtaniazhou.github.io/','https://ningtaniazhou.github.io/o-mandarim-pt-pt/');
html=html.replace('<meta property="og:type"','<meta property="og:locale" content="pt_PT" />\n    <meta property="og:type"');fs.writeFileSync('github-pages/index.html',html);
let inner=fs.readFileSync('public/tienho-prototype/index.html','utf8').replaceAll('zh-CN','pt-PT').replace('styles.css?v=6','styles.css?v=pt1').replace('script.js?v=7','script.js?v=pt1');fs.writeFileSync('public/tienho-prototype/index.html',inner);
let js=fs.readFileSync('public/tienho-prototype/script.js','utf8').replaceAll('"/audio/','"../audio/');
// Preserve the final-lantern words through the transition; do not impose a longer action.
js=js.replace('document.querySelector("#narrativeCard").classList.add("is-quiet");','// Keep the short lantern cue readable during the transition.');
fs.writeFileSync('public/tienho-prototype/script.js',js);
