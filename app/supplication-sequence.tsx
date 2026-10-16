"use client";
import { asset } from "./asset-path";


import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./supplication-prototype/page.module.css";

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

type SupplicationSequenceProps = {
  soundEnabled: boolean;
  onContinue: () => void;
  children?: ReactNode;
};

export default function SupplicationSequence({ soundEnabled, onContinue, children }: SupplicationSequenceProps) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [started, setStarted] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const timersRef = useRef<number[]>([]);
  const contextRef = useRef<AudioContext | null>(null);

  const clearSequence = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const queue = useCallback((callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  }, []);

  useEffect(() => {
    clearSequence();
    if (!started) return clearSequence;

    let context: AudioContext | null = null;
    if (soundEnabled) {
      context = contextRef.current ?? new window.AudioContext();
      contextRef.current = context;
      void context.resume();
      [0, 280, 560, 820].forEach((delay, index) => {
        queue(() => context && playImpact(context, 112 - index * 7, 0.045, 0.12), delay);
      });
    }

    queue(() => {
      setPhase("kneeling");
      if (context) playImpact(context, 82, 0.085, 0.2);
    }, 1120);
    queue(() => setPhase("vanishing"), 1740);
    queue(() => {
      setPhase("falling");
      if (context) playImpact(context, 58, 0.16, 0.45);
    }, 3180);
    queue(() => setPhase("aftermath"), 4000);

    return clearSequence;
  }, [clearSequence, queue, replayKey, soundEnabled, started]);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
    };
  }, []);

  const visibleTeodoro = phase === "waiting" ? "running" : phase;
  const startSequence = () => {
    setPhase("running");
    setStarted(true);
    setReplayKey((value) => value + 1);
  };
  const replaySequence = () => {
    clearSequence();
    setPhase("running");
    setStarted(true);
    setReplayKey((value) => value + 1);
  };

  return (
    <div className={styles.integratedPage}>
      <section className={`${styles.stage} ${styles.integratedStage} ${styles[phase]}`} aria-label="Teodoro suplica ao Diabo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.street} src={asset("/supplication-street-v1.webp")} alt="Calçada molhada à luz do gás" />
        <div className={styles.streetShade} aria-hidden="true" />
        <div className={styles.gasGlow} aria-hidden="true" />
        <div className={styles.corpseLayer}>{children}</div>
        <aside className={`${styles.storyPanel} ${styles.integratedPanel}`}>
          <p className={`${styles.eyebrow} chapter-kicker`}>Ato VIII · A rua à noite</p>
          <h1 className="chapter-title">A súplica</h1>
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
          {phase === "waiting" && (
            <button className={styles.begButton} type="button" onClick={startSequence}>A súplica <span>→</span>
            </button>
          )}
          {phase === "aftermath" && (
            <div className={styles.sequenceActions}>
              <button className={styles.begButton} type="button" onClick={replaySequence}>Rever
              </button>
              <button className={styles.begButton} type="button" onClick={onContinue}>Voltar ao Loreto <span>→</span>
              </button>
            </div>
          )}
        </aside>

        <figure key={`devil-${replayKey}`} className={styles.devil} aria-label="O Diabo sob o candeeiro de gás">
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
    </div>
  );
}
