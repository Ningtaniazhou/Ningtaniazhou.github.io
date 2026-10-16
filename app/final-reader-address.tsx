"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./final-reader-address.module.css";
import { ABOUT_COPY, CREATOR_COPY, MUSIC_CREDITS } from "./version-copy";

type Props = {
  onSilence: (duration?: number) => void;
  onRing: () => void;
  onEndingMusic: () => void;
  onRestart: () => void;
  creditsOnly?: boolean;
};

type Phase = "address" | "ring" | "credits";

const addressLines = [
  "Agora, escolhe por ti.",
  "Tocarias esta campainha?",
  "Leitor — meu semelhante, meu irmão.",
];

const timing = {
  firstLine: 700,
  secondLine: 3200,
  thirdLine: 5900,
  ring: 12500,
  credits: 16300,
} as const;

export default function FinalReaderAddress({ onSilence, onRing, onEndingMusic, onRestart, creditsOnly = false }: Props) {
  const [lineCount, setLineCount] = useState(creditsOnly ? addressLines.length : 0);
  const [phase, setPhase] = useState<Phase>(creditsOnly ? "credits" : "address");
  const [creditsPaused, setCreditsPaused] = useState(false);
  const callbacks = useRef({ onSilence, onRing, onEndingMusic });

  useEffect(() => {
    if (creditsOnly) {
      callbacks.current.onEndingMusic();
      return;
    }
    callbacks.current.onSilence(320);
    const timers = [
      window.setTimeout(() => setLineCount(1), timing.firstLine),
      window.setTimeout(() => setLineCount(2), timing.secondLine),
      window.setTimeout(() => setLineCount(3), timing.thirdLine),
      window.setTimeout(() => {
        setPhase("ring");
        callbacks.current.onRing();
      }, timing.ring),
      window.setTimeout(() => {
        setPhase("credits");
        callbacks.current.onEndingMusic();
      }, timing.credits),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [creditsOnly]);

  const phaseClass = phase === "ring" ? styles.phaseRing : phase === "credits" ? styles.phaseCredits : "";

  return (
    <section className={`${styles.finale} ${phaseClass}`} aria-label={creditsOnly ? "Sobre esta edição e créditos finais" : "Teodoro interroga o leitor"}>
      <div className={styles.portrait} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      {phase !== "credits" && (
        <div className={styles.address} aria-live="polite">
          {addressLines.map((line, index) => (
            <p key={line} className={index < lineCount ? styles.visible : ""}>{line}</p>
          ))}
        </div>
      )}

      {phase === "credits" && (
        <>
          <button className={styles.restart} onClick={onRestart}>Recomeçar</button>
          <button className={styles.pause} onClick={() => setCreditsPaused((value) => !value)} aria-pressed={creditsPaused}>{creditsPaused ? "Continuar" : "Pausar créditos"}</button>
          <div className={styles.creditsRoll} style={{ animationPlayState: creditsPaused ? "paused" : "running" }} aria-label="Sobre esta edição e equipa">
            <p className={styles.creditsKicker}>O Mandarim · Narrativa interativa</p>
            {ABOUT_COPY.map((paragraph) => <p className={styles.about} key={paragraph}>{paragraph}</p>)}
            <p className={styles.creator}>{CREATOR_COPY}</p>
            <div className={styles.divider} />
            <h3>Música</h3>
            <div className={styles.musicCredits}>
              {MUSIC_CREDITS.map((credit) => (
                <a key={credit.title} href={credit.href} target="_blank" rel="noreferrer">
                  {credit.title} · {credit.creator} · {credit.license}
                </a>
              ))}
            </div>
            <p className={styles.endMark}>Fim</p>
          </div>
        </>
      )}
    </section>
  );
}
