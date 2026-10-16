"use client";
import { asset } from "./asset-path";


import { useEffect, useRef, useState, type CSSProperties } from "react";

type ReturnPhase = "arrival" | "map" | "complete";

type MapRoute = {
  label: string;
  pt: string;

  path: string;
  point: [number, number];
};

const mapRoutes: MapRoute[] = [
  {
    label: "Ni Ku-Hé",
    pt: "O meu hóspede sobe até Ni Ku-Hé, na margem do Pei-Hó...",
    path: "M142 506 C178 484 210 458 255 428",
    point: [255, 428],
  },
  {
    label: "My-Yun",
    pt: "Daí, em barcos chatos, vai a My-Yun. Boa cidade, há lá um Buda vivo...",
    path: "M255 428 C301 408 344 405 390 371",
    point: [390, 371],
  },
  {
    label: "Ché-Hia",
    pt: "Daí, a cavalo, segue até à fortaleza de Ché-Hia.",
    path: "M390 371 C430 345 478 331 523 295",
    point: [523, 295],
  },
  {
    label: "Grande Muralha",
    pt: "Passa a Grande Muralha, famoso espetáculo!...",
    path: "M523 295 C567 270 606 248 651 231",
    point: [651, 231],
  },
  {
    label: "Ku Pi-Hó",
    pt: "Descansa no forte de Ku Pi-Hó. Pode lá caçar a gazela. […]",
    path: "M651 231 C697 218 735 211 781 194",
    point: [781, 194],
  },
  {
    label: "Tien-Hó",
    pt: "E com dois dias de caminhada está em Tien-Hó... Brilhante, hem?... Quando quer partir? Amanhã?...",
    path: "M781 194 C823 173 858 145 895 116",
    point: [895, 116],
  },
];

// Each resting pose leaves the newly revealed place name above-left of the hand.
// Index 0 waits beside Beijing; indexes 1–6 dock beside the completed route point.
const handDockPositions = [
  [18, 66, -4],
  [30, 60, 2],
  [44, 52, -2],
  [56, 43, 3],
  [69, 34, -3],
  [82, 29, 2],
  [93, 18, -4],
] as const;

type MapStyle = CSSProperties & {
  "--hand-left": string;
  "--hand-top": string;
  "--hand-rotate": string;
};

