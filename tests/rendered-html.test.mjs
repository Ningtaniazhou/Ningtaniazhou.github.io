import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Chinese O Mandarim experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>《满大人》· 交互叙事<\/title>/i);
  assert.match(html, /《满大人》/);
  assert.match(html, /葡萄牙作家埃萨·德·凯罗斯同名小说改编的交互叙事游戏/);
  assert.match(html, /如果你能让一个遥远国度的陌生人立刻死去/);
  assert.match(html, /建议开启声音，并使用横屏或电脑游玩/);
  assert.match(html, /og\.webp/);
  assert.doesNotMatch(html, /序章/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships the complete narrative and its visual assets", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const curtain = await readFile(new URL("../app/beijing-curtain-scene.tsx", import.meta.url), "utf8");
  const camilloffIntercut = await readFile(new URL("../app/camilloff-intercut.tsx", import.meta.url), "utf8");
  const camilloffReturn = await readFile(new URL("../app/camilloff-return-map.tsx", import.meta.url), "utf8");
  const supplication = await readFile(new URL("../app/supplication-sequence.tsx", import.meta.url), "utf8");
  const tienho = await readFile(new URL("../app/tienho-sequence.tsx", import.meta.url), "utf8");
  const tienhoMarkup = await readFile(new URL("../public/tienho-prototype/index.html", import.meta.url), "utf8");
  const tienhoScript = await readFile(new URL("../public/tienho-prototype/script.js", import.meta.url), "utf8");
  const tienhoStyles = await readFile(new URL("../public/tienho-prototype/styles.css", import.meta.url), "utf8");
  const tienhoPrototype = `${tienhoMarkup}\n${tienhoScript}\n${tienhoStyles}`;
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /title: "坚定的拒绝", subtitle: ""/);
  assert.match(page, /谄媚与奉承/);
  assert.match(page, /与魔鬼的重逢/);
  assert.match(page, /title: "乞求", subtitle: ""/);
  assert.match(page, /弥留之际/);
  assert.match(page, /狄鑫福/);
  assert.match(page, /卡米洛夫/);
  assert.match(page, /轿中北京/);
  assert.match(page, /城门之前/);
  assert.match(page, /红绸轿子/);
  assert.match(page, /紫禁城/);
  assert.doesNotMatch(page, /鞑靼城/);
  assert.match(page, /老百姓的街巷/);
  assert.doesNotMatch(page, /华人街区/);
  assert.doesNotMatch(page, /将军夫人的客厅/);
  assert.match(page, /王国内政部/);
  assert.match(page, /关于走廊灯油定额之呈报/);
  assert.match(page, /公文纸左侧页边距统一办法/);
  assert.match(page, /雨伞架编号复核清册/);
  assert.match(page, /officeDocumentsRead\.length === officeDocuments\.length && officeDozed/);
  assert.match(page, />下班 <span>→<\/span>/);
  assert.match(page, /office-dream-bubble/);
  assert.match(page, /officeDreamsBursting/);
  assert.match(page, /醒来/);
  assert.doesNotMatch(page, /展开桌上的公文|轻点戳破梦境|读完三份公文，并至少做过一次白日梦|让房间自己说话/);
  assert.match(page, /title: "寻宝", subtitle: "旧货市场"/);
  assert.doesNotMatch(page, /卡米洛夫的建议/);
  assert.match(page, /title: "临行嘱托"/);
  assert.match(page, /卡米洛夫府邸前/);
  assert.match(page, /我会尽力查办，帮您找到狄鑫福的家人/);
  assert.match(page, /送卡米洛夫到门前/);
  assert.match(page, /门扉合拢，马蹄与车轮声/);
  assert.match(page, /title: "与卡米洛夫的会谈"/);
  assert.match(page, /title: "府邸内外"/);
  assert.match(page, /留在府邸等待消息/);
  assert.match(page, /onComplete=\{\(\) => go\("camilloffReturn"\)\}/);
  assert.match(camilloffIntercut, /等待卡米洛夫归来/);
  assert.match(page, /camilloff-return-map-v1\.webp/);
  assert.match(page, /前往卡米洛夫府邸/);
  assert.match(page, /回到卡米洛夫府邸，我把那柄摇铃/);
  assert.match(page, /Faça uma coisa\. Procure a família de Ti Chin-Fu/);
  assert.match(camilloffReturn, /自从来到北京，我再也没有看到过死去的狄鑫福/);
  assert.match(page, /beijingDestination/);
  assert.match(page, /beijingVisited/);
  assert.doesNotMatch(page, /generalaTopics|camilloffSalon|camilloffMeeting/);
  assert.match(curtain, /起轿/);
  assert.match(camilloffIntercut, /<span className="chapter-kicker">第五幕 · 北京<\/span>/);
  assert.match(camilloffIntercut, /<h2 className="chapter-title">府邸内外<\/h2>/);
  assert.doesNotMatch(camilloffIntercut, /第一小章|印章与茶杯|名单与扇子|门槛与门扉|消息与痕迹/);
  assert.match(camilloffIntercut, /点击地球仪，切换到衙门/);
  assert.match(camilloffIntercut, /点击怀表，让时间推移/);
  assert.doesNotMatch(camilloffIntercut, /四日|下一日|同一天|这一天/);
  assert.match(camilloffIntercut, /if \(!seenBoth\) return/);
  assert.match(camilloffIntercut, /advanceDay\(\);/);
  assert.match(camilloffIntercut, /一只浅色的手套忘在了我的桌上/);
  assert.match(camilloffReturn, /看向桌角的女士手套/);
  assert.match(camilloffReturn, /我的视线停了一瞬，手刚伸过去，又缩了回来/);
  assert.match(camilloffReturn, /onClick=\{advanceMap\}/);
  assert.match(camilloffReturn, /disabled=\{mapStep >= mapRoutes\.length\}/);
  assert.match(camilloffReturn, /<button className=\{`map-hand-control/);
  assert.match(camilloffReturn, /尼古河/);
  assert.match(camilloffReturn, /密云/);
  assert.match(camilloffReturn, /切希亚堡/);
  assert.match(camilloffReturn, /长城/);
  assert.match(camilloffReturn, /古北口/);
  assert.match(camilloffReturn, /天河/);
  assert.match(camilloffReturn, /抬头看向卡米洛夫/);
  assert.match(camilloffReturn, /与萨托一同前往天河村/);
  assert.doesNotMatch(page, /beijingDismounted/);
  assert.match(page, /pequim-litter-interior-v1\.webp/);
  assert.doesNotMatch(page, /beijingDrift|reposeInterrupted|文人服饰|隐逸之亭/);
  assert.match(tienho, /tienho-prototype\/index\.html\?embedded=1/);
  assert.match(tienhoPrototype, /天河村外的荒野/);
  assert.match(tienhoPrototype, /马匹已经跑远/);
  assert.match(page, /朱利奥神父/);
  assert.match(page, /神父捡到的弃婴/);
  assert.match(page, /狄鑫福和他的纸鸢始终没有再出现/);
  assert.match(page, /好吧，狄鑫福已经满意了/);
  assert.match(page, /特奥多罗的小房间/);
  assert.match(page, /狄鑫福是在返程的船上突然重新出现的/);
  assert.match(page, /return: "\/lisbon-room-v3\.webp"/);
  assert.doesNotMatch(page, /狄鑫福 · \{place\}/);
  assert.match(page, /来吧，特奥多罗，我的朋友/);
  assert.match(page, /No fundo da China existe um mandarim/);
  assert.match(page, />仔细翻阅旧书 <span>→<\/span>/);
  assert.match(page, />桌旁传来声音 <span>→<\/span>/);
  assert.match(page, /book: \{ act: "第一幕 · 旧书", title: "发亮的字句", subtitle: "" \}/);
  assert.match(page, /看见一个秃顶的老先生在我的床前俯下身/);
  assert.match(page, /aria-label="拆开黑蜡封缄的信"/);
  assert.doesNotMatch(page, /<strong>黑蜡封缄的信<\/strong>/);
  assert.match(page, /搬入洛雷托宫殿/);
  assert.match(page, /我无法忽视……/);
  assert.doesNotMatch(page, /if \(stage === "ghost"\) setAvoidance\(""\)/);
  assert.match(page, /不详身影使一切都变得索然无味/);
  assert.doesNotMatch(page, /door-ghost|横陈的黄袍尸身|门后的黄袍/);
  assert.match(page, /我试着用音乐、酒宴和彻夜的狂欢淹没愧疚/);
  assert.match(page, /在那里花重金包下“锡兰号”邮船/);
  assert.match(page, /卡米洛夫派出的翻译萨托在此处迎接/);
  assert.match(camilloffReturn, /线索指向北京以北、越过长城后的天河村/);
  assert.match(camilloffReturn, /与萨托一同前往天河村/);
  assert.match(tienhoPrototype, /官员介绍信/);
  assert.match(tienhoPrototype, /让萨托翻译/);
  assert.match(tienhoPrototype, /<em>按住钱袋<\/em>/);
  assert.match(tienhoPrototype, /按住<\/b>带着金币，但脚步更慢/);
  assert.match(tienhoPrototype, /松开<\/b>金币会洒落，逃跑更快/);
  assert.doesNotMatch(tienhoPrototype, /cutBagButton[^>]*><span>割断钱袋<\/span><i><\/i><\/button>/);
  assert.match(page, /无法平息的亡灵/);
  assert.match(page, /像罪恶的饰物一样从身上甩掉/);
  assert.match(page, />抛下财产 <span>→<\/span>/);
  assert.match(page, /nunca mates o Mandarim/);
  assert.match(page, /<button className="final-book-action" onClick=\{turnFinalBookCover\}>翻开<\/button>/);
  assert.match(page, /<button className="final-book-action" onClick=\{closeFinalBook\}>合上<\/button>/);
  assert.doesNotMatch(page, /翻开封面|《满大人》· 扉页/);
  assert.match(page, /Uma noite, recolhendo só por uma rua deserta/);
  assert.match(supplication, /Livra-me das minhas riquezas! Ressuscita o Mandarim!/);
  assert.match(supplication, /Não pode ser, meu prezado senhor, não pode ser/);
  assert.doesNotMatch(page, /Eu atirei-me aos seus pés numa suplicação abjecta/);
  assert.doesNotMatch(supplication, /Eu atirei-me aos seus pés numa suplicação abjecta|煤气灯暗下去。垃圾堆旁，只剩一条瘦狗/);
  assert.match(page, /又是他！阴魂不散！/);
  assert.match(page, /乞求/);
  assert.doesNotMatch(page, /devilDialogue|无法撤销的交易|supplicated/);
  assert.match(supplication, /phase === "waiting"/);
  assert.match(supplication, />\s*乞求 <span>→<\/span>/);
  assert.match(supplication, />\s*再看一次\s*<\/button>/);
  assert.doesNotMatch(supplication, /重播/);
  assert.match(supplication, /supplication-street-v1\.webp/);
  assert.doesNotMatch(supplication, /phaseCopy|特奥多罗冲向那个黑衣人|跪倒在湿冷的石路上|手指几乎触到衣料时|支撑骤然落空/);
  assert.match(page, /"devil-return": "devilReturn"/);
  assert.match(page, /supplication: "supplication"/);
  assert.match(page, /bell: "bell"/);
  assert.match(page, /tienho: "tienho"/);
  assert.match(page, /ti-chin-fu-corpse-v3\.webp/);
  assert.match(page, /devil-seated-cutout-v2\.webp/);
  assert.match(page, /bell-v1\.webp/);
  assert.match(page, /返回上一页/);
  assert.match(page, /<span>物件<\/span>/);
  assert.match(page, /进入故事世界/);
  assert.match(page, /合上旧书/);
  assert.match(page, /一柄摇铃/);
  assert.match(page, /className=\{`corpse-toggle \$\{revealed \? "is-dismiss" : "is-question"\}`\}/);
  assert.match(page, /\{revealed \? "还是不看见为好" : "\?"\}/);
  assert.match(page, /显出狄鑫福的尸体/);
  assert.match(page, /aria-label=\{revealed \? "还是不看见为好" : "显出狄鑫福的尸体"\}/);
  assert.doesNotMatch(page, /这是什么？|revealed \? "×"/);
  assert.match(page, /const \[ghostRevealed, setGhostRevealed\] = useState\(true\)/);
  assert.doesNotMatch(page, /尸影尚未显出原貌/);
  assert.match(page, /const corpsePresenceStages: Stage\[\] = \["ghost", "map", "return", "reckoning", "renounce", "prison", "devilReturn", "supplication", "testament"\]/);
  assert.match(page, /点击沿途地名，查看狄鑫福如何一路相随/);
  assert.match(page, /place === nextReturnStop \? "is-next"/);
  assert.doesNotMatch(page, /LateCorpsePresence|late-ti-corpse/);
  assert.match(page, /stageMusic/);
  assert.match(page, /handbell/);
  assert.match(page, /bellRung/);
  assert.match(page, /LetterOfExcuses/);
  assert.match(page, /letterReasons/);
  assert.match(page, /TienhoSequence/);
  assert.match(tienhoPrototype, /第六幕 · 远东/);
  assert.match(tienhoPrototype, /客栈门外/);
  assert.match(tienhoPrototype, /保持清醒/);
  assert.match(tienhoPrototype, /不要睡去/);
  assert.doesNotMatch(tienhoPrototype, />醒来<\/button>|wakeAction|wake-action/);
  assert.match(tienhoScript, /later\(wakeInMonastery, 2450\)/);
  assert.match(tienhoScript, /tienho:complete/);
  assert.doesNotMatch(page, /collapsePhase|attackChoice|go\("wilderness"\)/);
  assert.doesNotMatch(tienhoPrototype, /speed-lines|reaching-hand|正在逐渐消失的行动能力|再呼吸一次/);
  assert.match(page, /bellSequence/);
  assert.match(styles, /bell-cinematic-swing/);
  assert.match(styles, /corpse-question-escalate 9s/);
  assert.match(styles, /@keyframes carriage-fades/);
  assert.match(styles, /\.intercut-card\.is-yamen/);
  assert.match(styles, /@keyframes globe-equator-glint/);
  assert.match(styles, /@keyframes watch-hand-invitation/);
  assert.match(styles, /@media \(orientation: landscape\) and \(max-height: 540px\)/);
  assert.match(styles, /touch-action: pan-y/);
  assert.match(styles, /-webkit-overflow-scrolling: touch/);
  assert.doesNotMatch(styles, /@media \(orientation: landscape\) and \(max-height: 540px\)[\s\S]*?\.game-shell \{[\s\S]*?overflow-y: hidden/);
  assert.match(styles, /@keyframes map-route-draw/);
  assert.match(styles, /@keyframes map-paper-jump/);
  assert.match(styles, /@keyframes map-hand-jump/);
  assert.match(styles, /\.departure-leaving \.scene-image/);
  assert.match(styles, /@keyframes corpse-question-escalate/);
  assert.match(styles, /\.stage-devilReturn \.ti-figure/);
  assert.match(styles, /\.stage-prison \.ti-figure/);
  assert.match(styles, /\.stage-supplication \.ti-figure/);
  assert.match(styles, /\.stage-testament \.ti-figure/);
  assert.doesNotMatch(styles, /late-ti-corpse/);
  assert.doesNotMatch(styles, /bell-cinematic-grow/);
  assert.doesNotMatch(styles, /scale\(7\.6\)/);
  assert.doesNotMatch(styles, /\.devil-final span\s*\{[^}]*font:\s*700 9px/s);
  assert.match(page, /hasInspectedAll/);
  assert.match(page, /chooseAvoidance/);
  assert.doesNotMatch(page, /chooseCamilloff/);
  assert.doesNotMatch(page, /chooseLetterDecision|letterDecision|letterClues/);
  assert.match(page, /resetRevisitableStage/);
  assert.match(page, /if \(next === "ghost"\) setAvoidance\(""\)/);
  assert.match(page, /if \(next === "beijing"\) \{/);
  assert.match(page, /setBeijingVisited\(\[\]\)/);
  assert.match(page, /onComplete=\{beginMissionAwakening\}/);
  assert.match(page, /missionWaking/);
  assert.match(page, /churchBell/);
  assert.match(page, /setAvoidance\(choice\)/);
  assert.match(page, />沉湎享乐<\/span>/);
  assert.match(page, />求助教会<\/span>/);
  assert.match(page, />远行排遣<\/span>/);
  assert.match(page, /unsolved-investigation-v1\.ogg/);
  assert.match(page, /volume: 0\.74/);
  assert.match(page, /西尔维斯特/);
  assert.doesNotMatch(page, /setInheritanceOpened\(true\); setGhostRevealed\(true\)/);
  assert.doesNotMatch(page, /stage === "inheritance" && inheritanceOpened/);
  assert.match(page, /回到房间/);
  assert.match(page, /mission-cloister-v7\.webp/);
  assert.match(page, /mission-room-v1\.webp/);
  assert.doesNotMatch(page, /id: "letter", label: "卡米洛夫的信"/);
  assert.match(page, /拿起桌上的来信/);
  assert.match(page, /拆开卡米洛夫的来信/);
  assert.match(page, />拆信</);
  assert.doesNotMatch(page, /抽出信纸|拆开卡米洛夫的附言/);
  assert.match(page, /继续读信/);
  assert.match(page, /合上信/);
  assert.match(page, /incomingClosed/);
  assert.match(page, /写回信/);
  assert.match(page, /从中选取三个念头，写进信里/);
  assert.match(page, /特奥多罗写给卡米洛夫的回信/);
  assert.match(page, /我已经走过半个世界/);
  assert.match(page, /我险些死在天河村/);
  assert.match(page, /两个地址都无法确认/);
  assert.match(page, /狄鑫福已经很久没有出现/);
  assert.match(page, /我已经留下了足够的捐款/);
  assert.match(page, /再寻找也未必能找到狄鑫福真正的家人/);
  assert.match(page, /所以，我已经尽力了/);
  assert.match(page, /清佛商人处的那笔钱/);
  assert.match(page, /茶瓜大道，佟牌楼旁、观音庙附近/);
  assert.match(page, /装入信封/);
  assert.match(page, /onClick=\{sealReply\}/);
  assert.doesNotMatch(page, /按住，折起信纸|holdWithPointer|foldHolding|foldTimer/);
  assert.match(page, /onDragStart/);
  assert.match(page, /onDrop/);
  assert.match(styles, /phase-opening\.attempt-1/);
  assert.match(styles, /phase-opening\.attempt-3/);
  assert.match(styles, /phase-closing/);
  assert.match(styles, /room-letter-hotspot/);
  assert.match(styles, /\.room-letter-hotspot span \{[\s\S]*opacity: 0\.82/);
  assert.match(styles, /@keyframes return-stop-invitation/);
  assert.match(styles, /\.stage-map \.ti-figure/);
  assert.match(styles, /incoming-letter-closed/);
  assert.match(styles, /reason-fold-slot/);
  assert.match(styles, /seal-letter-action/);
  assert.doesNotMatch(styles, /hold-to-fold|fold-hold-progress|reply-letter\.is-folding|folded-letter-settles/);
  assert.match(page, /回到洛雷托 <span>→<\/span>/);
  assert.doesNotMatch(page, /回到洛雷托写下遗嘱/);
  assert.match(page, /testament-study-v2\.webp/);
  assert.match(page, /特奥多罗的遗嘱/);
  assert.match(page, /我把我的百万家财遗赠给魔鬼/);
  assert.match(page, /<button type="button" className=\{finalArtifactsSeen\.includes\("testament"\)[^>]+onClick=\{openFinalTestament\} aria-label="查看遗嘱">遗嘱<\/button>/);
  assert.match(page, /<button type="button" className=\{finalArtifactsSeen\.includes\("book"\)[^>]+onClick=\{openFinalBook\} aria-label="查看《满大人》">《满大人》<\/button>/);
  assert.match(styles, /\.final-artifact-progress button:hover/);
  assert.match(styles, /\.final-artifact-progress button:focus-visible/);
  assert.doesNotMatch(page, /《满大人》· 扉页/);
  assert.match(page, /只有我们每日用双手挣来的面包才真正香甜：千万别杀害满大人/);
  assert.match(styles, /will-unfold/);
  assert.match(styles, /book-rise/);
  assert.match(styles, /page-open/);
  assert.doesNotMatch(page, /狄青福|开启声音并翻开书页|原创程序化配乐|浏览器实时合成|翻到黄色高亮的书页|一个满大人死了|魔鬼 · 第|入住洛雷托的宫殿|看向镜子里的第四个人|小说直到上海才重新标出地点|哥萨克与译员萨托|原作让“后代”|选择“再寻找一次”并没有制造|特奥多罗只在脑中排演|原作没有给特奥多罗|原作提供的稳定出口|终局并不是“享受或悔恨”的二选一|告诫因此也沾染了自我开脱/);

  await Promise.all([
    access(new URL("../public/tienho-prototype/index.html", import.meta.url)),
    access(new URL("../public/tienho-prototype/script.js", import.meta.url)),
    access(new URL("../public/tienho-prototype/styles.css", import.meta.url)),
    access(new URL("../public/tienho-prototype/assets/tienho-dream.webp", import.meta.url)),
    access(new URL("../public/tienho-prototype/assets/tienho-reality.webp", import.meta.url)),
    access(new URL("../public/tienho-prototype/assets/wilderness-teodoro-v2.webp", import.meta.url)),
    access(new URL("../public/lisbon-room-v3.webp", import.meta.url)),
    access(new URL("../public/palace-ghost.webp", import.meta.url)),
    access(new URL("../public/east-journey.webp", import.meta.url)),
    access(new URL("../public/pequim-arrival-v1.webp", import.meta.url)),
    access(new URL("../public/pequim-tartar-city-v1.webp", import.meta.url)),
    access(new URL("../public/pequim-chinese-quarter-v1.webp", import.meta.url)),
    access(new URL("../public/pequim-litter-interior-v1.webp", import.meta.url)),
    access(new URL("../public/ministry-office-awake-v1.webp", import.meta.url)),
    access(new URL("../public/ministry-office-dozing-v1.webp", import.meta.url)),
    access(new URL("../public/dream-cloud.webp", import.meta.url)),
    access(new URL("../public/feira-da-ladra-v1.webp", import.meta.url)),
    access(new URL("../public/camilloff-departure-v1.webp", import.meta.url)),
    access(new URL("../public/camilloff-return-map-v1.webp", import.meta.url)),
    access(new URL("../public/camilloff-map-hand-v1.webp", import.meta.url)),
    access(new URL("../public/camilloff-day1-mansion.webp", import.meta.url)),
    access(new URL("../public/camilloff-day1-yamen.webp", import.meta.url)),
    access(new URL("../public/camilloff-day2-mansion.webp", import.meta.url)),
    access(new URL("../public/camilloff-day2-yamen.webp", import.meta.url)),
    access(new URL("../public/camilloff-day3-mansion.webp", import.meta.url)),
    access(new URL("../public/camilloff-day3-yamen.webp", import.meta.url)),
    access(new URL("../public/camilloff-day4-mansion.webp", import.meta.url)),
    access(new URL("../public/camilloff-day4-yamen.webp", import.meta.url)),
    access(new URL("../public/intro-cover-v1.webp", import.meta.url)),
    access(new URL("../public/inheritance-messenger-v1.webp", import.meta.url)),
    access(new URL("../public/tienho-reality-v1.webp", import.meta.url)),
    access(new URL("../public/mission-cloister-v7.webp", import.meta.url)),
    access(new URL("../public/mission-room-v1.webp", import.meta.url)),
    access(new URL("../public/wilderness-teodoro-v2.webp", import.meta.url)),
    access(new URL("../public/renounce-room-v1.webp", import.meta.url)),
    access(new URL("../public/loreto-restored-v1.webp", import.meta.url)),
    access(new URL("../public/devil-alone-street-v2.webp", import.meta.url)),
    access(new URL("../public/testament-study-v2.webp", import.meta.url)),
    access(new URL("../public/ti-chin-fu-corpse-v3.webp", import.meta.url)),
    access(new URL("../public/devil-seated-cutout-v2.webp", import.meta.url)),
    access(new URL("../public/bell-v1.webp", import.meta.url)),
    access(new URL("../public/audio/unsolved-investigation-v1.ogg", import.meta.url)),
    access(new URL("../public/audio/apparitions-ball.mp3", import.meta.url)),
    access(new URL("../public/audio/i-swear-i-saw-it.ogg", import.meta.url)),
    access(new URL("../public/audio/the-journey-begins.ogg", import.meta.url)),
    access(new URL("../public/audio/pursuit.mp3", import.meta.url)),
    access(new URL("../public/audio/contemplation.mp3", import.meta.url)),
    access(new URL("../public/audio/church-bell-real-v1.mp3", import.meta.url)),
  ]);
});
