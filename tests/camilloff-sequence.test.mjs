import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("connects departure, abstract intercut, and return map", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const intercut = await readFile(new URL("../app/camilloff-intercut.tsx", import.meta.url), "utf8");
  const map = await readFile(new URL("../app/camilloff-return-map.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /go\("camilloffIntercut"\)/);
  assert.match(page, /"camilloff-intercut": "camilloffIntercut"/);
  assert.match(page, /onComplete=\{\(\) => go\("camilloffReturn"\)\}/);
  assert.match(page, /allBeijingStopsVisited[\s\S]*go\("camilloffDeparture"\)/);
  assert.match(page, /"confession" \| "briefing" \| "leaving" \| "gone"/);
  assert.match(page, /回到卡米洛夫府邸，我把那柄摇铃/);
  assert.match(page, /Faça uma coisa\. Procure a família de Ti Chin-Fu/);
  assert.match(page, /听他安排查访/);
  assert.doesNotMatch(page, /当晚 · 卡米洛夫府邸|次日清早|第二天清早|清晨的石路/);
  assert.doesNotMatch(page, /camilloffSalon|camilloffMeeting|generalaTopics|chooseCamilloff/);
  assert.doesNotMatch(page, /将军夫人的客厅|卡米洛夫的建议/);
  assert.match(page, /camilloffDeparture: musicCues\.oriental/);
  assert.match(page, /mansionIntercut: \{ src: "\/audio\/apparitions-ball\.mp3", volume: 0\.16 \}/);
  assert.match(page, /mapMeeting: \{ src: "\/audio\/unsolved-investigation-v1\.ogg", volume: 0\.62 \}/);
  assert.match(page, /camilloffIntercut: musicCues\.mansionIntercut/);
  assert.match(page, /camilloffReturn: musicCues\.mapMeeting/);
  assert.match(intercut, /<span className="chapter-kicker">第五幕 · 北京<\/span>/);
  assert.match(intercut, /<h2 className="chapter-title">府邸内外<\/h2>/);
  assert.match(intercut, /点击怀表，让时间推移/);
  assert.doesNotMatch(intercut, /四日|下一日|同一天|这一天/);
  assert.doesNotMatch(intercut, /第一小章|印章与茶杯|名单与扇子|门槛与门扉|消息与痕迹/);
  assert.match(intercut, /if \(!seenBoth\) return/);
  assert.match(intercut, /if \(seenBoth\) advanceDay\(\);/);
  assert.doesNotMatch(intercut, /watch-turn-hint|watch-turn-arc|watch-turn-arrow/);
  assert.match(intercut, /day === 0 && <span className="intercut-control-hint"[^>]*><small>点击地球仪<\/small>穿梭于府邸内外<\/span>/);
  assert.match(intercut, /day === 0 && <span className=\{`intercut-control-hint \$\{seenBoth \? "is-ready" : "is-waiting"\}`\}[^>]*><small>点击怀表<\/small>让时间推移<\/span>/);
  assert.match(intercut, /她离开时把一只浅色的手套忘在了我的桌上/);
  assert.match(map, /看向桌角的女士手套/);
  assert.match(map, /mapRoutes\.length/);
  assert.match(map, /const handDockPositions = \[/);
  assert.match(map, /\[30, 60, 2\]/);
  assert.match(map, /\[93, 18, -4\]/);
  assert.match(map, /handDockPositions\[mapStep\]/);
  assert.match(styles, /\.intercut-card\.is-yamen/);
  assert.match(styles, /watch-hand-invitation/);
  assert.match(styles, /filter: brightness\(1\.55\) drop-shadow/);
  assert.match(styles, /\.intercut-control-hint/);
  assert.match(styles, /\.intercut-control-hint\.is-waiting/);
  assert.match(styles, /\.space-globe \{[\s\S]*width: 84px;[\s\S]*height: 84px;/);
  assert.match(styles, /\.time-watch \{[\s\S]*width: 75px;[\s\S]*height: 84px;/);
  assert.match(styles, /repeating-conic-gradient\(from -1deg/);
  assert.match(styles, /\.watch-face::before/);
  assert.match(styles, /\.space-globe::before/);
  assert.match(styles, /width: min\(31%, 326px\)/);
  assert.match(styles, /\.departure-confession/);
  assert.doesNotMatch(styles, /stage-camilloffSalon|stage-camilloffMeeting/);

  await Promise.all(
    [1, 2, 3, 4].flatMap((day) => ["mansion", "yamen"].map((place) =>
      access(new URL(`../public/camilloff-day${day}-${place}.webp`, import.meta.url)),
    )),
  );
});
