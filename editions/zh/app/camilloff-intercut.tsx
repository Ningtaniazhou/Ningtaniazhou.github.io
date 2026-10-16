"use client";
import { asset } from "./asset-path";


import { useEffect, useRef, useState, type CSSProperties } from "react";

type Place = "mansion" | "yamen";

type SceneCopy = {
  image: string;
  place: string;
  speaker: string;
  pt: string;
  zh: string;
  line: string;
};

type IntercutDay = {
  theme: string;
  mansion: SceneCopy;
  yamen: SceneCopy;
};

const intercutDays: IntercutDay[] = [
  {
    theme: "繁文缛节/情愫暗生",
    mansion: {
      image: asset("/camilloff-day1-mansion.webp"),
      place: "府邸",
      speaker: "将军夫人",
      pt: "O sonho de Vladimira era habitar Paris; e fazendo ferver delicadamente as folhas de chá, pedia-me histórias ladinas de cocottes...",
      zh: "弗拉基米拉梦想住在巴黎；她动作轻柔地煮沸茶水，请我讲讲聪慧的风流女子的故事……",
      line: "茶杯被放到托碟上。她没有移开目光，只问巴黎是否真像我说的那样浪漫。",
    },
    yamen: {
      image: asset("/camilloff-day1-yamen.webp"),
      place: "衙门",
      speaker: "书吏",
      pt: "Teve de provar primeiro que o desejo de conhecer a morada de um velho mandarim não encobria uma conspiração contra a segurança do Império...",
      zh: "您要查问一位老官员的住处，必须先证明这并非危害国家安全的阴谋……",
      line: "印章落下。书吏收走第一份文书，却说还需另一份文书证明这番查问无意冒犯礼制。",
    },
  },
  {
    theme: "繁文缛节/情愫暗生",
    mansion: {
      image: asset("/camilloff-day2-mansion.webp"),
      place: "府邸",
      speaker: "",
      pt: "Ao lado um arroio fresco ia cantando docemente […] e junto à janela rendilhada […] pousava aberto ao alto um leque formado de lâminas de cristal separadas, que a aragem entrando fazia vibrar, numa modulação melancólica e terna.",
      zh: "一旁，清凉的溪流声如同甜美的歌唱（……）雕花窗边（……）一柄水晶扇片的扇子高举着，展开，微风吹入，扇片便发出温柔而忧郁的颤音。",
      line: "她展开扇子，像是在遮住迷人的笑容。我的目光越过扇沿，继续和她讲巴黎。",
    },
    yamen: {
      image: asset("/camilloff-day2-yamen.webp"),
      place: "衙门",
      speaker: "",
      pt: "Centenares de escribas empalideceram noite e dia, de pincel na mão, desenhando relatórios sobre papel de arroz...",
      zh: "数百名面色苍白的书吏披星戴月，在宣纸上写下一份又一份报告……",
      line: "卡米洛夫展开刚送来的报告，从天文台到档案院，每一份报告都将他推向下一间衙署。",
    },
  },
  {
    theme: "繁文缛节/情愫暗生",
    mansion: {
      image: asset("/camilloff-day3-mansion.webp"),
      place: "府邸 · 静憩亭门前",
      speaker: "将军夫人",
      pt: "Eu então, de leque na mão, pisando subtilmente na ponta das babouches de cetim as ruazinhas areadas do jardim, ia entreabrir a porta do Repouso Discreto: — Mimi? E a voz da generala respondia, suave como um beijo: — All right...",
      zh: "于是我拿着折扇，穿着缎鞋，轻轻走过花园的沙径，推开静憩亭的门：‘咪咪？’将军夫人的声音温柔得像一个吻：‘进来吧……’",
      line: "门从里面打开。她伸出戴着手套的手，把我引进比客厅更私密的静憩亭。",
    },
    yamen: {
      image: asset("/camilloff-day3-yamen.webp"),
      place: "衙门",
      speaker: "门吏",
      pt: "Quando Camilloff perguntava pelo resultado, vinha-lhe a resposta satisfatória que se estavam consultando os Livros Santos de Lao-Tsé...",
      zh: "卡米洛夫询问结果时，得到的答复总是：大人们正在查阅老子的圣书……",
      line: "大人们正在查阅古籍，将军不能进去。",
    },
  },
  {
    theme: "繁文缛节/情愫暗生",
    mansion: {
      image: asset("/camilloff-day4-mansion.webp"),
      place: "府邸",
      speaker: "特奥多罗",
      pt: "Eu arregaçava-lhe a larga manga do casabeque de seda cor de folha morta, e ia fazendo viajar os meus lábios devotos pela pele fresca dos seus belos braços; […]",
      zh: "我卷起她枯叶色绸褂的宽袖，让虔诚的吻沿着她美丽手臂上微凉的肌肤缓缓游移……",
      line: "她离开时把一只浅色的手套忘在了我的桌上，我犹豫了一下，没有把它送回去。",
    },
    yamen: {
      image: asset("/camilloff-day4-yamen.webp"),
      place: "衙门",
      speaker: "书吏",
      pt: "Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó!",
      zh: "终于查明，一位名叫狄鑫福的富有官员，曾住在蒙古边境的天河村！",
      line: "在漫长的手续后，最终报告被压缩成一个地名：天河村。",
    },
  },
];

