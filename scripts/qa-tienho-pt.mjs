import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE):'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
await page.goto((process.env.QA_PT_URL||'http://127.0.0.1:4190/pt/')+'?preview=tienho');
const f=page.frameLocator('iframe');
await f.locator('#startButton').click();await f.locator('#widowTarget').click();await f.locator('#riceTarget').click();
for(let i=0;i<3;i++)await f.locator('.lantern').nth(i).click();
await f.locator('#scene.reality').waitFor();
await f.locator('#moneyBag').focus();await page.keyboard.down('Space');await page.waitForTimeout(1400);await page.keyboard.up('Space');
await f.locator('.evidence-card').first().click();
await page.waitForTimeout(900);await page.screenshot({path:'qa/pt-PT/tienho-identity.png'});
assert.doesNotMatch(await f.locator('body').innerText(),/[\u3400-\u9fff]/);
await f.locator('#identityContinue').click();await f.locator('#escapeBag').click();await f.locator('#cutBagButton').waitFor({state:'visible',timeout:30000});await f.locator('#cutBagButton').click();
for(let i=0;i<4;i++)await f.locator('#wildernessAction').click();
await page.waitForTimeout(1100);await page.screenshot({path:'qa/pt-PT/tienho-wilderness.png'});
for(const duration of [1200,1600,2200]){
 await f.locator('#wildernessAction').focus();await page.keyboard.down('Space');await page.waitForTimeout(duration);await page.keyboard.up('Space');await page.waitForTimeout(750);
}
await page.locator('.stage-mission').waitFor({timeout:20000});await page.locator('.mission-awakening').waitFor({state:'hidden',timeout:20000});
assert.deepEqual(errors,[]);console.log('PASS embedded Tien-Hó: coin/rice/lanterns → grip → identity → escape → wilderness → parent mission; no errors');await browser.close();
