import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const root=process.env.QA_URL||'http://127.0.0.1:4190/';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const errors=[],checks=[];fs.mkdirSync('qa/release',{recursive:true});
const stages=['intro','office','market','room','book','bell','tiDeath','inheritance','luxury','ghost','map','beijing','repose','camilloffDeparture','camilloffIntercut','camilloffReturn','tienho','mission','letter','return','reckoning','renounce','prison','devilReturn','supplication','testament','refusalEnding'];
try{
 for(const locale of ['zh','pt'])for(const viewport of [{width:1024,height:600},{width:844,height:390}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<1000,isMobile:viewport.width<1000});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const url=root+(locale==='pt'?'pt/':'');
  for(const stage of stages){
   await page.goto(url+'?preview='+stage);
   await page.locator('.stage-'+stage).waitFor();await page.locator('.scene-loading-curtain').waitFor({state:'hidden'});
   assert.equal(await page.locator('html').getAttribute('lang'),locale==='pt'?'pt-PT':'zh-CN');
   if(stage==='intro'){
    const link=page.locator('.language-switch');assert.equal(await link.getAttribute('href'),locale==='pt'?'/':'/pt/');
    const b=await link.boundingBox();assert.ok(b.x>=0&&b.x+b.width<=viewport.width&&b.y>=0&&b.y+b.height<=viewport.height);
    await link.focus();await page.keyboard.press('Enter');await page.waitForURL(root+(locale==='pt'?'':'pt/'));
    await page.locator('.language-switch').click();await page.waitForURL(url);
    await page.screenshot({path:`qa/release/${locale}-${viewport.width}-cover.png`});
    await page.locator('.intro-content .primary-action').click();await page.locator('.stage-office').waitFor();
    await page.locator('.scene-loading-curtain').waitFor({state:'hidden'});await page.locator('.back-button').click();await page.locator('.stage-intro').waitFor();
   }
   if(stage==='tienho'){
    const iframe=page.locator('iframe');assert.ok((await iframe.getAttribute('src')).startsWith(locale==='pt'?'/tienho-prototype/':'/zh/tienho-prototype/'));
    await page.frameLocator('iframe').locator('#startButton').waitFor();
   }
   checks.push({locale,viewport,stage});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync('qa/release/smoke-results.json',JSON.stringify({passed:true,root,browser:await browser.version(),checks,errors},null,2));
 console.log('PASS bilingual small-window scene/keyboard/back/iframe checks',checks.length);
}finally{await browser.close();}
