import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE):'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
page.setDefaultTimeout(10000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.QA_PT_URL||'http://127.0.0.1:4190/pt/';
async function click(name){await page.getByRole('button',{name,exact:true}).click();}
async function stage(name){await page.locator('.stage-'+name).waitFor();await page.locator('.scene-loading-curtain').waitFor({state:'hidden'});}
async function preview(name){await page.goto(base+'?preview='+name);await stage(name);}
async function shot(name){await page.waitForTimeout(900);await page.screenshot({path:'qa/pt-PT/flow-'+name+'.png'});}
await page.goto(base);await click('Começar');await stage('office');
for(let i=0;i<3;i++){await page.locator('.office-mobile-documents button').nth(i).click();await click('Fechar documento');}
await click('Dormitar');await click('Acordar');await page.getByRole('button',{name:/Sair da repartição/}).click();await stage('market');
for(let i=0;i<await page.locator('.hotspot-index button').count();i++)await page.locator('.hotspot-index button').nth(i).click();
await page.getByRole('button',{name:/Voltar a casa/}).click();await stage('room');
await page.getByRole('button',{name:/Ler o livro/}).click();await stage('book');await shot('book');
console.log('PASS formal start → office documents/doze → market → room → book');
await preview('letter');await page.locator('.room-letter-direct-action').click();
await click('Abrir a carta de Camilloff');
await page.locator('.letter-unfold-control').click();await page.locator('.letter-unfold-control').click();await shot('letter-open');await page.locator('.letter-unfold-control').click();
await page.getByRole('button',{name:/Responder/}).click();
for(let i=0;i<3;i++)await page.locator('.reason-note').nth(i).click();
await shot('letter-reply');await page.getByRole('button',{name:/Selar a carta/}).click();
console.log('PASS letter open/read/choose three reasons/seal');
await preview('testament');await page.locator('.final-book-hotspot').click();await page.locator('.final-book-action').click();await shot('final-book');await click('Fechar');
await page.locator('.testament-hotspot').click();await shot('testament');
await page.locator('.artifact-close').click();
await page.getByRole('button',{name:'Pausar créditos',exact:true}).waitFor({timeout:20000});
await click('Pausar créditos');assert.equal(await page.getByRole('button',{name:'Continuar',exact:true}).getAttribute('aria-pressed'),'true');
await click('Continuar');await click('Recomeçar');await stage('intro');
console.log('PASS final book/testament → timed address → pause/resume credits → restart');
await browser.close();assert.deepEqual(errors,[]);console.log('PASS no runtime/network errors');
