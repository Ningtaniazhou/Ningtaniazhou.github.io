import { asset } from "../asset-path";
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
      <section className={`${styles.stage} ${styles[phase]}`} aria-label="Estudo de animação: Teodoro suplica ao Diabo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.street} src={asset("/supplication-street-v1.webp")} alt="Calçada molhada à luz do gás" />
        <div className={styles.streetShade} aria-hidden="true" />
        <div className={styles.gasGlow} aria-hidden="true" />
        <header className={styles.header}>
          <a className={styles.backLink} href={asset("/")}>← Voltar a O Mandarim</a>
          <div className={styles.headerActions}>
            <button className={styles.soundButton} type="button" onClick={() => setSoundOn((current) => !current)}>Som: {soundOn ? "ligado" : "desligado"}
            </button>
            <span>Estudo de animação</span>
          </div>
        </header>

        <aside className={styles.storyPanel}>
          <p className={styles.eyebrow}>Ato VIII · A rua à noite</p>
          <h1>A súplica</h1>
          <div className={styles.dialogueExcerpt}>
            <p>
              <strong>Teodoro</strong>
              <span lang="pt-PT">“Livra-me das minhas riquezas! Ressuscita o Mandarim! Restitui-me a paz da miséria!”</span>

            </p>
            <p className={styles.narration}>
              <span lang="pt-PT">Ele passou gravemente o seu guarda-chuva para debaixo do outro braço, e respondeu com bondade:</span>

            </p>
            <p>
              <strong>O Diabo</strong>
              <span lang="pt-PT">“Não pode ser, meu prezado senhor, não pode ser...”</span>

            </p>
          </div>
          <button className={styles.begButton} type="button" onClick={beginSupplication} disabled={busy}>
            {phase === "aftermath" ? "Rever" : busy ? "……" : "A súplica"}
            {!busy && <span>→</span>}
          </button>
        </aside>

        <figure className={styles.devil} aria-label="O Diabo sob o candeeiro de gás">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/devil-standing-v1.webp")} alt="O Diabo de preto, com chapéu alto e guarda-chuva debaixo do braço" />
        </figure>

        <figure className={`${styles.teodoro} ${styles[`teodoro${visibleTeodoro[0].toUpperCase()}${visibleTeodoro.slice(1)}`]}`} aria-live="off">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visibleTeodoro === "running" ? asset("/teodoro-run-v1.webp") : visibleTeodoro === "kneeling" || visibleTeodoro === "vanishing" ? asset("/teodoro-kneel-v1.webp") : asset("/teodoro-fallen-v1.webp")}
            alt={visibleTeodoro === "running" ? "Teodoro corre para o Diabo" : visibleTeodoro === "kneeling" || visibleTeodoro === "vanishing" ? "Teodoro ajoelha-se e tenta abraçar as pernas do Diabo" : "Sem apoio, Teodoro cai na calçada molhada"}
          />
        </figure>
      </section>
    </main>
  );
}
