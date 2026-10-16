import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE):'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:false});
const page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:false,isMobile:false});
page.setDefaultTimeout(15000);
const root=process.env.QA_URL||'http://127.0.0.1:4190/';
const zh=process.env.QA_LOCALE==='zh';
const output=`qa/release/${zh?'zh':'pt'}`;
const labels={
 'Começar':'进入故事世界','Fechar documento':'合上公文','Dormitar':'打瞌睡','Acordar':'醒来',
 'Sair da repartição':'下班','Voltar a casa':'回家','Ler o livro':'仔细翻阅旧书','Ouvir a voz':'桌旁传来声音',
 'Abrir o envelope de lacre negro':'拆开黑蜡封缄的信','Mudar para o Loreto':'搬入洛雷托宫殿','Não posso ignorá-lo':'我无法忽视',
 'É melhor não o ver…':'还是不看见为好','Recorrer à Igreja':'求助教会','Ir à China':'前往中国','Continuar a viagem':'继续旅程',
 'Entrar em Pequim':'进入北京','Subir à liteira':'坐进轿子','Partir':'起轿','Ir a Camilloff':'前往卡米洛夫府邸',
 'Ouvir o plano':'听他安排查访','Acompanhar à porta':'送卡米洛夫到门前','Esperar notícias':'留在府邸等待消息',
 'Olhar a luva sobre a mesa':'看向桌角的女士手套','Ouvir Camilloff':'看向卡米洛夫','Voltar a Camilloff':'抬头看向卡米洛夫',
 'Partir com Sá-Tó':'与萨托一同前往天河村','Voltar ao quarto':'回到房间','Abrir a carta de Camilloff':'拆开卡米洛夫的来信',
 'Responder':'写回信','Selar a carta':'装入信封','Voltar à Europa':'返回欧洲','Voltar ao Loreto':'回到洛雷托',
 'Abandonar a fortuna':'抛下财产','Entrar no palacete':'推开洛雷托豪宅的大门','Sair para a noite':'独自走入夜色',
 'Alcançá-lo':'追上他','A súplica':'乞求','Fechar':'合上','Recomeçar':'返回故事的开始','Recusar':'拒绝','Fechar o livro':'合上旧书'
};
const errors=[],steps=[];fs.mkdirSync(output,{recursive:true});
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const click=async name=>{const key=typeof name==='string'?name:name.source;if(zh){assert.ok(labels[key],key);name=new RegExp(labels[key]);}await page.getByRole('button',{name,exact:typeof name==='string'}).click();};
async function stage(name){await page.locator('.stage-'+name).waitFor();await page.locator('.scene-loading-curtain').waitFor({state:'hidden'});steps.push(name);console.log('STAGE',name);}
async function shot(name){await page.bringToFront();await page.waitForTimeout(800);await page.screenshot({path:output+'/'+name+'.png',timeout:5000}).catch(e=>console.log('SCREENSHOT WARNING',name,e.message.split('\n')[0]));}
async function hotspots(){const buttons=page.locator('.hotspot-index button');for(let i=0;i<await buttons.count();i++){try{await buttons.nth(i).click({timeout:2000});}catch{await page.locator('.hotspot-layer .scene-hotspot').nth(i).click();}assert.match(await buttons.nth(i).getAttribute('class'),/is-found/);}}
async function opening(){
 await click('Começar');await stage('office');assert.equal(await page.locator('.language-switch').count(),0);
 for(let i=0;i<3;i++){await page.locator('.office-document-hotspots button').nth(i).click();await click('Fechar documento');}
 await click('Dormitar');await click('Acordar');await click(/Sair da repartição/);await stage('market');await hotspots();await click(/Voltar a casa/);await stage('room');await hotspots();await click(/Ler o livro/);await stage('book');await click(/Ouvir a voz/);await stage('bell');
}
async function tienho(){
 const f=page.frameLocator('iframe');await f.locator('#startButton').click();await f.locator('#widowTarget').click();await f.locator('#riceTarget').click();
 for(let i=0;i<3;i++)await f.locator('.lantern').nth(i).click();
 await f.locator('#scene.reality').waitFor();
 const bag=await f.locator('#moneyBag').boundingBox();await page.mouse.move(bag.x+bag.width/2,bag.y+bag.height/2);await page.mouse.down();await page.waitForTimeout(1400);await page.mouse.up();
 await f.locator('.evidence-card').first().click();await shot('tienho-identity');await f.locator('#identityContinue').click();await f.locator('#escapeBag').click();
 await f.locator('#cutBagButton').waitFor({state:'visible',timeout:20000});await f.locator('#cutBagButton').click();
 for(let i=0;i<4;i++)await f.locator('#wildernessAction').click();await page.waitForTimeout(1100);
 for(const duration of [1200,1600,2200]){const b=await f.locator('#wildernessAction').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(duration);await page.mouse.up();await page.waitForTimeout(750);}
 await stage('mission');await page.locator('.mission-awakening').waitFor({state:'hidden',timeout:15000});
}
try{
 await page.goto(root);assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');await shot('cover-zh');
 await page.locator('.language-switch').click();assert.equal(await page.locator('html').getAttribute('lang'),'pt-PT');assert.ok(page.url().endsWith('/pt/'));await shot('cover-pt');
 await page.locator('.language-switch').click();assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
 if(!zh)await page.locator('.language-switch').click();await opening();
 await page.locator('.choice-button.dangerous').click();await stage('tiDeath');await page.locator('.death-caption.is-visible').waitFor();await shot('death');await page.locator('.death-actions button').last().click();await stage('inheritance');
 await click('Abrir o envelope de lacre negro');await click(/Mudar para o Loreto/);await stage('luxury');await hotspots();await click(/Não posso ignorá-lo/);await stage('ghost');
 await click('É melhor não o ver…');assert.equal(await page.locator('.corpse-toggle').getAttribute('aria-pressed'),'false');await page.locator('.corpse-toggle').click();assert.equal(await page.locator('.corpse-toggle').getAttribute('aria-pressed'),'true');
 await click('Recorrer à Igreja');await click(/Ir à China/);await stage('map');for(let i=0;i<5;i++)await click(/Continuar a viagem/);await click(/Entrar em Pequim/);await stage('beijing');await hotspots();await click(/Subir à liteira/);await stage('repose');
 for(let i=0;i<2;i++){
  await page.locator('.beijing-destination-grid button').nth(i).click();const slider=page.getByRole('slider',{name:zh?'动手拉开轿帘':'Puxar a cortina'});const b=await slider.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(Math.max(2,b.x-550),b.y+b.height/2,{steps:35});await page.mouse.up();await page.waitForTimeout(1000);assert.ok(Number(await slider.getAttribute('aria-valuenow'))>90);await shot('curtain-'+i);await click(/Partir/);
 }
 await click(/Ir a Camilloff/);await stage('camilloffDeparture');await click(/Ouvir o plano/);
 for(let i=0;i<10;i++){const next=page.locator('.camilloff-departure .primary-action');if((await next.innerText()).includes(zh?'送卡米洛夫':'Acompanhar'))break;await next.click();}
 await click(/Acompanhar à porta/);await click(/Esperar notícias/);await stage('camilloffIntercut');
 for(let i=0;i<4;i++){await page.locator('.space-globe').click();await page.waitForTimeout(350);assert.equal(await page.locator('.time-watch').getAttribute('aria-disabled'),'false');await shot('intercut-'+i);await page.locator('.time-watch').click();}
 await stage('camilloffReturn');await click('Olhar a luva sobre a mesa');await page.waitForTimeout(2500);await click(/Ouvir Camilloff/);
 for(let i=0;i<6;i++){await page.locator('.map-hand-control').click();await page.waitForTimeout(800);}await shot('map-complete');await click(/Voltar a Camilloff/);await click(/Partir com Sá-Tó/);await stage('tienho');await tienho();
 await hotspots();await click(/Voltar ao quarto/);await stage('letter');await page.locator('.room-letter-direct-action').click();await click('Abrir a carta de Camilloff');for(let i=0;i<3;i++)await page.locator('.letter-unfold-control').click();await click(/Responder/);for(let i=0;i<3;i++)await page.locator('.reason-note').nth(i).click();await click(/Selar a carta/);await click(/Voltar à Europa/);await stage('return');
 const stamps=page.locator('.return-stamps button');for(let i=0;i<await stamps.count();i++){const stamp=stamps.nth(i);const b=await stamp.boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(200);assert.match(await stamp.getAttribute('class'),/is-read/);}await click(/Voltar ao Loreto/);await stage('reckoning');await click(/Abandonar a fortuna/);await stage('renounce');await hotspots();await click(/Entrar no palacete/);await stage('prison');await click(/Sair para a noite/);await stage('devilReturn');await click(/Alcançá-lo/);await stage('supplication');await click(/A súplica/);await click(/Voltar ao Loreto/);await stage('testament');
 await page.locator('.final-book-hotspot').click();await page.locator('.final-book-action').click();await shot('final-book');await click('Fechar');await page.locator('.testament-hotspot').click();await page.locator('.artifact-close').click();
 if(zh){await page.getByRole('button',{name:'返回故事的开始'}).waitFor({timeout:20000});await shot('credits');}
 else{await page.getByRole('button',{name:'Pausar créditos',exact:true}).waitFor({timeout:20000});await click('Pausar créditos');await shot('credits-paused');await click('Continuar');}
 await click('Recomeçar');await stage('intro');
 // Second uninterrupted start checks the actual three-refusal branch.
 await opening();for(let i=0;i<3;i++)await click('Recusar');await stage('refusalEnding');await shot('refusal');await click(/Fechar o livro/);await click('Recomeçar');await stage('intro');
 assert.deepEqual(errors,[]);console.log('PASS desktop full mainline + refusal ending + cover languages; zero runtime/HTTP errors');
 fs.writeFileSync(output+'/results.json',JSON.stringify({status:'passed',root,locale:zh?'zh':'pt',browser:await browser.version(),headless:false,viewport:{width:1440,height:900},steps,errors},null,2));
}catch(e){fs.writeFileSync(output+'/failure.json',JSON.stringify({error:String(e),url:page.url(),steps,errors},null,2));await shot('failure').catch(()=>{});throw e;}finally{await browser.close();}
