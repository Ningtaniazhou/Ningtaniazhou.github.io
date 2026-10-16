import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist/github-pages');
const base='/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ogg':'audio/ogg','.mp3':'audio/mpeg','.json':'application/json'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith(base)){res.writeHead(404);res.end('Outside Portuguese edition');return;}
 const relative=decodeURIComponent(url.pathname.slice(base.length));
 const file=path.resolve(root,relative.endsWith('/')||!relative?relative+'index.html':relative);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
 fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT||4185),'127.0.0.1',()=>console.log(`Game preview: http://127.0.0.1:${process.env.PORT||4185}${base}`));
