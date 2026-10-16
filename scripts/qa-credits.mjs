import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:false});
const page=await browser.newPage({viewport:{width:1440,height:900}});
try {
 await page.goto((process.env.QA_PT_URL||'http://127.0.0.1:4190/pt/')+'?preview=refusalEnding');
 await page.getByRole('button',{name:/Fechar o livro/}).click();
 const roll=page.getByLabel('Sobre esta edição e equipa');
 await page.waitForTimeout(15000);
 await page.getByRole('button',{name:'Pausar créditos',exact:true}).click();
 await page.waitForTimeout(250);
 const paused=await roll.boundingBox();
 await page.waitForTimeout(1000);
 const still=await roll.boundingBox();assert.ok(Math.abs(paused.y-still.y)<1);
 await page.screenshot({path:'qa/desktop/credits-readable.png',timeout:10000});
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.waitForTimeout(1000);
 const resumed=await roll.boundingBox();assert.ok(resumed.y<still.y-5);
 fs.writeFileSync('qa/desktop/credits-motion.json',JSON.stringify({passed:true,headless:false,pausedY:paused.y,stillY:still.y,resumedY:resumed.y},null,2));
} finally {await browser.close();}
