import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const read=f=>fs.readFileSync(f,'utf8');
const base='482a0fc244bd5ac8b98350efe0bf62c424229d70';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
test('Portuguese text inventory is complete; redundant bilingual lines are explicitly empty',()=>{
 const source=JSON.parse(read('localization/strings.json')), translations=JSON.parse(read('localization/pt-PT.json'));
 assert.equal(source.length,633);
 for(const row of source)assert.equal(typeof translations[row.id],'string',row.zh);
});
test('no Chinese runtime strings, JSX, HTML or generated CSS labels',()=>{
 for(const file of [...files('app'),...files('github-pages'),...files('public/tienho-prototype')].filter(f=>!['app/language-switch.tsx','github-pages/index.html','github-pages/main-zh.tsx'].includes(f))){
  const s=read(file);if(/\.(?:tsx?|js)$/.test(file)){
   const sf=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.JS);
   function visit(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isJsxText(n)||ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n))assert.doesNotMatch(n.getText(sf),/[\u3400-\u9fff]/,file);ts.forEachChild(n,visit);}visit(sf);
  }else if(/\.(html|css)$/.test(file))assert.doesNotMatch(s,/[\u3400-\u9fff]/,file);
 }
});
test('stage IDs, navigation targets and object IDs match protected Chinese base',()=>{
 for(const file of ['app/page.tsx','app/camilloff-intercut.tsx','app/camilloff-return-map.tsx']){
  const before=execFileSync('git',['show',base+':'+file],{encoding:'utf8'}),after=read(file);
  for(const re of [/\bgo\("([^"]+)"\)/g,/\bid:\s*"([^"]+)"/g]){
   assert.deepEqual([...after.matchAll(re)].map(m=>m[1]),[...before.matchAll(re)].map(m=>m[1]),file);
  }
 }
 const s=read('app/page.tsx');assert.doesNotMatch(s,/quote-translation|zh=""/);
});
test('63 quotations have source PDF page references, with review limits explicit',()=>{
 const ledger=JSON.parse(read('localization/source-quotes.json'));
 assert.equal(ledger.quotes.length,63);assert.equal(ledger.reviewedPdfPages.length,37);
 for(const q of ledger.quotes){assert.ok(q.pdfPages.length,q.id);assert.equal(q.verification,'pdf-text-and-visual-reviewed');assert.ok(read(q.file).includes(q.quote),q.id+' must match the actual game source');}
});
test('production root defaults to Chinese with a separate Portuguese page',()=>{
 const index=read('dist/github-pages/index.html');assert.match(index,/lang="zh-CN"/);assert.match(index,/src="\/assets\//);
 assert.match(read('dist/github-pages/pt/index.html'),/lang="pt-PT"/);
 assert.equal(JSON.parse(read('.openai/hosting.json')).project_id,null);
 assert.match(read('.github/workflows/pages.yml'),/github.repository == 'Ningtaniazhou\/Ningtaniazhou.github.io'/);
 assert.match(read('.github/workflows/pages.yml'),/fetch-depth: 0/);
 for(const f of files('dist/github-pages/assets'))if(f.endsWith('.css')){
  const css=read(f);for(const m of css.matchAll(/url\(["']?(\/[^)"']+)/g))assert.ok(fs.existsSync('dist/github-pages'+m[1]),m[1]);
 }
 for(const f of files('dist/github-pages').filter(f=>/\.(html|js|css)$/.test(f)))assert.doesNotMatch(read(f),/\/o-mandarim-pt-pt\//,f);
 const script=read('public/tienho-prototype/script.js');assert.doesNotMatch(script,/["']\/audio\//);
});
test('cover language selector and character-voiced ghost control',()=>{
 assert.match(read('app/page.tsx'),/stage === "intro" && <LanguageSwitch locale="pt"/);
 assert.match(read('editions/zh/app/page.tsx'),/stage === "intro" && <LanguageSwitch locale="zh"/);
 assert.match(read('app/page.tsx'),/É melhor não o ver…/);
 assert.doesNotMatch(read('app/page.tsx'),/Ocultar o morto/);
});
test('reading time is changed only for final address; credits can pause',()=>{
 const finale=read('app/final-reader-address.tsx');assert.match(finale,/ring: 12500/);assert.match(finale,/credits: 16300/);assert.match(finale,/animationPlayState/);
 assert.match(read('app/final-reader-address.module.css'),/animation-duration: 82s !important/);
});
test('Chinese snapshot allows only cover, asset routing and bounded audio fade fix',()=>{
 const originals=execFileSync('git',['ls-tree','-r','--name-only',base,'app'],{encoding:'utf8'}).trim().split('\n');
 for(const file of originals){
  let expected=execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8'});
  if(/\.tsx?$/.test(file)){
   const sf=ts.createSourceFile(file,expected,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),edits=[];
   function visit(n){if(ts.isStringLiteral(n)&&n.text.startsWith('/')&&!n.text.startsWith('//')&&(fs.existsSync('public'+n.text.split('?')[0])||n.text==='/')){
    const expression=`asset(${JSON.stringify(n.text)})`;
    edits.push({start:n.getStart(sf),end:n.end,value:ts.isJsxAttribute(n.parent)?`{${expression}}`:expression});
   }ts.forEachChild(n,visit);}visit(sf);
   for(const e of edits.sort((a,b)=>b.start-a.start))expected=expected.slice(0,e.start)+e.value+expected.slice(e.end);
   if(edits.length){let rel=path.relative(path.dirname(file),'app/asset-path');if(!rel.startsWith('.'))rel='./'+rel;const imp=`import { asset } from ${JSON.stringify(rel)};\n`;expected=expected.startsWith('"use client";')?expected.replace('"use client";','"use client";\n'+imp):imp+expected;}
   if(file==='app/page.tsx')expected=expected.replace('"use client";','"use client";\nimport LanguageSwitch from "../../../app/language-switch";').replace('<div className="top-actions">','<div className="top-actions">\n          {stage === "intro" && <LanguageSwitch locale="zh" />}');
  }
  if(file==='app/page.tsx')expected=expected.replaceAll('Math.min((now - started) / duration, 1)','Math.max(0, Math.min((now - started) / duration, 1))');
  assert.equal(read('editions/zh/'+file),expected,file);
 }
 const embedded=execFileSync('git',['ls-tree','-r','--name-only',base,'public/tienho-prototype'],{encoding:'utf8'}).trim().split('\n');
 for(const file of embedded){let expected=execFileSync('git',['show',`${base}:${file}`]);if(file.endsWith('/script.js'))expected=Buffer.from(expected.toString().replaceAll('"/audio/','"../../audio/').replaceAll('Math.min(1, (now - started) / duration)','Math.max(0, Math.min(1, (now - started) / duration))'));assert.deepEqual(fs.readFileSync(file.replace('public/','public/zh/')),expected,file);}
});
test('all music fade ratios tolerate a frame timestamp before the start time',()=>{
 for(const file of ['app/page.tsx','editions/zh/app/page.tsx','public/tienho-prototype/script.js','public/zh/tienho-prototype/script.js']){
  const expressions=[...read(file).matchAll(/const ratio = ([^;]+);/g)].map(m=>m[1]).filter(s=>s.includes('now - started'));
  assert.equal(expressions.length,2,file);
  for(const expression of expressions){const ratio=new Function('now','started','duration',`return ${expression};`);for(const [now,want] of [[99,0],[100,0],[550,.5],[1000,1],[2000,1]])assert.equal(ratio(now,100,900),want,file);}
 }
});
