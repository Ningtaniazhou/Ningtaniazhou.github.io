"use client";
import { asset } from "./asset-path";


import { useEffect, useRef, useState, type CSSProperties } from "react";

type ReturnPhase = "arrival" | "map" | "complete";

type MapRoute = {
  label: string;
  pt: string;
  zh: string;
  path: string;
  point: [number, number];
};

const mapRoutes: MapRoute[] = [
  {
    label: "尼古河",
    pt: "O meu hóspede sobe até Ni Ku-Hé, na margem do Pei-Hó...",
    zh: "我的客人，您要先北上，抵达白河岸边的尼古河……",
    path: "M142 506 C178 484 210 458 255 428",
    point: [255, 428],
  },
  {
    label: "密云",
    pt: "Daí, em barcos chatos, vai a My-Yun. Boa cidade, há lá um Buda vivo...",
    zh: "然后乘平底船去密云。密云是好地方，城里还有一尊活佛……",
    path: "M255 428 C301 408 344 405 390 371",
    point: [390, 371],
  },
  {
    label: "切希亚堡",
    pt: "Daí, a cavalo, segue até à fortaleza de Ché-Hia.",
    zh: "然后骑马前往切希亚堡。",
    path: "M390 371 C430 345 478 331 523 295",
    point: [523, 295],
  },
  {
    label: "长城",
    pt: "Passa a Grande Muralha, famoso espetáculo!...",
    zh: "越过长城，那可是著名的奇观！……",
    path: "M523 295 C567 270 606 248 651 231",
    point: [651, 231],
  },
  {
    label: "古北口",
    pt: "Descansa no forte de Ku Pi-Hó. Pode lá caçar a gazela. […]",
    zh: "然后在古北口堡垒歇息修整。您还可以在那儿打猎瞪羚（……）",
    path: "M651 231 C697 218 735 211 781 194",
    point: [781, 194],
  },
  {
    label: "天河",
    pt: "E com dois dias de caminhada está em Tien-Hó... Brilhante, hem?... Quando quer partir? Amanhã?...",
    zh: "然后再走两天就到天河村了……怎么样，不错吧？……您想什么时候动身？明天？",
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
    <svg className={`route-map-svg ${compact ? "compact" : ""}`} viewBox="0 0 1000 620" role="img" aria-label={`北京到天河的路线，已绘制 ${step} 段`}>
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
        <text x="112" y="544">北京</text>
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

function ReturnQuote({ pt, zh }: { pt: string; zh: string }) {
  return (
    <blockquote className="source-inline bilingual-quote compact">
      <span lang="pt">“{pt}”</span>
      <span className="quote-translation">“{zh}”</span>
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
        <button className={`return-glove-hotspot ${gloveInspected ? "is-seen" : ""}`} type="button" onClick={inspectGlove} aria-label="看向桌角的女士手套">
          <span aria-hidden="true" />
        </button>
      )}

      {gloveFocus && (
        <aside className="glove-memory" aria-live="polite">
          <div aria-hidden="true" />
          <p>我的视线停了一瞬，手刚伸过去，又缩了回来。</p>
        </aside>
      )}

      {phase === "arrival" && (
        <div className="scene-body camilloff-return-arrival">
          <ReturnQuote pt="Uma manhã, Camilloff, entrando na Chancelaria, onde eu fumava o cachimbo da amizade de companhia com Meriskoff, atirou o seu enorme sabre para um canapé, e contou-nos radiante as notícias que lhe dera o penetrante príncipe Tong." zh="一天早晨，我正和梅里斯科夫抽着烟斗作伴，卡米洛夫走进了秘书处。他把硕大的军刀扔到长榻上，兴高采烈地告诉我们佟亲王带来的消息。" />
          <p>自从来到北京，我再也没有看到过死去的狄鑫福。此时，门外传来车轮声，是卡米洛夫带着公文回来了；将军夫人已经离开，但桌上却还留着一件属于她的东西。</p>
          <div className="dialogue-result">
            <div className="speaker">卡米洛夫</div>
            <ReturnQuote pt="Descobrira-se enfim que um opulento mandarim, de nome Ti Chin-Fu, vivera outrora nos confins da Mongólia, na vila de Tien-Hó!" zh="终于查明，一位名叫狄鑫福的富有官员，曾住在蒙古边境的天河村！" />
          </div>
          <p>线索指向北京以北、越过长城后的天河村。</p>
          <p>卡米洛夫将军把地图推到灯下，削尖了铅笔。</p>
          <button className="primary-action" type="button" onClick={() => setPhase("map")}>看向卡米洛夫 <span>→</span></button>
        </div>
      )}

      {phase === "map" && (
        <section className="map-workbench" aria-label="卡米洛夫绘制北京到天河的路线">
          <header className="map-workbench-heading">
            <span>寻访路线</span>
            <h2 className="section-title">纸上的道路</h2>
            <p>{mapStep < mapRoutes.length ? "点击持笔的手" : "六段道路已经连在一起。"}</p>
          </header>
          <div
            className={`map-paper ${mapAnimating ? "is-jumping" : ""} shift-${mapStep % 3}`}
          >
            <RouteMap step={mapStep} />
            <button className={`map-hand-control pose-${mapStep % 3} ${mapAnimating ? "is-moving" : ""}`} type="button" style={mapStyle} onClick={advanceMap} aria-label="点击卡米洛夫持笔的手，绘制下一段路线" disabled={mapStep >= mapRoutes.length}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/camilloff-map-hand-v1.webp")} alt="卡米洛夫握着铅笔的手" draggable={false} />
            </button>
          </div>
          <aside className="map-conversation" aria-live="polite">
            {currentRoute ? (
              <>
                <div className="speaker">卡米洛夫 · {String(mapStep).padStart(2, "0")} / 06</div>
                <ReturnQuote pt={currentRoute.pt} zh={currentRoute.zh} />
              </>
            ) : (
              <p className="map-waiting-copy">铅笔悬在北京上方。第一段路还没有出现。</p>
            )}
            {mapStep >= mapRoutes.length && <button className="primary-action" type="button" onClick={() => setPhase("complete")}>抬头看向卡米洛夫 <span>→</span></button>}
          </aside>
        </section>
      )}

      {phase === "complete" && (
        <div className="scene-body camilloff-return-complete">
          <div className="completed-route-overlay" aria-hidden="true"><RouteMap step={mapRoutes.length} compact /></div>
          <ReturnQuote pt="Mas já o zeloso Camilloff, de lápis na mão, ia marcando no mapa o meu itinerário para Tien-Hó!" zh="然而，热心的卡米洛夫已经拿起铅笔，在地图上一点点标出我前往天河村的路线！" />
          <div className="dialogue-result">
            <div className="speaker">卡米洛夫</div>
            <p>“什么时候动身？明天？”</p>
            <div className="speaker teodoro">特奥多罗</div>
            <p>“明天……”我闷闷不乐地回答。</p>
          </div>
          <button className="primary-action" type="button" onClick={onContinue}>与萨托一同前往天河村 <span>→</span></button>
        </div>
      )}
    </>
  );
}
