// One-time migration of the recorded Chinese base. Do not rerun on Portuguese sources.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root=process.cwd();
const han=/[\u3400-\u9fff]/;
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx?|js|html)$/.test(p))files.push(p);}}
walk(path.join(root,'app'));walk(path.join(root,'github-pages'));walk(path.join(root,'public/tienho-prototype'));
const entries=[],seen=new Map(), edits=new Map();
function add(file,start,end,text,kind){if(!han.test(text))return;const key=text.trim().replace(/\s+/g,' ');if(!seen.has(key)){seen.set(key,entries.length);entries.push({id:entries.length,zh:key,locations:[]});}const id=seen.get(key);entries[id].locations.push({file:path.relative(root,file),start});if(!edits.has(file))edits.set(file,[]);edits.get(file).push({start,end,text,kind,id});}
for(const file of files){const s=fs.readFileSync(file,'utf8');if(file.endsWith('.html')){const re=/>([^<>]+)</g;let m;while((m=re.exec(s)))add(file,m.index+1,m.index+1+m[1].length,m[1],'text');const attrs=/\b(?:alt|title|aria-label|content)="([^"]*)"/g;while((m=attrs.exec(s))){const start=m.index+m[0].indexOf('"')+1;add(file,start,start+m[1].length,m[1],'attr');}}else{const sf=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.JS);function visit(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))add(file,n.getStart(sf)+1,n.end-1,n.text,'string');else if(ts.isJsxText(n))add(file,n.pos,n.end,n.getText(sf),'jsx');else if(ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n)){const start=n.getStart(sf)+1,end=n.end-(ts.isTemplateTail(n)?1:2);add(file,start,end,s.slice(start,end),'template');}ts.forEachChild(n,visit);}visit(sf);}}
if(process.argv.includes('--extract')){fs.mkdirSync('localization',{recursive:true});fs.writeFileSync('localization/strings.json',JSON.stringify(entries,null,2)+'\n');console.log(entries.map(e=>e.id+'\t'+e.zh).join('\n'));}else{
 const translations=JSON.parse(fs.readFileSync('localization/pt-PT.json','utf8'));
 const missing=entries.filter(e=>typeof translations[e.id]!=='string');if(missing.length)throw Error('Missing: '+missing.map(e=>e.id).join(','));
 for(const[file,ops]of edits){let s=fs.readFileSync(file,'utf8');for(const op of ops.sort((a,b)=>b.start-a.start)){let t=translations[op.id];if(op.kind==='string'||op.kind==='template'){const delimiter=s[op.start-1];t=t.replace(/\\/g,'\\\\').replace(/\n/g,'\\n');if(delimiter==='"')t=t.replace(/"/g,'\\"');else if(delimiter==="'")t=t.replace(/'/g,"\\'");else t=t.replace(/`/g,'\\`').replace(/\$\{/g,'\\${');}else{t=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');if(op.kind==='attr')t=t.replace(/"/g,'&quot;');if(op.kind==='jsx')t=t.replace(/\{/g,'&#123;').replace(/\}/g,'&#125;');}const lead=op.text.match(/^\s*/)[0],trail=op.text.match(/\s*$/)[0];if(op.kind==='jsx'||op.kind==='text')t=lead+t+trail;s=s.slice(0,op.start)+t+s.slice(op.end);}fs.writeFileSync(file,s);}
}
