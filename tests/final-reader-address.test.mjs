import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("turns the final artifacts into an automatic address to the reader", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const finale = await readFile(new URL("../app/final-reader-address.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/final-reader-address.module.css", import.meta.url), "utf8");
  const versionCopy = await readFile(new URL("../app/version-copy.ts", import.meta.url), "utf8");

  assert.match(page, /FinalReaderAddress/);
  assert.match(page, /testament: "testament"/);
  assert.match(page, /onRing=\{sound\.handbell\}/);
  assert.match(page, /onEndingMusic=\{\(\) => sound\.restartTrack\(musicCues\.mystery\.src, 0\.58\)\}/);
  assert.match(page, /creditsOnly=\{stage === "refusalEnding"\}/);
  assert.match(page, /onClick=\{\(\) => setFinaleStarted\(true\)\}>合上旧书/);
  assert.match(page, /refusalEnding: \{ act: "特别结局", title: "坚定的拒绝", subtitle: "" \}/);
  assert.doesNotMatch(page, /特别结局 · 坚定的拒绝|并非艾萨原文|回到故事的开头/);
  assert.match(page, /并非埃萨原文/);
  assert.doesNotMatch(page, /setRefusals\(3\)/);
  assert.match(page, /reflection: \{ src: "\/audio\/unsolved-investigation-v1\.ogg", volume: 0\.74 \}/);
  assert.match(page, /const restartTrack = \(src: string, volume: number\)/);
  assert.match(page, /stage === "testament"\) sound\.restartTrack\(cue\.src, cue\.volume\)/);
  assert.match(page, /mission: musicCues\.reflection/);
  assert.match(page, /letter: musicCues\.reflection/);
  assert.match(page, /testament: musicCues\.mystery/);
  assert.doesNotMatch(page, /audio\/contemplation\.mp3/);
  assert.match(page, /我一日日消沉下去，感到自己时日无多，便把自己的经历写成了书，并且立好了遗嘱。/);
  assert.doesNotMatch(page, /返回故事世界的起点/);

  assert.match(finale, /现在，替你自己选一次/);
  assert.match(finale, /你会摇响这柄铃吗/);
  assert.match(finale, /读者——我的同类，我的兄弟/);
  assert.match(finale, /ABOUT_COPY/);
  assert.match(finale, /MUSIC_CREDITS/);
  assert.match(finale, /creditsOnly \? "credits" : "address"/);
  assert.match(finale, /if \(creditsOnly\) \{[\s\S]*callbacks\.current\.onEndingMusic\(\);[\s\S]*return;/);
  assert.match(finale, /onSilence\(320\)/);
  assert.match(finale, /thirdLine: 4700/);
  assert.match(finale, /ring: 9800/);
  assert.match(finale, /credits: 13600/);
  assert.match(finale, /返回故事的开始/);
  assert.match(finale, /onRestart/);
  assert.doesNotMatch(page, /关于这个校订版/);
  assert.doesNotMatch(finale, /关于这个校订版/);
  assert.match(styles, /creditsScroll 62s/);
  assert.match(styles, /bellMoment 3\.6s/);
  assert.match(styles, /slowBlackout 3\.6s/);
  assert.doesNotMatch(styles, /\.address p:last-child \{[^}]*font-size/s);
  assert.match(styles, /teodoro-final-address-v1\.webp/);
  assert.match(versionCopy, /“满大人”和“狄鑫福”两个译名使用周汉军译本《满大人》中的译法/);
  assert.match(versionCopy, /游戏内的原作引文均由游戏制作者翻译/);
  assert.match(page, /ABOUT_COPY\.map\(\(paragraph\) => <p key=\{paragraph\}>/);
  assert.match(finale, /ABOUT_COPY\.map\(\(paragraph\) => <p className=\{styles\.about\} key=\{paragraph\}>/);

  const audioSources = [...new Set([...page.matchAll(/["'](\/audio\/[^"']+\.(?:mp3|ogg|wav))["']/g)].map((match) => match[1]))];
  assert.equal(audioSources.length, 7);
  for (const source of audioSources) {
    assert.match(versionCopy, new RegExp(`src: ["']${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
  }

  await access(new URL("../public/teodoro-final-address-v1.webp", import.meta.url));
});
