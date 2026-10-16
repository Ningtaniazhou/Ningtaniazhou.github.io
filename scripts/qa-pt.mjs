import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE) : 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:process.env.QA_HEADFUL!=='1'});
const base=process.env.QA_PT_URL||'http://127.0.0.1:4190/pt/';
fs.mkdirSync('qa/pt-PT',{recursive:true});
const findings=[];
for(const viewport of (process.env.QA_DESKTOP_SIZES?[{width:1024,height:600},{width:1280,height:720}]:[{width:1440,height:900},{width:844,height:390},{width:667,height:375}])){
 const page=await browser.newPage({viewport,hasTouch:viewport.width<1000,isMobile:viewport.width<1000});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 for(const stage of ['intro','office','market','room','book','bell','tiDeath','inheritance','luxury','ghost','map','beijing','repose','camilloffDeparture','camilloffIntercut','camilloffReturn','tienho','mission','letter','return','reckoning','renounce','prison','devilReturn','supplication','testament','refusalEnding']){
  await page.goto(base+'?preview='+stage);
  await page.locator('.scene-loading-curtain').waitFor({state:'hidden',timeout:20000});
  await page.waitForTimeout(180);
  const data=await page.evaluate(()=>{
   const text=document.body.innerText.replace('中文','');
   const overflow=[...document.querySelectorAll('button,h1,h2,p,blockquote')].filter(e=>{
    const r=e.getBoundingClientRect(),s=getComputedStyle(e);
    return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none'&&(e.scrollWidth>e.clientWidth+3);
   }).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,90),width:e.clientWidth,scroll:e.scrollWidth}));
   return {han:/[\u3400-\u9fff]/.test(text),lang:document.documentElement.lang,overflow};
  });
  findings.push({viewport,stage,...data});
  if(['intro','office','book','bell','letter','testament','camilloffReturn','tienho'].includes(stage))await page.screenshot({path:`qa/pt-PT/${viewport.width}-${stage}.png`});
 }
 findings.push({viewport,errors});
 await page.close();
}
await browser.close();
fs.writeFileSync(process.env.QA_DESKTOP_SIZES?'qa/desktop/size-report.json':'qa/pt-PT/preview-report.json',JSON.stringify(findings,null,2));
console.log(JSON.stringify(findings.filter(f=>f.han||f.overflow?.length||f.errors?.length),null,2));
