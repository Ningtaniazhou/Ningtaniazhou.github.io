// Browser compatibility regression for O Mandarim.
// Start the local game server before running this script.
// Requires Playwright and its browsers; see outputs/compatibility-2026-09-11/report.md.
// QA_SCENARIOS selects scenarios; main runs a continuous playthrough.
// Unlike locator.click(), point() cannot scroll overflow:hidden to rescue a
// clipped button: it verifies a real user-reachable hit point after painting.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium, webkit, firefox } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.GAME_URL || 'http://127.0.0.1:4191/';
const out = process.env.QA_OUTPUT || 'outputs/compatibility';
await fs.mkdir(out, { recursive: true });
const results = [];
const configs = JSON.parse(process.env.QA_CONFIGS || '[[568,320,true],[844,390,true],[932,430,true],[768,1024,true],[1024,768,true],[1024,600,false],[1280,720,false],[1920,1080,false],[640,360,false]]');
async function point(locator) {
    let error;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            return await measurePoint(locator);
        }
        catch (e) {
            error = e;
            await new Promise(resolve => setTimeout(resolve, 120));
        }
    }
    throw error;
}
async function measurePoint(locator) {
    await locator.waitFor({ state: 'visible' });
    return locator.evaluate(async (e) => {
        // Only scroll surfaces a person can scroll. Playwright's automatic
        // scrollIntoView also scrolls overflow:hidden and can conceal real defects.
        for (let p = e.parentElement; p; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (/auto|scroll/.test(s.overflowY) && p.scrollHeight > p.clientHeight) {
                const r = e.getBoundingClientRect(), pr = p.getBoundingClientRect();
                p.scrollTop += r.top - pr.top - (p.clientHeight - Math.min(r.height, p.clientHeight)) / 2;
            }
        }
        if (document.scrollingElement.scrollHeight > innerHeight) {
            const r = e.getBoundingClientRect();
            window.scrollBy(0, r.top - (innerHeight - Math.min(r.height, innerHeight)) / 2);
        }
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const r = e.getBoundingClientRect();
        let left = Math.max(0, r.left), right = Math.min(innerWidth, r.right), top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom);
        for (let p = e.parentElement; p; p = p.parentElement) {
            const s = getComputedStyle(p), pr = p.getBoundingClientRect();
            if (s.overflowY !== 'visible') {
                top = Math.max(top, pr.top);
                bottom = Math.min(bottom, pr.bottom);
            }
            if (s.overflowX !== 'visible') {
                left = Math.max(left, pr.left);
                right = Math.min(right, pr.right);
            }
        }
        for (const x of [(left + right) / 2, left + 5, right - 5])
            for (const y of [(top + bottom) / 2, top + 5, bottom - 5]) {
                if (right - left < 2 || bottom - top < 2)
                    continue;
                const hit = document.elementFromPoint(x, y);
                if (hit && (hit === e || e.contains(hit)))
                    return { x, y };
            }
        throw Error('Unreachable control: ' + e.textContent?.trim().slice(0, 70) + ' ' + JSON.stringify({ left, right, top, bottom, class: e.className }));
    });
}
async function click(page, locator, touch = false) { const pt = await point(locator); if (touch)
    await page.touchscreen.tap(pt.x, pt.y);
else
    await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(100); await page.locator('.scene-loading-curtain').waitFor({ state: 'detached', timeout: 20000 }); }
