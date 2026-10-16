// One-time mechanical migration, retained as an audit trail. Not a build step.
import fs from 'node:fs';
import path from 'node:path';
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,e.name);if(e.isDirectory())walk(p);
 else if(p.endsWith('.css')){let s=fs.readFileSync(p,'utf8');s=s.replaceAll('[lang="pt"]','[lang="pt-PT"]');fs.writeFileSync(p,s);}
}}
walk('app');
for(const f of ['scripts/localize.mjs','scripts/prepare-port.mjs']){
 let s=fs.readFileSync(f,'utf8').replace("'/tmp/mandarim-official-audit.TrEBmH/node_modules/typescript/lib/typescript.js'","'typescript'");
 s='// One-time migration of the recorded Chinese base. Do not rerun on Portuguese sources.\n'+s;
 fs.writeFileSync(f,s);
}
