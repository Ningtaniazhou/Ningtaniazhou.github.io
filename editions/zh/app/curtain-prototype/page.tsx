import { asset } from "../asset-path";
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const SNAP_POINT = 0.7;

type SoundEngine = {
  context: AudioContext;
  streetGain: GainNode;
  crowdGain: GainNode;
  masterGain: GainNode;
  hoofTimer: ReturnType<typeof setInterval>;
  sources: AudioBufferSourceNode[];
  lfo: OscillatorNode;
};

type SceneStyle = CSSProperties & {
  "--curtain-width": string;
  "--hand-scale": string;
  "--hand-rotate": string;
  "--handle-left": string;
  "--outside-light": string;
  "--outside-scale": string;
  "--hush": string;
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function makeNoiseBuffer(context: AudioContext, seconds: number, warmth = 0.35) {
  const frameCount = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;

  for (let index = 0; index < frameCount; index += 1) {
    const white = Math.random() * 2 - 1;
    previous = previous * warmth + white * (1 - warmth);
    data[index] = previous * 0.7;
  }

  return buffer;
}

function createLoop(
  context: AudioContext,
  buffer: AudioBuffer,
  filterType: BiquadFilterType,
  frequency: number,
  destination: AudioNode,
) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  source.buffer = buffer;
  source.loop = true;
  filter.type = filterType;
  filter.frequency.value = frequency;
  filter.Q.value = 0.65;
  source.connect(filter).connect(destination);
  source.start();
  return source;
}

function playHoof(context: AudioContext, destination: AudioNode, strength: number) {
  if (strength < 0.04 || context.state !== "running") return;

  const now = context.currentTime;
  const buffer = makeNoiseBuffer(context, 0.12, 0.12);

  [0, 0.19].forEach((offset, index) => {
    const hit = context.createBufferSource();
    const band = context.createBiquadFilter();
    const thump = context.createOscillator();
    const hitGain = context.createGain();
    const thumpGain = context.createGain();
    const start = now + offset;
    const amount = strength * (index === 0 ? 0.23 : 0.16);

    hit.buffer = buffer;
    band.type = "bandpass";
    band.frequency.value = 860;
    band.Q.value = 1.8;
    hitGain.gain.setValueAtTime(amount, start);
    hitGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);
    hit.connect(band).connect(hitGain).connect(destination);

    thump.type = "sine";
    thump.frequency.setValueAtTime(105, start);
    thump.frequency.exponentialRampToValueAtTime(58, start + 0.12);
    thumpGain.gain.setValueAtTime(amount * 0.62, start);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
    thump.connect(thumpGain).connect(destination);

    hit.start(start);
    hit.stop(start + 0.13);
    thump.start(start);
    thump.stop(start + 0.15);
  });
}