let continuous = false;
async function open(page, stage) { if (continuous) {
    await page.locator(".stage-" + stage).waitFor({ timeout: 15000 });
    await page.locator(".scene-loading-curtain").waitFor({ state: "detached" });
    return;
} await page.goto(base + '?preview=' + stage, { waitUntil: 'domcontentloaded', timeout: 20000 }); await page.locator('.stage-' + stage).waitFor(); await page.locator('.scene-loading-curtain').waitFor({ state: 'detached' }); await page.waitForTimeout(100); }
const scenarios = {
    async refusal(p, t) { await open(p, 'bell'); for (let i = 0; i < 3; i++)
        await click(p, p.getByRole('button', { name: '拒绝', exact: true }), t); await p.locator('.stage-refusalEnding').waitFor(); await click(p, p.getByRole('button', { name: '合上旧书 →', exact: true }), t); await click(p, p.getByRole('button', { name: '返回故事的开始' }), t); await p.locator('.stage-intro').waitFor(); },
    async back(p, t) { await open(p, 'market'); for (let i = 0, n = await p.locator('.hotspot-index button').count(); i < n; i++)
        await click(p, p.locator('.hotspot-index button').nth(i), t); await click(p, p.getByRole('button', { name: '回家 →', exact: true }), t); await click(p, p.getByRole('button', { name: '← 返回上一页', exact: true }), t); await p.locator('.stage-market').waitFor(); assert.equal(await p.locator('.hotspot-index button.is-found').count(), 0); assert.equal(await p.evaluate(() => scrollY + document.querySelector('.game-shell').scrollTop), 0); },
    async geometry(p, t) { await open(p, 'room'); const delta = await p.evaluate(async () => { const art = document.querySelector('.scene-image'), layer = document.querySelector('.hotspot-layer'); const image = new Image(); image.src = getComputedStyle(art).backgroundImage.slice(5, -2); await image.decode(); const a = art.getBoundingClientRect(), b = layer.getBoundingClientRect(), scale = Math.max(a.width / image.naturalWidth, a.height / image.naturalHeight); if (!layer.getClientRects().length)
        return 0; return Math.max(Math.abs(b.width - image.naturalWidth * scale), Math.abs(b.height - image.naturalHeight * scale)); }); assert.ok(delta < 2, 'hotspot canvas must match covered artwork'); await open(p, 'tienho'); const f = p.frameLocator('iframe'); await f.locator('#startButton').click(); const box = await p.locator('iframe').boundingBox(); const pt = await point(f.locator('#coinSource')); await p.mouse.move(pt.x + box.x, pt.y + box.y); await p.mouse.down(); await p.mouse.move(pt.x + box.x + 12, pt.y + box.y - 8); const dragError = await f.locator('#coinSource').evaluate((e, { x, y }) => { const rect = e.getBoundingClientRect(); return Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y); }, { x: pt.x + 12, y: pt.y - 8 }); await p.mouse.up(); assert.ok(dragError < 10, 'coin drag jumped away from pointer: ' + dragError); },
    async resize(p, t) { await open(p, 'letter'); await click(p, p.getByRole('button', { name: '桌上的来信 →', exact: true }), t); await click(p, p.getByRole('button', { name: '拆开卡米洛夫的来信' }), t); await click(p, p.getByRole('button', { name: '继续读信' }), t); const original = p.viewportSize(); await p.setViewportSize({ width: 390, height: 844 }); assert.equal(await p.locator('.orientation-gate').isVisible(), true); await p.setViewportSize(original); await click(p, p.getByRole('button', { name: '继续读信' }), t); await click(p, p.getByRole('button', { name: '合上信' }), t); await click(p, p.getByRole('button', { name: '写回信' }), t); },
    async largeText(p, t) {
        for (const stage of ['office', 'supplication', 'letter']) {
            await open(p, stage);
            if (stage === 'letter') {
                await click(p, p.getByRole('button', { name: '桌上的来信 →', exact: true }), t);
                await click(p, p.getByRole('button', { name: '拆开卡米洛夫的来信' }), t);
            }
            await p.evaluate(() => { const all = [...document.querySelectorAll('p,h1,h2,h3,button,blockquote,span,small,strong,b,em')].map(e => [e, parseFloat(getComputedStyle(e).fontSize)]); for (const [e, size] of all)
                e.style.fontSize = (size * 2) + 'px'; });
            if (stage === 'office')
                await click(p, p.getByRole('button', { name: '打瞌睡', exact: true }), t);
            if (stage === 'letter')
                await click(p, p.getByRole('button', { name: '继续读信' }), t);
            if (stage === 'supplication') {
                await click(p, p.getByRole('button', { name: '乞求 →', exact: true }), t);
                await p.getByRole('button', { name: '回到洛雷托' }).waitFor();
                await click(p, p.getByRole('button', { name: '回到洛雷托' }), t);
            }
        }
    },
    async visuals(p, t) {
        for (const stage of ['office', 'room', 'supplication', 'testament', 'tiDeath', 'repose']) {
            await open(p, stage);
            await p.screenshot({ path: out + '/' + stage + '-' + p.viewportSize().width + '.png' });
        }
        await open(p, 'letter');
        await click(p, p.getByRole('button', { name: '桌上的来信 →', exact: true }), t);
        await click(p, p.getByRole('button', { name: '拆开卡米洛夫的来信' }), t);
        await click(p, p.getByRole('button', { name: '继续读信' }), t);
        await click(p, p.getByRole('button', { name: '继续读信' }), t);
        await p.screenshot({ path: out + '/letter-' + p.viewportSize().width + '.png' });
    },
    async main(p, t) {
        await open(p, 'intro');
        continuous = true;
        const act = async (name) => click(p, p.getByRole('button', { name, exact: true }), t);
        const inspect = async () => { for (let i = 0, n = await p.locator('.hotspot-index button').count(); i < n; i++)
            await click(p, p.locator('.hotspot-index button').nth(i), t); };
        try {
            await act('进入故事世界');
            await scenarios.office(p, t);
            await inspect();
            await act('回家 →');
            await inspect();
            await act('仔细翻阅旧书 →');
            await act('桌旁传来声音 →');
            await act('拒绝');
            await act('拒绝');
            await click(p, p.locator('.choice-button.dangerous'), t);
            await p.locator('.death-caption.is-visible').waitFor({ timeout: 16000 });
            await act('一个月之后 →');
            await act('拆开黑蜡封缄的信');
            await act('搬入洛雷托宫殿 →');
            await inspect();
            await act('我无法忽视…… →');
            await act('沉湎享乐');
            await act('前往中国 →');
            for (let i = 0; i < 5; i++)
                await act('继续旅程 →');
            await act('进入北京 →');
            await inspect();
            await act('坐进轿子，穿过东直门 →');
            await scenarios.curtain(p, t);
            await act('听他安排查访 →');
            while (await p.getByRole('button', { name: '继续听他说 →', exact: true }).count())
                await act('继续听他说 →');
            await act('送卡米洛夫到门前 →');
            await act('留在府邸等待消息 →');
            await scenarios.intercut(p, t);
            await scenarios.map(p, t);
            await scenarios.tienho(p, t);
            await p.locator('.mission-awakening').waitFor({ state: 'detached', timeout: 15000 });
            await inspect();
            await act('回到房间 →');
            await scenarios.letter(p, t);
            for (let i = 0; i < 6; i++)
                await click(p, p.locator('.return-stamps button').nth(i), t);
            await act('回到洛雷托 →');
            await act('抛下财产 →');
            await inspect();
            await act('推开洛雷托豪宅的大门 →');
            await act('独自走入夜色 →');
            await act('追上他 →');
            await scenarios.supplication(p, t);
            await scenarios.endings(p, t);
        }
        finally {
            continuous = false;
        }
    },
    async tienho(p, t) {
        await open(p, 'tienho');
        const f = p.frameLocator('iframe');
        const tap = async (l) => { const pt = await point(l), box = await p.locator('iframe').boundingBox(); if (t)
            await p.touchscreen.tap(pt.x + box.x, pt.y + box.y);
        else
            await p.mouse.click(pt.x + box.x, pt.y + box.y); await p.waitForTimeout(100); };
        await tap(f.locator('#startButton'));
        await tap(f.locator('#widowTarget'));
        await tap(f.locator('#riceTarget'));
        for (let i = 0; i < 3; i++)
            await tap(f.locator('.lantern').nth(i));
        await f.locator('#moneyBag').waitFor({ state: 'visible' });
        await point(f.locator('#moneyBag'));
        await f.locator('#moneyBag').focus();
        await p.keyboard.down('Space');
        await p.waitForTimeout(1400);
        await p.keyboard.up('Space');
        await tap(f.locator('[data-evidence="sato"]'));
        await tap(f.locator('#identityContinue'));
        await tap(f.locator('#escapeBag'));
        await f.locator('#cutBagButton').waitFor({ state: 'visible', timeout: 25000 });
        await tap(f.locator('#cutBagButton'));
        await f.locator('#wildernessAction').waitFor({ state: 'visible' });
        for (let i = 0; i < 4; i++) {
            await tap(f.locator('#wildernessAction'));
            await p.waitForTimeout(1000);
        }
        await point(f.locator('#wildernessAction'));
        await f.locator('#wildernessAction').focus();
        await p.keyboard.down('Space');
        await p.waitForTimeout(6300);
        await p.keyboard.up('Space');
        await p.locator('.stage-mission').waitFor({ timeout: 15000 });
    },
    async office(p, t) { await open(p, 'office'); for (let i = 0; i < 3; i++) {
        const b = p.locator('.office-mobile-documents button').nth(i);
        await click(p, await b.isVisible() ? b : p.locator('.office-document-hotspots button').nth(i), t);
        await point(p.locator('.office-document-sheet footer'));
        await click(p, p.getByRole('button', { name: '合上公文' }), t);
    } await click(p, p.getByRole('button', { name: '打瞌睡', exact: true }), t); await click(p, p.getByRole('button', { name: '下班 →', exact: true }), t); await p.locator('.stage-market').waitFor(); await p.locator('.scene-loading-curtain').waitFor({ state: 'detached' }); },
    async narratives(p, t) { for (const s of ['market', 'room', 'book', 'inheritance', 'luxury', 'ghost', 'map', 'beijing', 'mission', 'return', 'reckoning', 'renounce', 'prison', 'devilReturn']) {
        await open(p, s);
        for (let i = 0, n = await p.locator('.hotspot-index button').count(); i < n; i++)
            await click(p, p.locator('.hotspot-index button').nth(i), t);
        const buttons = p.locator('.scene-body button:visible:not(:disabled),.scene-card > button:visible:not(:disabled)');
        if (await buttons.count())
            await point(buttons.last());
        assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, s + ' horizontal overflow');
    } },
    async intercut(p, t) { await open(p, 'camilloffIntercut'); for (let day = 0; day < 4; day++) {
        await point(p.locator('.intercut-copy > p'));
        await click(p, p.locator('.space-globe'), t);
        await point(p.locator('.intercut-copy > p'));
        await click(p, p.locator('.time-watch'), t);
    } await p.locator('.stage-camilloffReturn').waitFor(); },
    async map(p, t) { await open(p, 'camilloffReturn'); await click(p, p.getByRole('button', { name: '看向卡米洛夫 →', exact: true }), t); for (let i = 0; i < 6; i++) {
        await click(p, p.locator('.map-hand-control'), t);
        await p.waitForTimeout(750);
    } await click(p, p.getByRole('button', { name: '抬头看向卡米洛夫' }), t); await click(p, p.getByRole('button', { name: '与萨托一同前往天河村' }), t); await p.locator('.stage-tienho').waitFor(); },
    async letter(p, t) { await open(p, 'letter'); await click(p, p.getByRole('button', { name: '桌上的来信 →', exact: true }), t); await click(p, p.getByRole('button', { name: '拆开卡米洛夫的来信' }), t); await click(p, p.getByRole('button', { name: '继续读信' }), t); await click(p, p.getByRole('button', { name: '继续读信' }), t); for (let i = 0; i < 3; i++)
        await point(p.locator('.letter-fact-panel').nth(i).locator('p').last()); await click(p, p.getByRole('button', { name: '合上信' }), t); await click(p, p.getByRole('button', { name: '写回信' }), t); for (let i = 0; i < 3; i++)
        await click(p, p.locator('.reason-note').nth(i), t); await click(p, p.getByRole('button', { name: '装入信封' }), t); await click(p, p.getByRole('button', { name: '返回欧洲' }), t); await p.locator('.stage-return').waitFor(); },
    async curtain(p, t) { await open(p, 'repose'); for (let i = 0; i < 2; i++) {
        await click(p, p.locator('.beijing-destination-grid button').nth(i), t);
        const handle = p.getByRole('slider');
        await handle.waitFor();
        await handle.focus();
        await p.keyboard.press('End');
        await click(p, p.getByRole('button', { name: '起轿' }), t);
    } await click(p, p.getByRole('button', { name: '前往卡米洛夫府邸' }), t); await p.locator('.stage-camilloffDeparture').waitFor(); },
    async supplication(p, t) { await open(p, 'supplication'); await click(p, p.getByRole('button', { name: '乞求 →', exact: true }), t); await p.getByRole('button', { name: '回到洛雷托' }).waitFor(); await click(p, p.getByRole('button', { name: '回到洛雷托' }), t); await p.locator('.stage-testament').waitFor(); },
    async endings(p, t) { await open(p, 'testament'); await click(p, p.getByRole('button', { name: '查看遗嘱' }), t); await point(p.locator('.will-sheet p').last()); await click(p, p.getByRole('button', { name: '收起', exact: true }), t); await click(p, p.getByRole('button', { name: '查看《满大人》' }), t); await click(p, p.getByRole('button', { name: '翻开', exact: true }), t); await point(p.locator('.final-book-leaf').last().locator('p').last()); await click(p, p.getByRole('button', { name: '合上', exact: true }), t); await p.getByRole('button', { name: '返回故事的开始' }).waitFor({ timeout: 18000 }); await click(p, p.getByRole('button', { name: '返回故事的开始' }), t); await p.locator('.stage-intro').waitFor(); },
    async audioFailure(p, t) { await p.route('**/audio/**', route => route.abort()); await open(p, 'intro'); await click(p, p.getByRole('button', { name: '进入故事世界' }), t); await p.locator('.stage-office').waitFor(); await p.unroute('**/audio/**'); }
};
for (const engine of (process.env.QA_ENGINES || 'chromium,webkit,firefox').split(',')) {
    const browser = await ({ chromium, webkit, firefox }[engine]).launch(engine === 'chromium' ? { ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), headless: true } : { headless: true });
    for (const [w, h, touch] of configs) {
        if (engine === 'firefox' && touch)
            continue;
        const t = touch && engine !== 'firefox';
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: t, hasTouch: t, reducedMotion: 'reduce' });
        const p = await ctx.newPage();
        p.setDefaultTimeout(6000);
        for (const [name, fn] of Object.entries(scenarios)) {
            if (!(process.env.QA_SCENARIOS || 'office,narratives,intercut,map,letter,curtain,supplication,endings,audioFailure').split(',').includes(name))
                continue;
            const row = { engine, w, h, touch, name };
            try {
                await fn(p, t);
                row.pass = true;
                console.log('PASS', engine, w, h, name);
            }
            catch (e) {
                row.pass = false;
                row.error = e.message.slice(0, 900);
                console.log('FAIL', engine, w, h, name, row.error);
                await p.screenshot({ path: `${out}/${engine}-${w}-${h}-${name}.png` });
            }
            results.push(row);
            await fs.writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
        }
        await ctx.close();
    }
    await browser.close();
}
console.log('TOTAL', results.filter(r => r.pass).length, '/', results.length);
process.exitCode = results.some(r => !r.pass) ? 1 : 0;
