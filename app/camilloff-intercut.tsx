"use client";
import { asset } from "./asset-path";


import { useEffect, useRef, useState, type CSSProperties } from "react";

type Place = "mansion" | "yamen";

type SceneCopy = {
  image: string;
  place: string;
  speaker: string;
  pt: string;

  line: string;
};

type IntercutDay = {
  theme: string;
  mansion: SceneCopy;
  yamen: SceneCopy;
};

const intercutDays: IntercutDay[] = [
  {
    theme: "Burocracia e desejo",
    mansion: {
      image: asset("/camilloff-day1-mansion.webp"),
      place: "Residência",
      speaker: "A generala",
      pt: "O sonho de Vladimira era habitar Paris; e fazendo ferver delicadamente as folhas de chá, pedia-me histórias ladinas de cocottes […]",
      line: "A chávena regressou ao pires. Sem desviar os olhos, ela perguntou apenas se Paris era tão romântica como eu dizia.",
    },
    yamen: {
      image: asset("/camilloff-day1-yamen.webp"),
      place: "Yamen",
      speaker: "Escriba",
      pt: "teve de provar primeiro que o desejo de conhecer a morada de um velho mandarim não encobria uma conspiração contra a segurança do Império […]",
      line: "O selo caiu sobre o papel. O escriba recolheu o primeiro documento, mas exigiu outro que provasse que a investigação não ofendia os ritos.",
    },
  },
  {
    theme: "Burocracia e desejo",
    mansion: {
      image: asset("/camilloff-day2-mansion.webp"),
      place: "Residência",
      speaker: "",
      pt: "ao lado um arroio fresco ia cantando docemente […] e junto à janela rendilhada […] pousava aberto ao alto um leque formado de lâminas de cristal separadas, que a aragem entrando fazia vibrar, numa modulação melancólica e terna.",
      line: "Ela abriu o leque, como para esconder um sorriso encantador. O meu olhar passou por cima dele, e continuei a falar-lhe de Paris.",
    },
    yamen: {
      image: asset("/camilloff-day2-yamen.webp"),
      place: "Yamen",
      speaker: "",
      pt: "centenares de escribas empalideceram noite e dia, de pincel na mão, desenhando relatórios sobre papel de arroz […]",
      line: "Camilloff abriu o relatório que acabara de chegar. Do observatório aos arquivos, cada documento o remetia para outra repartição.",
    },
  },
  {
    theme: "Burocracia e desejo",
    mansion: {
      image: asset("/camilloff-day3-mansion.webp"),
      place: "Residência · Repouso Discreto",
      speaker: "A generala",
      pt: "Eu então, de leque na mão, pisando subtilmente na ponta das babouches de cetim as ruazinhas areadas do jardim, ia entreabrir a porta do Repouso Discreto: — Mimi? E a voz da generala respondia, suave como um beijo: — All right...",
      line: "A porta abriu-se por dentro. Ela estendeu a mão enluvada e conduziu-me ao Repouso Discreto, mais íntimo do que o salão.",
    },
    yamen: {
      image: asset("/camilloff-day3-yamen.webp"),
      place: "Yamen",
      speaker: "Porteiro",
      pt: "Quando Camilloff perguntava pelo resultado, vinha-lhe a resposta satisfatória que se estavam consultando os Livros Santos de Lao-Tsé […]",
      line: "Os senhores estão a consultar os livros antigos. O general não pode entrar.",
    },
  },
  {
    theme: "Burocracia e desejo",
    mansion: {
      image: asset("/camilloff-day4-mansion.webp"),
      place: "Residência",
      speaker: "Teodoro",
      pt: "Eu arregaçava-lhe a larga manga do casabeque de seda cor de folha morta, e ia fazendo viajar os meus lábios devotos pela pele fresca dos seus belos braços; […]",
      line: "Ao sair, esqueceu uma luva clara sobre a minha mesa. Hesitei um instante e não lha devolvi.",
    },
    yamen: {
      image: asset("/camilloff-day4-yamen.webp"),
      place: "Yamen",
      speaker: "Escriba",
      pt: "Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó!",
      line: "Depois de tantas formalidades, o relatório final reduzia-se a um nome: Tien-Hó.",
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
    <section className="intercut-stage" aria-label="Duas histórias, dentro e fora da residência">
      <div className={`intercut-card ${place === "yamen" ? "is-yamen" : "is-mansion"}`}>
        <div className="intercut-face mansion-face" style={{ backgroundImage: `url(${current.mansion.image})` }} aria-hidden="true" />
        <div className="intercut-face yamen-face" style={{ backgroundImage: `url(${current.yamen.image})` }} aria-hidden="true" />
      </div>
      <div className={`intercut-vignette ${place}`} aria-hidden="true" />

      <header className="intercut-heading">
        <span className="chapter-kicker">Ato V · Pequim</span>
        <h2 className="chapter-title">Dentro e fora</h2>
        <p>{current.theme}</p>
      </header>

      <article className="intercut-copy" key={`${day}-${place}`}>
        <div className="speaker">{copy.place}</div>
        <blockquote className="source-inline bilingual-quote compact">
          <span lang="pt-PT">“{copy.pt}”</span>
        </blockquote>
        <p>{copy.speaker && <strong>{copy.speaker}: </strong>}{copy.line}</p>
      </article>

      <div className="intercut-day-track" aria-label={`Progresso das duas histórias${day + 1} / ${intercutDays.length}`}>
        {intercutDays.map((_, index) => <i key={index} className={index <= day ? "is-past" : ""} />)}
      </div>

      <div className="intercut-controls">
        <div className="intercut-control-item">
          <button
            className="space-globe"
            type="button"
            onClick={flipSpace}
            aria-label={place === "mansion" ? "Seleciona o globo para ver o yamen" : "Seleciona o globo para ver a residência"}
          >
            <span className="globe-sphere" aria-hidden="true"><i /><b>‹</b><b>›</b></span>
          </button>
          {day === 0 && <span className="intercut-control-hint" aria-hidden="true"><small>Ver o globo</small>Entre a residência e o yamen</span>}
        </div>

        <div className="intercut-control-item">
          <button
            className={`time-watch ${seenBoth ? "is-ready" : "is-waiting"}`}
            type="button"
            style={watchStyle}
            onClick={() => { if (seenBoth) advanceDay(); }}
            aria-label={seenBoth ? (day === intercutDays.length - 1 ? "Seleciona o relógio para esperar por Camilloff" : "Seleciona o relógio para avançar no tempo") : "Vê primeiro o outro lugar no globo"}
            aria-disabled={!seenBoth}
          >
            <span className="watch-crown" aria-hidden="true" />
            <span className="watch-face" aria-hidden="true"><i /></span>
          </button>
          {day === 0 && <span className={`intercut-control-hint ${seenBoth ? "is-ready" : "is-waiting"}`} aria-hidden="true"><small>Ver o relógio</small>Avançar no tempo</span>}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{seenBoth ? "Já viste os dois lugares. Podes avançar no relógio." : "Seleciona o globo para ver o outro lugar."}</p>
      {nextDay && <div className="intercut-preload" aria-hidden="true"><span style={{ backgroundImage: `url(${nextDay.mansion.image})` }} /><span style={{ backgroundImage: `url(${nextDay.yamen.image})` }} /></div>}
    </section>
  );
}
