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
  "现在，替你自己选一次。",
  "你会摇响这柄铃吗？",
  "读者——我的同类，我的兄弟。",
];

const timing = {
  firstLine: 700,
  secondLine: 2600,
  thirdLine: 4700,
  ring: 9800,
  credits: 13600,
} as const;

export default function FinalReaderAddress({ onSilence, onRing, onEndingMusic, onRestart, creditsOnly = false }: Props) {
  const [lineCount, setLineCount] = useState(creditsOnly ? addressLines.length : 0);
  const [phase, setPhase] = useState<Phase>(creditsOnly ? "credits" : "address");
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
    <section className={`${styles.finale} ${phaseClass}`} aria-label={creditsOnly ? "版本说明与片尾字幕" : "特奥多罗向读者发问"}>
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
          <button className={styles.restart} onClick={onRestart}>返回故事的开始</button>
          <div className={styles.creditsRoll} aria-label="版本说明与制作人员">
            <p className={styles.creditsKicker}>《满大人》· 交互叙事</p>
            {ABOUT_COPY.map((paragraph) => <p className={styles.about} key={paragraph}>{paragraph}</p>)}
            <p className={styles.creator}>{CREATOR_COPY}</p>
            <div className={styles.divider} />
            <h3>分幕配乐</h3>
            <div className={styles.musicCredits}>
              {MUSIC_CREDITS.map((credit) => (
                <a key={credit.title} href={credit.href} target="_blank" rel="noreferrer">
                  《{credit.title}》 · {credit.creator} · {credit.license}
                </a>
              ))}
            </div>
            <p className={styles.endMark}>终</p>
          </div>
        </>
      )}
    </section>
  );
}