export default function CurtainPrototypePage() {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const dragRef = useRef({ pointerId: -1, startX: 0, startProgress: 0 });
  const nativeDragCleanupRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<SoundEngine | null>(null);

  const setAudioLevel = useCallback((next: number, duration = 0) => {
    const engine = audioRef.current;
    if (!engine) return;

    const now = engine.context.currentTime;
    const shaped = Math.pow(next, 1.35);
    const street = 0.012 + shaped * 0.13;
    const crowd = shaped * 0.105;

    [engine.streetGain.gain, engine.crowdGain.gain].forEach((gain) => {
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
    });

    if (duration > 0) {
      engine.streetGain.gain.linearRampToValueAtTime(street, now + duration);
      engine.crowdGain.gain.linearRampToValueAtTime(crowd, now + duration);
    } else {
      engine.streetGain.gain.setValueAtTime(street, now);
      engine.crowdGain.gain.setValueAtTime(crowd, now);
    }
  }, []);

  const ensureAudio = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (audioRef.current) {
      if (audioRef.current.context.state === "suspended") {
        await audioRef.current.context.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const masterGain = context.createGain();
    const streetGain = context.createGain();
    const crowdGain = context.createGain();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    masterGain.gain.value = soundOn ? 0.82 : 0;
    streetGain.gain.value = 0.012;
    crowdGain.gain.value = 0;
    lfo.frequency.value = 0.095;
    lfoGain.gain.value = 0.018;

    streetGain.connect(masterGain);
    crowdGain.connect(masterGain);
    lfo.connect(lfoGain).connect(crowdGain.gain);
    masterGain.connect(context.destination);

    const streetSource = createLoop(
      context,
      makeNoiseBuffer(context, 3.4, 0.86),
      "lowpass",
      1180,
      streetGain,
    );
    const crowdSource = createLoop(
      context,
      makeNoiseBuffer(context, 4.7, 0.94),
      "bandpass",
      480,
      crowdGain,
    );

    lfo.start();
    const hoofTimer = setInterval(() => {
      const engine = audioRef.current;
      if (!engine) return;
      playHoof(engine.context, engine.masterGain, Math.pow(progressRef.current, 1.18));
    }, 760);

    audioRef.current = {
      context,
      streetGain,
      crowdGain,
      masterGain,
      hoofTimer,
      sources: [streetSource, crowdSource],
      lfo,
    };

    await context.resume();
  }, [soundOn]);

  const updateProgress = useCallback(
    (nextValue: number) => {
      const next = clamp(nextValue);
      progressRef.current = next;
      setProgress(next);
      setAudioLevel(next);
    },
    [setAudioLevel],
  );

  const settleTo = useCallback(
    (target: 0 | 1) => {
      progressRef.current = target;
      setIsDragging(false);
      setIsSettling(true);
      setProgress(target);
      setAudioLevel(target, target === 1 ? 0.82 : 1.05);
      window.setTimeout(() => setIsSettling(false), 1120);
    },
    [setAudioLevel],
  );

  const handlePointerDown = async (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startProgress: progressRef.current,
    };
    setIsSettling(false);
    setIsDragging(true);

    nativeDragCleanupRef.current?.();
    const dragRange = Math.max(180, (stageRef.current?.clientWidth ?? 1000) * 0.36);
    const handleNativeMove = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== dragRef.current.pointerId) return;
      pointerEvent.preventDefault();
      const travelled = dragRef.current.startX - pointerEvent.clientX;
      updateProgress(dragRef.current.startProgress + travelled / dragRange);
    };
    const cleanupNativeDrag = () => {
      window.removeEventListener("pointermove", handleNativeMove);
      window.removeEventListener("pointerup", handleNativeEnd);
      window.removeEventListener("pointercancel", handleNativeEnd);
      nativeDragCleanupRef.current = null;
    };
    const handleNativeEnd = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== dragRef.current.pointerId) return;
      dragRef.current.pointerId = -1;
      cleanupNativeDrag();
      settleTo(progressRef.current >= SNAP_POINT ? 1 : 0);
    };
    nativeDragCleanupRef.current = cleanupNativeDrag;
    window.addEventListener("pointermove", handleNativeMove, { passive: false });
    window.addEventListener("pointerup", handleNativeEnd);
    window.addEventListener("pointercancel", handleNativeEnd);

    await ensureAudio();
    setAudioLevel(progressRef.current);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      await ensureAudio();
    }
    if (event.key === "ArrowLeft") updateProgress(progressRef.current + 0.05);
    if (event.key === "ArrowRight") updateProgress(progressRef.current - 0.05);
    if (event.key === "Home") settleTo(0);
    if (event.key === "End") settleTo(1);
  };

  const toggleSound = async () => {
    await ensureAudio();
    const engine = audioRef.current;
    if (!engine) return;
    const next = !soundOn;
    setSoundOn(next);
    const now = engine.context.currentTime;
    engine.masterGain.gain.cancelScheduledValues(now);
    engine.masterGain.gain.setValueAtTime(engine.masterGain.gain.value, now);
    engine.masterGain.gain.linearRampToValueAtTime(next ? 0.82 : 0, now + 0.3);
  };

  useEffect(() => {
    return () => {
      nativeDragCleanupRef.current?.();
      const engine = audioRef.current;
      if (!engine) return;
      clearInterval(engine.hoofTimer);
      engine.sources.forEach((source) => {
        try {
          source.stop();
        } catch {
          // The source may already have stopped during a development remount.
        }
      });
      try {
        engine.lfo.stop();
      } catch {
        // The oscillator may already have stopped during a development remount.
      }
      if (engine.context.state !== "closed") {
        void engine.context.close().catch(() => undefined);
      }
    };
  }, []);

  const sceneStyle: SceneStyle = {
    "--curtain-width": `${100 - progress * 84}%`,
    "--hand-scale": `${1 - progress * 0.04}`,
    "--hand-rotate": `${-2 - progress * 3}deg`,
    "--handle-left": `${51.1 - progress * 39.4}%`,
    "--outside-light": `${0.42 + progress * 0.55}`,
    "--outside-scale": `${1.1 - progress * 0.06}`,
    "--hush": `${0.76 - progress * 0.66}`,
  };

  const percent = Math.round(progress * 100);

  return (
    <main className={styles.page}>
      <div
        ref={stageRef}
        className={`${styles.stage} ${isDragging ? styles.dragging : ""} ${
          isSettling ? styles.settling : ""
        } ${progress === 1 ? styles.open : ""}`}
        style={sceneStyle}
      >
        <img
          className={styles.interior}
          src={asset("/curtain-prototype-interior-v1.webp")}
          alt="特奥多罗坐在织金轿厢中"
          draggable={false}
        />

        <div className={styles.window} aria-hidden="true">
          <img
            className={styles.exterior}
            src={asset("/pequim-arrival-v1.webp")}
            alt=""
            draggable={false}
          />
          <div className={styles.windowHush} />
          <img
            className={styles.curtain}
            src={asset("/curtain-prototype-panel-v1.webp")}
            alt=""
            draggable={false}
          />
          <div className={styles.windowGrain} />
        </div>

        <img
          className={styles.dragHand}
          src={asset("/curtain-prototype-hand-v1.webp")}
          alt=""
          draggable={false}
          aria-hidden="true"
        />

        <div
          className={styles.handHandle}
          role="slider"
          tabIndex={0}
          aria-label="拖动手拉开轿帘"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`轿帘已打开 ${percent}%`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.handPulse} />
        </div>

        <header className={styles.header}>
          <a className={styles.backLink} href={asset("/")}>
            《满大人》
          </a>
          <div className={styles.headerActions}>
            <button className={styles.soundButton} type="button" onClick={toggleSound}>
              {soundOn ? "声音：开" : "声音：关"}
            </button>
          </div>
        </header>

        <section className={styles.intro} aria-live="polite">
          <p className={styles.chapter}>第五幕 · 北京</p>
          <h1>轿中北京</h1>
          <p className={styles.instruction}>
            {progress === 1
              ? "宫墙、车轮与人群的声浪涌入轿中。"
              : "按住手，向左拖动轿帘。"}
          </p>
          <div className={styles.progressRail} aria-hidden="true">
            <span className={styles.progressFill} style={{ width: `${percent}%` }} />
            <span className={styles.snapMark} />
          </div>
        </section>

        <aside className={styles.soundMeter} aria-hidden="true">
          <span>轿帘</span>
          <strong>{String(percent).padStart(2, "0")}%</strong>
          <div className={styles.soundLines}>
            <i style={{ transform: `scaleX(${0.08 + progress * 0.92})` }} />
            <i style={{ transform: `scaleX(${Math.pow(progress, 1.15)})` }} />
            <i style={{ transform: `scaleX(${Math.pow(progress, 1.35)})` }} />
          </div>
          <small>街声 · 马蹄 · 人群</small>
        </aside>

        {progress === 1 ? (
          <button className={styles.closeButton} type="button" onClick={() => settleTo(0)}>
            合上轿帘
          </button>
        ) : null}

        <div className={styles.filmGrain} aria-hidden="true" />
      </div>
    </main>
  );
}
