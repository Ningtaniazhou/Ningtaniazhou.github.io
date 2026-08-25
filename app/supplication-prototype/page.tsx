/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type Phase = "waiting" | "running" | "kneeling" | "vanishing" | "falling" | "aftermath";

function playImpact(context: AudioContext, frequency: number, volume: number, duration: number) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(38, frequency * 0.48), now + duration);
  filter.type = "lowpass";
  filter.frequency.value = 520;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(filter).connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.04);
}

export default function SupplicationPrototypePage() {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [soundOn, setSoundOn] = useState(true);
  const timersRef = useRef<number[]>([]);
  const contextRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(true);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const clearSequence = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearSequence();
      void contextRef.current?.close();
    };
  }, [clearSequence]);

  const ensureAudio = useCallback(async () => {
    if (!soundOnRef.current || typeof window === "undefined") return null;
    if (!contextRef.current) contextRef.current = new window.AudioContext();
    if (contextRef.current.state === "suspended") await contextRef.current.resume();
    return contextRef.current;
  }, []);

  const queue = useCallback((callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  }, []);

  const beginSupplication = useCallback(async () => {
    clearSequence();
    setPhase("running");
    const context = await ensureAudio();

    if (context && soundOnRef.current) {
      [0, 280, 560, 820].forEach((delay, index) => {
        queue(() => playImpact(context, 112 - index * 7, 0.045, 0.12), delay);
      });
    }

    queue(() => {
      setPhase("kneeling");
      if (context && soundOnRef.current) playImpact(context, 82, 0.085, 0.2);
    }, 1120);

    queue(() => setPhase("vanishing"), 1740);

    queue(() => {
      setPhase("falling");
      if (context && soundOnRef.current) playImpact(context, 58, 0.16, 0.45);
    }, 3180);

    queue(() => setPhase("aftermath"), 4000);
  }, [clearSequence, ensureAudio, queue]);

  const busy = phase !== "waiting" && phase !== "aftermath";
  const visibleTeodoro = phase === "waiting" ? "running" : phase;

  return (
    <main className={styles.page}>
      <section className={`${styles.stage} ${styles[phase]}`} aria-label="特奥多罗乞求魔鬼的独立动画样片">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.street} src="/supplication-street-v1.webp" alt="煤气灯照亮的湿石路" />
        <div className={styles.streetShade} aria-hidden="true" />
        <div className={styles.gasGlow} aria-hidden="true" />
        <header className={styles.header}>
          <a className={styles.backLink} href="/">← 返回《满大人》</a>
          <div className={styles.headerActions}>
            <button className={styles.soundButton} type="button" onClick={() => setSoundOn((current) => !current)}>
              声音：{soundOn ? "开" : "关"}
            </button>
            <span>独立动画样片</span>
          </div>
        </header>

        <aside className={styles.storyPanel}>
          <p className={styles.eyebrow}>第八幕 · 夜路</p>
          <h1>乞求</h1>
          <div className={styles.dialogueExcerpt}>
            <p>
              <strong>特奥多罗</strong>
              <span lang="pt">“Livra-me das minhas riquezas! Ressuscita o Mandarim! Restitui-me a paz da miséria!”</span>
              <span>“把我从这笔财富中救出来！让满大人复活！把贫穷的安宁还给我！”</span>
            </p>
            <p className={styles.narration}>
              <span lang="pt">Ele passou gravemente o seu guarda-chuva para debaixo do outro braço, e respondeu com bondade:</span>
              <span>他庄重地把雨伞移到另一只胳膊下，和善地回答：</span>
            </p>
            <p>
              <strong>魔鬼</strong>
              <span lang="pt">“Não pode ser, meu prezado senhor, não pode ser...”</span>
              <span>“不行，我亲爱的先生，不行……”</span>
            </p>
          </div>
          <button className={styles.begButton} type="button" onClick={beginSupplication} disabled={busy}>
            {phase === "aftermath" ? "再看一次" : busy ? "……" : "乞求"}
            {!busy && <span>→</span>}
          </button>
        </aside>

        <figure className={styles.devil} aria-label="魔鬼站在煤气灯下">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/devil-standing-v1.webp" alt="身穿黑衣、戴高礼帽并夹着雨伞的魔鬼" />
        </figure>

        <figure className={`${styles.teodoro} ${styles[`teodoro${visibleTeodoro[0].toUpperCase()}${visibleTeodoro.slice(1)}`]}`} aria-live="off">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visibleTeodoro === "running" ? "/teodoro-run-v1.webp" : visibleTeodoro === "kneeling" || visibleTeodoro === "vanishing" ? "/teodoro-kneel-v1.webp" : "/teodoro-fallen-v1.webp"}
            alt={visibleTeodoro === "running" ? "特奥多罗冲向魔鬼" : visibleTeodoro === "kneeling" || visibleTeodoro === "vanishing" ? "特奥多罗跪地伸手试图抱住魔鬼的小腿" : "特奥多罗失去支撑后扑倒在湿石路上"}
          />
        </figure>
      </section>
    </main>
  );
}