type WatchStyle = CSSProperties & { "--watch-progress": string; "--watch-day": string };

export default function CamilloffIntercut({ onComplete, onTone }: { onComplete: () => void; onTone: (frequency: number, duration: number, volume: number) => void }) {
  const [day, setDay] = useState(0);
  const [place, setPlace] = useState<Place>("mansion");
  const [seen, setSeen] = useState<string[]>(["0-mansion"]);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    document.querySelector<HTMLElement>(".intercut-copy")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [day, place]);

  const current = intercutDays[day];
  const copy = current[place];
  const seenBoth = seen.includes(`${day}-mansion`) && seen.includes(`${day}-yamen`);

  const showPlace = (next: Place) => {
    if (next === place) return;
    setPlace(next);
    setSeen((items) => items.includes(`${day}-${next}`) ? items : [...items, `${day}-${next}`]);
    onTone(next === "yamen" ? 174.61 : 220, 0.42, 0.055);
  };

  const flipSpace = () => showPlace(place === "mansion" ? "yamen" : "mansion");

  const advanceDay = () => {
    if (!seenBoth) return;
    onTone(day === intercutDays.length - 1 ? 261.63 : 207.65, 0.72, 0.065);
    if (day === intercutDays.length - 1) {
      timers.current.push(window.setTimeout(onComplete, 260));
      return;
    }
    const nextDay = day + 1;
    setDay(nextDay);
    setPlace("mansion");
    setSeen((items) => items.includes(`${nextDay}-mansion`) ? items : [...items, `${nextDay}-mansion`]);
  };

  const watchStyle: WatchStyle = {
    "--watch-progress": "0deg",
    "--watch-day": `${day * 82}deg`,
  };

  const nextDay = intercutDays[day + 1];

  return (
    <section className="intercut-stage" aria-label="府邸内外双线">
      <div className={`intercut-card ${place === "yamen" ? "is-yamen" : "is-mansion"}`}>
        <div className="intercut-face mansion-face" style={{ backgroundImage: `url(${current.mansion.image})` }} aria-hidden="true" />
        <div className="intercut-face yamen-face" style={{ backgroundImage: `url(${current.yamen.image})` }} aria-hidden="true" />
      </div>
      <div className={`intercut-vignette ${place}`} aria-hidden="true" />

      <header className="intercut-heading">
        <span className="chapter-kicker">第五幕 · 北京</span>
        <h2 className="chapter-title">府邸内外</h2>
        <p>{current.theme}</p>
      </header>

      <article className="intercut-copy" key={`${day}-${place}`}>
        <div className="speaker">{copy.place}</div>
        <blockquote className="source-inline bilingual-quote compact">
          <span lang="pt">“{copy.pt}”</span>
          <span className="quote-translation">“{copy.zh}”</span>
        </blockquote>
        <p>{copy.speaker && <strong>{copy.speaker}：</strong>}{copy.line}</p>
      </article>

      <div className="intercut-day-track" aria-label={`双线进度 ${day + 1} / ${intercutDays.length}`}>
        {intercutDays.map((_, index) => <i key={index} className={index <= day ? "is-past" : ""} />)}
      </div>

      <div className="intercut-controls">
        <div className="intercut-control-item">
          <button
            className="space-globe"
            type="button"
            onClick={flipSpace}
            aria-label={place === "mansion" ? "点击地球仪，切换到衙门" : "点击地球仪，切换到府邸"}
          >
            <span className="globe-sphere" aria-hidden="true"><i /><b>‹</b><b>›</b></span>
          </button>
          {day === 0 && <span className="intercut-control-hint" aria-hidden="true"><small>点击地球仪</small>穿梭于府邸内外</span>}
        </div>

        <div className="intercut-control-item">
          <button
            className={`time-watch ${seenBoth ? "is-ready" : "is-waiting"}`}
            type="button"
            style={watchStyle}
            onClick={() => { if (seenBoth) advanceDay(); }}
            aria-label={seenBoth ? (day === intercutDays.length - 1 ? "点击怀表，等待卡米洛夫归来" : "点击怀表，让时间推移") : "先点击地球仪查看另一处"}
            aria-disabled={!seenBoth}
          >
            <span className="watch-crown" aria-hidden="true" />
            <span className="watch-face" aria-hidden="true"><i /></span>
          </button>
          {day === 0 && <span className={`intercut-control-hint ${seenBoth ? "is-ready" : "is-waiting"}`} aria-hidden="true"><small>点击怀表</small>让时间推移</span>}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{seenBoth ? "这一段的宅邸与衙门都已查看，可以点击怀表。" : "点击地球仪，查看另一处。"}</p>
      {nextDay && <div className="intercut-preload" aria-hidden="true"><span style={{ backgroundImage: `url(${nextDay.mansion.image})` }} /><span style={{ backgroundImage: `url(${nextDay.yamen.image})` }} /></div>}
    </section>
  );
}