function RouteMap({ step, compact = false }: { step: number; compact?: boolean }) {
  return (
    <svg className={`route-map-svg ${compact ? "compact" : ""}`} viewBox="0 0 1000 620" role="img" aria-label={`Percurso de Pequim a Tien-Hó: ${step} troços traçados`}>
      <g className="map-terrain" aria-hidden="true">
        <path d="M86 532 C195 470 174 389 283 360 C384 333 435 248 538 232 C672 210 715 126 925 82" />
        <path d="M155 558 C246 495 351 485 437 411 C536 326 651 354 742 276 C812 218 864 174 944 142" />
        <path d="M206 142 C297 112 365 157 446 127 C532 96 598 122 676 86" />
        <path className="river" d="M116 522 C211 470 173 398 267 350 C353 307 328 239 425 198" />
        <path className="wall" d="M584 264 L615 248 L642 260 L669 235 L695 247 L723 221" />
      </g>
      <g className="map-route-lines">
        {mapRoutes.map((route, index) => (
          <path key={route.label} className={index < step ? "is-drawn" : ""} d={route.path} pathLength="1" />
        ))}
      </g>
      <g className="map-place-labels">
        <circle cx="142" cy="506" r="7" />
        <text x="112" y="544">Pequim</text>
        {mapRoutes.map((route, index) => (
          <g key={route.label} className={index < step ? "is-visible" : ""}>
            <circle cx={route.point[0]} cy={route.point[1]} r="7" />
            <text x={route.point[0] + 12} y={route.point[1] - 12}>{route.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function ReturnQuote({ pt }: { pt: string }) {
  return (
    <blockquote className="source-inline bilingual-quote compact">
      <span lang="pt-PT">“{pt}”</span>
    </blockquote>
  );
}

export default function CamilloffReturnMap({ onContinue, onTone }: { onContinue: () => void; onTone: (frequency: number, duration: number, volume: number) => void }) {
  const [phase, setPhase] = useState<ReturnPhase>("arrival");
  const [gloveInspected, setGloveInspected] = useState(false);
  const [gloveFocus, setGloveFocus] = useState(false);
  const [mapStep, setMapStep] = useState(0);
  const [mapAnimating, setMapAnimating] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector<HTMLElement>(".game-shell")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [phase]);

  useEffect(() => {
    document.querySelector<HTMLElement>(".map-conversation")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [mapStep]);

  const inspectGlove = () => {
    setGloveInspected(true);
    setGloveFocus(true);
    onTone(196, 0.7, 0.05);
    timers.current.push(window.setTimeout(() => setGloveFocus(false), 2400));
  };

  const advanceMap = () => {
    if (phase !== "map" || mapAnimating || mapStep >= mapRoutes.length) return;
    setMapAnimating(true);
    setMapStep((step) => step + 1);
    onTone(246.94 + mapStep * 18, 0.46, 0.055);
    timers.current.push(window.setTimeout(() => setMapAnimating(false), 720));
  };

  const currentRoute = mapStep > 0 ? mapRoutes[mapStep - 1] : null;
  const handPosition = handDockPositions[mapStep];
  const mapStyle: MapStyle = {
    "--hand-left": `${handPosition[0]}%`,
    "--hand-top": `${handPosition[1]}%`,
    "--hand-rotate": `${handPosition[2]}deg`,
  };

  return (
    <>
      {phase !== "map" && (
        <button className={`return-glove-hotspot ${gloveInspected ? "is-seen" : ""}`} type="button" onClick={inspectGlove} aria-label="Olhar a luva sobre a mesa">
          <span aria-hidden="true" />
        </button>
      )}

      {gloveFocus && (
        <aside className="glove-memory" aria-live="polite">
          <div aria-hidden="true" />
          <p>O meu olhar deteve-se por um instante. Estendi a mão e voltei a recolhê-la.</p>
        </aside>
      )}

      {phase === "arrival" && (
        <div className="scene-body camilloff-return-arrival">
          <ReturnQuote pt="Uma manhã, Camilloff, entrando na Chancelaria, onde eu fumava o cachimbo da amizade de companhia com Meriskoff, atirou o seu enorme sabre para um canapé, e contou-nos radiante as notícias que lhe dera o penetrante príncipe Tong." />
          <p>Desde a minha chegada a Pequim, nunca mais vira Ti Chin-Fu morto. Ouvi rodas à porta: Camilloff regressava com documentos. A generala já saíra, mas deixara sobre a mesa um objeto seu.</p>
          <div className="dialogue-result">
            <div className="speaker">Camilloff</div>
            <ReturnQuote pt="Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó!" />
          </div>
          <p>As pistas levam a Tien-Hó, a norte de Pequim, para lá da Grande Muralha.</p>
          <p>O general Camilloff puxou o mapa para debaixo da luz e aguçou o lápis.</p>
          <button className="primary-action" type="button" onClick={() => setPhase("map")}>Ouvir Camilloff <span>→</span></button>
        </div>
      )}

      {phase === "map" && (
        <section className="map-workbench" aria-label="Camilloff traça o percurso de Pequim a Tien-Hó">
          <header className="map-workbench-heading">
            <span>O itinerário</span>
            <h2 className="section-title">Caminhos no papel</h2>
            <p>{mapStep < mapRoutes.length ? "Traçar o caminho" : "Os seis troços estão ligados."}</p>
          </header>
          <div
            className={`map-paper ${mapAnimating ? "is-jumping" : ""} shift-${mapStep % 3}`}
          >
            <RouteMap step={mapStep} />
            <button className={`map-hand-control pose-${mapStep % 3} ${mapAnimating ? "is-moving" : ""}`} type="button" style={mapStyle} onClick={advanceMap} aria-label="Seleciona a mão de Camilloff para traçar o próximo troço" disabled={mapStep >= mapRoutes.length}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/camilloff-map-hand-v1.webp")} alt="A mão de Camilloff segura um lápis" draggable={false} />
            </button>
          </div>
          <aside className="map-conversation" aria-live="polite">
            {currentRoute ? (
              <>
                <div className="speaker">Camilloff · {String(mapStep).padStart(2, "0")} / 06</div>
                <ReturnQuote pt={currentRoute.pt} />
              </>
            ) : (
              <p className="map-waiting-copy">O lápis paira sobre Pequim. O primeiro troço ainda está por traçar.</p>
            )}
            {mapStep >= mapRoutes.length && <button className="primary-action" type="button" onClick={() => setPhase("complete")}>Voltar a Camilloff <span>→</span></button>}
          </aside>
        </section>
      )}

      {phase === "complete" && (
        <div className="scene-body camilloff-return-complete">
          <div className="completed-route-overlay" aria-hidden="true"><RouteMap step={mapRoutes.length} compact /></div>
          <ReturnQuote pt="Mas já o zeloso Camilloff, de lápis na mão, ia marcando no mapa o meu itinerário para Tien-Hó!" />
          <div className="dialogue-result">
            <div className="speaker">Camilloff</div>
            <p>“Quando quer partir? Amanhã?”</p>
            <div className="speaker teodoro">Teodoro</div>
            <p>“Amanhã…” respondi, contrariado.</p>
          </div>
          <button className="primary-action" type="button" onClick={onContinue}>Partir com Sá-Tó <span>→</span></button>
        </div>
      )}
    </>
  );
}
