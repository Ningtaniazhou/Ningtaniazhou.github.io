throw new Error('Historical one-time migration: do not rerun on the production release tree.');
// Frozen Chinese edition: only asset routing and the cover language link change.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const base='482a0fc244bd5ac8b98350efe0bf62c424229d70';
const git=(...args)=>execFileSync('git',args,{maxBuffer:30*1024*1024});
const files=git('ls-tree','-r','--name-only',base,'app','public/tienho-prototype').toString().trim().split('\n');
for(const file of files){
 const target=file.startsWith('app/')?'editions/zh/'+file:file.replace('public/','public/zh/');
 let data=git('show',`${base}:${file}`);
 if(/\.tsx?$/.test(file)){
  let s=data.toString();const sf=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),edits=[];
  function visit(n){if(ts.isStringLiteral(n)&&n.text.startsWith('/')&&!n.text.startsWith('//')&&(fs.existsSync('public'+n.text.split('?')[0])||n.text==='/')){
   const expression=`asset(${JSON.stringify(n.text)})`;
   edits.push({start:n.getStart(sf),end:n.end,value:ts.isJsxAttribute(n.parent)?`{${expression}}`:expression});
  }ts.forEachChild(n,visit);}visit(sf);
  for(const e of edits.sort((a,b)=>b.start-a.start))s=s.slice(0,e.start)+e.value+s.slice(e.end);
  if(edits.length){let rel=path.relative(path.dirname(file),'app/asset-path');if(!rel.startsWith('.'))rel='./'+rel;const imp=`import { asset } from ${JSON.stringify(rel)};\n`;s=s.startsWith('"use client";')?s.replace('"use client";','"use client";\n'+imp):imp+s;}
  if(file==='app/page.tsx')s=s.replace('"use client";','"use client";\nimport LanguageSwitch from "../../../app/language-switch";').replace('<div className="top-actions">','<div className="top-actions">\n          {stage === "intro" && <LanguageSwitch locale="zh" />}');
  data=Buffer.from(s);
 }else if(file==='public/tienho-prototype/script.js')data=Buffer.from(data.toString().replaceAll('"/audio/','"../../audio/'));
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);
}
fs.writeFileSync('editions/zh/app/asset-path.ts',`import { BASE_PATH } from "../../../app/asset-path";\nexport function asset(file: string) { const clean=file.replace(/^\\/+/, ""); return BASE_PATH + (clean.startsWith("tienho-prototype/") ? "zh/" : "") + clean; }\n`);
// Keep the already translated HTML as the separate Portuguese entry.
fs.mkdirSync('github-pages/pt',{recursive:true});
const pt=fs.readFileSync('github-pages/index.html','utf8').replace('src="/main.tsx"','src="/main.tsx"').replace('content="https://ningtaniazhou.github.io/o-mandarim-pt-pt/"','content="https://ningtaniazhou.github.io/o-mandarim-pt-pt/pt/"');
if(!fs.existsSync('github-pages/pt/index.html'))fs.writeFileSync('github-pages/pt/index.html',pt);
const zh=git('show',`${base}:github-pages/index.html`).toString().replace('src="/main.tsx"','src="/main-zh.tsx"').replaceAll('https://ningtaniazhou.github.io/','https://ningtaniazhou.github.io/o-mandarim-pt-pt/');
fs.writeFileSync('github-pages/index.html',zh);
