"use client";
import { asset } from "./asset-path";
import LanguageSwitch from "./language-switch";


import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent } from "react";
import BeijingCurtainScene from "./beijing-curtain-scene";
import CamilloffIntercut from "./camilloff-intercut";
import CamilloffReturnMap from "./camilloff-return-map";
import FinalReaderAddress from "./final-reader-address";
import SupplicationSequence from "./supplication-sequence";
import TienhoSequence from "./tienho-sequence";
import { ABOUT_COPY, CREATOR_COPY, MUSIC_CREDITS } from "./version-copy";

type Stage =
  | "intro"
  | "office"
  | "market"
  | "room"
  | "book"
  | "bell"
  | "tiDeath"
  | "refusalEnding"
  | "inheritance"
  | "luxury"
  | "ghost"
  | "map"
  | "beijing"
  | "repose"
  | "camilloffDeparture"
  | "camilloffIntercut"
  | "camilloffReturn"
  | "tienho"
  | "mission"
  | "letter"
  | "return"
  | "reckoning"
  | "renounce"
  | "prison"
  | "devilReturn"
  | "supplication"
  | "testament";

type HotspotItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  translation: string;
};

type BeijingDestination = "" | "tartar" | "chinese";

const beijingDestinations: Record<Exclude<BeijingDestination, "">, { title: string; original: string; summary: string }> = {
  tartar: { title: "Cidade Tártara", original: "", summary: "Muralhas, poder e telhados dourados" },
  chinese: { title: "Cidade Chinesa", original: "", summary: "Lama, poeira e multidões" },
};

const beijingDestinationKeys = ["tartar", "chinese"] as const;

const routes = [
  ["Lisboa", "Uma noite, parti para Marselha, decidido a ir a Pequim procurar a família de Ti Chin-Fu."],
  ["Marselha", "Fretei todo o paquete Ceilão e larguei de Marselha rumo ao Oriente."],
  ["Xangai", "O Ceilão chegou a Xangai após uma travessia tranquila. Mas não tinha vontade de passear: só pensava no motivo da viagem."],
  ["Tien-Tsin", "De Xangai, segui até Tien-Tsin num pequeno vapor da companhia Russell."],
  ["Tung-Chow", "Em Tien-Tsin, tomei um barco chato. Atravessei os arrozais das margens do Pei-Hó até Tung-Chow, onde me esperava Sá-Tó, o intérprete enviado por Camilloff."],
  ["Pequim", "Montei o pónei da Manchúria que Camilloff me enviara e, escoltado pelo cossaco Sá-Tó, atravessei a planície poeirenta a caminho de Pequim."],
];

const routeTransports = [
  { id: "train", label: "Comboio", route: "Lisboa → Marselha" },
  { id: "mail-steamer", label: "Paquete Ceilão", route: "Marselha → Xangai" },
  { id: "river-steamer", label: "Vapor da companhia Russell", route: "Xangai → Tien-Tsin" },
  { id: "flatboat", label: "Barco chato", route: "Tien-Tsin → Tung-Chow" },
  { id: "pony", label: "Pónei da Manchúria", route: "Tung-Chow → Pequim" },
] as const;

const returnPlaces = ["Singapura", "Ceilão", "Suez", "Malta", "Gibraltar", "Lisboa"] as const;

const letterReasons = [
  { id: "distance", text: "Já atravessei meio mundo.", mark: "Uma viagem tão longa devia bastar como prova de boa vontade." },
  { id: "tienho", text: "Quase morri em Tien-Hó.", mark: "Uma mancha de sangue seco ficou ao lado desta linha." },
  { id: "addresses", text: "Nenhuma das duas moradas está confirmada.", mark: "Estaremos cada vez mais longe da verdade?" },
  { id: "absence", text: "Ti Chin-Fu não aparece há muito tempo.", mark: "O silêncio do morto parece também uma resposta." },
  { id: "donation", text: "Já deixei uma doação suficiente.", mark: "O dinheiro é a melhor prova de boa vontade." },
  { id: "uncertainty", text: "Mesmo continuando, talvez nunca encontre a verdadeira família de Ti Chin-Fu.", mark: "Basta de esforços inúteis." },
] as const;

type LetterReasonId = (typeof letterReasons)[number]["id"];

const stageInfo: Record<Stage, { act: string; title: string; subtitle: string }> = {
  intro: { act: "", title: "O Mandarim", subtitle: "Um leve tilintar" },
  office: { act: "Ato I · Lisboa", title: "Os dias do amanuense", subtitle: "Ministério do Reino" },
  market: { act: "Ato I · Lisboa", title: "À procura de tesouros", subtitle: "Feira da Ladra" },
  room: { act: "Ato I · Lisboa", title: "As noites do amanuense", subtitle: "O quarto de Teodoro" },
  book: { act: "Ato I · O velho livro", title: "Palavras luminosas", subtitle: "" },
  bell: { act: "Ato I · Tentação", title: "A proposta do Diabo", subtitle: "A campainha sobre a mesa" },
  tiDeath: { act: "Ato I · Ao longe", title: "A morte de Ti Chin-Fu", subtitle: "A longínqua China" },
  refusalEnding: { act: "Final alternativo", title: "Uma recusa firme", subtitle: "" },
  inheritance: { act: "Ato II · Fortuna", title: "A herança de um desconhecido", subtitle: "" },
  luxury: { act: "Ato III · Ouro", title: "Milionário", subtitle: "O palacete do Loreto" },
  ghost: { act: "Ato III · O morto", title: "O convidado do banquete", subtitle: "Ti Chin-Fu" },
  map: { act: "Ato IV · Viagem", title: "Rumo ao Oriente", subtitle: "De Lisboa a Pequim" },
  beijing: { act: "Ato V · Pequim", title: "Diante das portas", subtitle: "À porta de Tung Tsen-Men" },
  repose: { act: "Ato V · Pequim", title: "Pequim de liteira", subtitle: "Palácios e ruas do povo" },
  camilloffDeparture: { act: "Ato V · Pequim", title: "Antes da partida", subtitle: "À porta de Camilloff" },
  camilloffIntercut: { act: "Ato V · Pequim", title: "Dentro e fora", subtitle: "Entre dois lugares" },
  camilloffReturn: { act: "Ato V · Pequim", title: "À conversa com Camilloff", subtitle: "Caminhos no papel" },
  tienho: { act: "Ato VI · Extremo Oriente", title: "Tien-Hó", subtitle: "A multidão à porta da estalagem" },
  mission: { act: "Ato VII · O convento", title: "Manhã no convento", subtitle: "O sino de matinas" },
  letter: { act: "Ato VII · O convento", title: "A carta de Camilloff", subtitle: "O pequeno quarto de Teodoro" },
  return: { act: "Ato VII · Regresso", title: "Em companhia do morto", subtitle: "Da China à Europa" },
  reckoning: { act: "Ato VIII · Lisboa", title: "Um morto sem descanso", subtitle: "O palacete do Loreto" },
  renounce: { act: "Ato VIII · Lisboa", title: "De novo pobre", subtitle: "O quarto de Teodoro" },
  prison: { act: "Ato VIII · Lisboa", title: "Lisonja e adulação", subtitle: "O palacete do Loreto" },
  devilReturn: { act: "Ato VIII · A rua à noite", title: "O reencontro com o Diabo", subtitle: "Numa rua deserta" },
  supplication: { act: "Ato VIII · A rua à noite", title: "A súplica", subtitle: "" },
  testament: { act: "Desfecho", title: "À beira da morte", subtitle: "O palacete do Loreto" },
};

const corpsePresenceStages: Stage[] = ["ghost", "map", "return", "reckoning", "renounce", "prison", "devilReturn", "supplication", "testament"];

const musicCues = {
  mystery: { src: asset("/audio/unsolved-investigation-v1.ogg"), volume: 0.74 },
  ballroom: { src: asset("/audio/apparitions-ball.mp3"), volume: 0.2 },
  haunting: { src: asset("/audio/i-swear-i-saw-it.ogg"), volume: 0.23 },
  journey: { src: asset("/audio/the-journey-begins.ogg"), volume: 0.22 },
  pursuit: { src: asset("/audio/pursuit.mp3"), volume: 0.2 },
  reflection: { src: asset("/audio/unsolved-investigation-v1.ogg"), volume: 0.74 },
  oriental: { src: asset("/audio/asianoriental1.ogg"), volume: 0.3 },
  mansionIntercut: { src: asset("/audio/apparitions-ball.mp3"), volume: 0.16 },
  mapMeeting: { src: asset("/audio/unsolved-investigation-v1.ogg"), volume: 0.62 },
} as const;

const stageMusic: Record<Stage, { src: string; volume: number }> = {
  intro: musicCues.mystery,
  office: musicCues.mystery,
  market: musicCues.mystery,
  room: musicCues.mystery,
  book: musicCues.mystery,
  bell: musicCues.mystery,
  tiDeath: musicCues.haunting,
  refusalEnding: musicCues.mystery,
  inheritance: musicCues.ballroom,
  luxury: musicCues.ballroom,
  ghost: musicCues.haunting,
  map: musicCues.journey,
  beijing: musicCues.journey,
  repose: musicCues.oriental,
  camilloffDeparture: musicCues.oriental,
  camilloffIntercut: musicCues.mansionIntercut,
  camilloffReturn: musicCues.mapMeeting,
  tienho: musicCues.pursuit,
  mission: musicCues.reflection,
  letter: musicCues.reflection,
  return: musicCues.haunting,
  reckoning: musicCues.haunting,
  renounce: musicCues.haunting,
  prison: musicCues.haunting,
  devilReturn: musicCues.haunting,
  supplication: musicCues.haunting,
  testament: musicCues.mystery,
};

const stageOrder: Stage[] = ["intro", "office", "market", "room", "book", "bell", "tiDeath", "inheritance", "luxury", "ghost", "map", "beijing", "repose", "camilloffDeparture", "camilloffIntercut", "camilloffReturn", "tienho", "mission", "letter", "return", "reckoning", "renounce", "prison", "devilReturn", "supplication", "testament"];

const stageBackgrounds: Record<Stage, string> = {
  intro: asset("/intro-cover-v1.webp"), office: asset("/ministry-office-awake-v1.webp"), market: asset("/feira-da-ladra-v1.webp"),
  room: asset("/lisbon-room-v3.webp"), book: asset("/lisbon-room-v3.webp"), bell: asset("/lisbon-room-v3.webp"),
  tiDeath: asset("/ti-chin-fu-death-garden-v1.webp"), refusalEnding: asset("/lisbon-room-v3.webp"), inheritance: asset("/inheritance-messenger-v1.webp"),
  luxury: asset("/palace-ghost.webp"), ghost: asset("/palace-ghost.webp"), map: asset("/east-journey.webp"), beijing: asset("/pequim-arrival-v1.webp"),
  repose: asset("/pequim-litter-interior-v1.webp"), camilloffDeparture: asset("/camilloff-departure-v1.webp"), camilloffIntercut: asset("/camilloff-day1-mansion.webp"),
  camilloffReturn: asset("/camilloff-return-map-v1.webp"), tienho: asset("/tienho-reality-v1.webp"), mission: asset("/mission-cloister-v7.webp"),
  letter: asset("/mission-room-v1.webp"), return: asset("/lisbon-room-v3.webp"), reckoning: asset("/palace-ghost.webp"), renounce: asset("/renounce-room-v1.webp"),
  prison: asset("/loreto-restored-v1.webp"), devilReturn: asset("/supplication-street-v1.webp"), supplication: asset("/devil-alone-street-v2.webp"),
  testament: asset("/testament-study-v2.webp"),
};

const stageExtraImages: Partial<Record<Stage, string[]>> = {
  office: [asset("/ministry-office-dozing-v1.webp"), asset("/dream-cloud.webp")],
  bell: [asset("/bell-v1.webp"), asset("/devil-seated-cutout-v2.webp")],
  tiDeath: [asset("/ti-chin-fu-alive-v3.webp"), asset("/ti-chin-fu-corpse-v3.webp")],
  map: [asset("/journey-transport-train-v1.webp"), asset("/journey-transport-mail-steamer-v1.webp"), asset("/journey-transport-river-steamer-v1.webp"), asset("/journey-transport-flatboat-v1.webp"), asset("/journey-transport-pony-v1.webp")],
  repose: [asset("/curtain-prototype-interior-v1.webp"), asset("/curtain-prototype-panel-v1.webp"), asset("/curtain-prototype-hand-v1.webp"), asset("/pequim-tartar-city-v1.webp"), asset("/pequim-chinese-quarter-v1.webp")],
  camilloffReturn: [asset("/camilloff-map-hand-v1.webp")],
  devilReturn: [asset("/devil-standing-v1.webp")],
  supplication: [asset("/supplication-street-v1.webp"), asset("/devil-standing-v1.webp"), asset("/teodoro-run-v1.webp"), asset("/teodoro-kneel-v1.webp"), asset("/teodoro-fallen-v1.webp")],
};

const stagePreloadBranches: Partial<Record<Stage, Stage[]>> = { bell: ["tiDeath", "refusalEnding"], beijing: ["repose"] };
const imagePreloadCache = new Map<string, Promise<void>>();
const audioPreloadCache = new Map<string, Promise<void>>();

function preloadImage(src: string) {
  const cached = imagePreloadCache.get(src);
  if (cached) return cached;
  const request = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      try { if (typeof image.decode === "function") await image.decode(); } catch { /* load already succeeded */ }
      resolve();
    };
    image.onerror = () => reject(new Error(`Não foi possível carregar a imagem: ${src}`));
    image.src = src;
  }).catch((error) => { imagePreloadCache.delete(src); throw error; });
  imagePreloadCache.set(src, request);
  return request;
}

function preloadAudio(src: string) {
  const cached = audioPreloadCache.get(src);
  if (cached) return cached;
  const request = new Promise<void>((resolve, reject) => {
    const audio = new Audio();
    let settled = false;
    let timeout = 0;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      audio.removeEventListener("canplaythrough", ready);
      audio.removeEventListener("canplay", ready);
      audio.removeEventListener("error", failed);
      if (error) reject(error); else resolve();
    };
    const ready = () => finish();
    const failed = () => finish(new Error(`Não foi possível carregar o áudio: ${src}`));
    timeout = window.setTimeout(ready, 12000);
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", ready, { once: true });
    audio.addEventListener("canplay", ready, { once: true });
    audio.addEventListener("error", failed, { once: true });
    audio.src = src;
    audio.load();
  }).catch((error) => { audioPreloadCache.delete(src); throw error; });
  audioPreloadCache.set(src, request);
  return request;
}

async function preloadStage(stage: Stage) {
  const images = [stageBackgrounds[stage], ...(stageExtraImages[stage] ?? [])];
  // Audio is optional: unsupported codecs, autoplay restrictions and failed
  // audio requests must never prevent the next scene from opening.
  void preloadAudio(stageMusic[stage].src).catch(() => undefined);
  await Promise.all(images.map(preloadImage));
}

const refusalLines = [
  "Chama princípios à sua consciência só porque ainda não falámos de uma quantia concreta esta noite.",
  "Não se apresse a sentir orgulho, meu caro senhor. A fome sabe muito bem corrigir a linguagem da filosofia.",
];

const officeDocuments = [
  {
    id: "lamp-oil",
    title: "Informação sobre a dotação de azeite dos corredores",
    number: "N.º 174/B · Repartição de Administração",
    x: 9,
    y: 76,
    paragraphs: [
      "O terceiro piso da ala poente consumiu este mês mais um quarto de quartilho de azeite. A causa foi o acendimento antecipado das luzes em dias de chuva, não uma falha de guarda. A partir do próximo mês, encurtar-se-á ligeiramente o pavio de cada candeeiro; os pavios usados continuarão a ser registados no armazém.",
      "Não haverá aumento de despesa. O Livro de Requisição de Azeite terá capa castanha-clara, para se distinguir do anterior.",
    ],
  },
  {
    id: "paper-margin",
    title: "Uniformização da margem esquerda do papel de expediente",
    number: "N.º 208/C · Comissão de Formulários",
    x: 25,
    y: 79,
    paragraphs: [
      "A comissão reuniu pela sexta vez para discutir a margem esquerda. Dos sete membros, quatro votaram por dedo e meio, dois por um dedo e um quarto, e um não se pronunciou porque a tinta ainda não secara.",
      "Mantém-se dedo e meio. Não é necessário recopiar as folhas com margem ligeiramente menor; basta uma nota no índice. No fim do mês, deverá ainda informar-se se a graduação das réguas está legível.",
    ],
  },
  {
    id: "umbrella-rack",
    title: "Inventário de revisão dos números do porta-chapéus",
    number: "N.º 39/A · Repartição do Património",
    x: 48,
    y: 62,
    paragraphs: [
      "As chapas de latão n.os 4, 19 e 31 do suporte de guarda-chuvas da entrada estão gastas. A carpintaria deverá refazê-las segundo o modelo de 1872. Durante os trabalhos, os três lugares serão vedados com corda de cânhamo, sem recorrer aos números vizinhos.",
      "O guarda-chuva preto sem dono encontra-se à guarda há sessenta dias. Se ninguém o reclamar até ao primeiro dia do próximo mês, será enviado para a arrecadação com o espanador de cabo partido.",
    ],
  },
] as const;

const officeDreams = [
  "Champanhe num restaurante luxuoso, rodeado de criados…",
  "As mãos suaves de Vénus estendem-se para mim e acolhem-me…",
] as const;

const camilloffDepartureLines = [
  {
    speaker: "Camilloff",
    text: "Irei primeiro explicar o caso ao príncipe Tong. Se autorizar a investigação, procurarei informações no yamen e nos arquivos, e falarei com os escribas responsáveis pelos registos antigos.",
  },
  {
    speaker: "Camilloff",
    text: "Receio que seja complicado. Terei de provar que estas perguntas não escondem uma conspiração contra o Império nem ofendem os ritos sagrados.",
  },
  {
    speaker: "Camilloff",
    text: "Vladimira, minha querida, peço-te que cuides bem do nosso hóspede.",
  },
  {
    speaker: "Camilloff",
    text: "Teodoro, aguarde tranquilamente em minha casa. Farei o possível para encontrar a família de Ti Chin-Fu.",
  },
] as const;

const sceneHotspots: Partial<Record<Stage, HotspotItem[]>> = {
  market: [
    { id: "telescope", label: "Óculo antigo", x: 13, y: 64, translation: "O tubo de latão tem manchas brancas, como de sal marinho." },
    { id: "porcelain", label: "Nossa Senhora de porcelana", x: 21, y: 70, translation: "Uma imagem de Nossa Senhora que cabe na palma da mão. O vidrado azul descascou nas pregas do manto." },
    { id: "reliquary", label: "Relicário dourado", x: 54, y: 64, translation: "Resta uma só porta no relicário. Lá dentro, nenhum osso santo: apenas veludo ligeiramente húmido." },
    { id: "watch", label: "Relógio parado", x: 49, y: 82, translation: "Os ponteiros marcam quatro e dezassete. A coroa está presa pela ferrugem." },
    { id: "old-volume", label: "Livro carcomido", x: 35, y: 78, translation: "Encantavam-me os tipos antigos, o papel amarelecido e roído pela traça, a encadernação conventual e a fita verde entre as páginas." },
  ],
  room: [
    { id: "lamp", label: "Abat-jour verde", x: 7, y: 41, translation: "Sob o abat-jour, a luz parece ainda mais baça e amarelada." },
    { id: "folio", label: "Velho livro", x: 21, y: 73, translation: "Aqueles tipos solenes, o papel amarelo roído pela traça, a pesada encadernação conventual e a fita verde a marcar a página encantavam-me!" },
    { id: "bell", label: "Campainha de latão", x: 34, y: 53, translation: "A campainha repousa diante de mim, sobre um dicionário francês." },
    { id: "lottery", label: "Bilhete da lotaria", x: 43, y: 68, translation: "Desde que compro bilhetes, rezo todas as noites a Nossa Senhora para que me saia a sorte." },
    { id: "madonna", label: "Nossa Senhora", x: 42, y: 45, translation: "Esta litografia de Nossa Senhora das Dores ficou-me de minha mãe." },
  ],
  luxury: [
    { id: "gold-bed", label: "Leito de ouro", x: 63, y: 67, translation: "O leito está coberto de lâminas de ouro lavrado, de um gosto exuberante e bárbaro." },
    { id: "decanter", label: "Vinho e cristal", x: 78, y: 59, translation: "Os melhores vinhos da Borgonha: Romanée-Conti de 1858 e Chambertin de 1861." },
    { id: "coins", label: "Ouro", x: 86, y: 72, translation: "Com isto, o mundo inteiro se curva a meus pés." },
  ],
  beijing: [
    { id: "litter", label: "Liteira de seda vermelha", x: 84, y: 69, translation: "Uma rica liteira espera-me à porta de Tung Tsen-Men, com cortinas de seda escarlate bordadas a ouro." },
  ],
  mission: [
    { id: "bandage", label: "Ligaduras", x: 46, y: 64, translation: "Dois padres lazaristas limpam-me a orelha ferida." },
    { id: "well", label: "Poço", x: 66, y: 49, translation: "A roldana do poço range. O sino toca a matinas." },
    { id: "breviary", label: "Breviário", x: 60, y: 82, translation: "Pousei um rolo de notas do Banco de Inglaterra sobre o breviário, aberto numa página do Evangelho da Pobreza." },
    { id: "found-child", label: "Criança recolhida pelo padre", x: 91, y: 82, translation: "O padre Loriot encontrou esta criança moribunda à beira da estrada e trouxe-a para o convento, para a alimentar." },
  ],
  renounce: [
    { id: "window", label: "Janela à chuva", x: 86, y: 27, translation: "Lá fora, Lisboa continua igual. Eu é que já não posso regressar à paz de antes." },
    { id: "newspaper", label: "Jornais", x: 82, y: 77, translation: "Os jornais tratam a minha pobreza como uma anedota bem merecida." },
    { id: "bell-remains", label: "A campainha ficou", x: 61, y: 68, translation: "A campainha não desapareceu. Continua sobre a mesa, como uma dívida antiga que não se pode apagar." },
  ],
};

function useSound() {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const players = useRef<[HTMLAudioElement | null, HTMLAudioElement | null]>([null, null]);
  const activePlayer = useRef(0);
  const currentTrack = useRef("");
  const currentVolume = useRef(0.22);
  const fadeFrame = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const churchBellPlayer = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!context.current) {
      const AudioCtx = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      context.current = new AudioCtx();
      master.current = context.current.createGain();
      master.current.gain.value = 0;
      master.current.connect(context.current.destination);
    }
    void context.current.resume();
    return context.current;
  };

  const ensurePlayers = () => {
    if (typeof window === "undefined") return null;
    if (!players.current[0] || !players.current[1]) {
      players.current = [new Audio(), new Audio()];
      players.current.forEach((player) => {
        if (!player) return;
        player.loop = true;
        player.preload = "auto";
        player.volume = 0;
      });
    }
    return players.current as [HTMLAudioElement, HTMLAudioElement];
  };

  const cancelFade = () => {
    if (fadeFrame.current !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(fadeFrame.current);
      fadeFrame.current = null;
    }
  };

  const fade = (incoming: HTMLAudioElement, outgoing: HTMLAudioElement | null, target: number, duration = 900) => {
    cancelFade();
    const started = performance.now();
    const outgoingStart = outgoing?.volume ?? 0;
    const step = (now: number) => {
      const ratio = Math.max(0, Math.min((now - started) / duration, 1));
      incoming.volume = target * ratio;
      if (outgoing) outgoing.volume = outgoingStart * (1 - ratio);
      if (ratio < 1) {
        fadeFrame.current = window.requestAnimationFrame(step);
      } else {
        fadeFrame.current = null;
        if (outgoing) {
          outgoing.pause();
          outgoing.currentTime = 0;
        }
      }
    };
    fadeFrame.current = window.requestAnimationFrame(step);
  };

  const fadeTrack = (duration = 1200) => {
    const audioPlayers = ensurePlayers();
    if (!audioPlayers) return;
    cancelFade();
    const active = audioPlayers[activePlayer.current];
    const started = performance.now();
    const startVolume = active.volume;
    const step = (now: number) => {
      const ratio = Math.max(0, Math.min((now - started) / duration, 1));
      active.volume = startVolume * (1 - ratio);
      if (ratio < 1) fadeFrame.current = window.requestAnimationFrame(step);
      else {
        fadeFrame.current = null;
        active.pause();
      }
    };
    fadeFrame.current = window.requestAnimationFrame(step);
  };

  const playTrack = (src: string, volume: number) => {
    const audioPlayers = ensurePlayers();
    if (!audioPlayers) return;
    currentVolume.current = volume;
    if (currentTrack.current === src) {
      const active = audioPlayers[activePlayer.current];
      cancelFade();
      if (!enabledRef.current) return;
      if (active.paused) {
        active.currentTime = 0;
        active.volume = 0;
        void active.play().then(() => fade(active, null, volume, 500)).catch(() => undefined);
      } else {
        active.volume = volume;
      }
      return;
    }

    const outgoing = audioPlayers[activePlayer.current];
    const nextIndex = activePlayer.current === 0 ? 1 : 0;
    const incoming = audioPlayers[nextIndex];
    incoming.pause();
    incoming.src = src;
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.load();
    currentTrack.current = src;
    activePlayer.current = nextIndex;

    if (!enabledRef.current) {
      outgoing.pause();
      return;
    }
    void incoming.play().then(() => fade(incoming, outgoing, volume)).catch(() => undefined);
  };

  const restartTrack = (src: string, volume: number) => {
    const audioPlayers = ensurePlayers();
    if (!audioPlayers) return;
    cancelFade();
    audioPlayers.forEach((player) => {
      player.pause();
      player.currentTime = 0;
      player.volume = 0;
    });
    currentTrack.current = "";
    playTrack(src, volume);
  };

  const tone = (frequency: number, duration = 0.8, volume = 0.12, delay = 0, type: OscillatorType = "sine") => {
    const ctx = ensure();
    if (!ctx || !master.current || !enabledRef.current) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    oscillator.connect(gain);
    gain.connect(master.current);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.05);
  };

  const handbell = () => {
    const ctx = ensure();
    if (!ctx || !master.current || !enabledRef.current) return;

    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const convolver = ctx.createConvolver();
    dry.gain.value = 0.74;
    wet.gain.setValueAtTime(0.64, ctx.currentTime);
    wet.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.15);
    dry.connect(master.current);
    convolver.connect(wet);
    wet.connect(master.current);

    const impulseLength = Math.floor(ctx.sampleRate * 4.2);
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i += 1) {
        const decay = Math.pow(1 - i / impulseLength, 2.2);
        data[i] = (Math.random() * 2 - 1) * decay * 0.48;
      }
    }
    convolver.buffer = impulse;

    const partials: Array<[number, number, OscillatorType]> = [
      [642, 0.3, "triangle"],
      [913, 0.2, "sine"],
      [1387, 0.14, "sine"],
      [1928, 0.09, "triangle"],
      [2671, 0.055, "sine"],
      [3548, 0.035, "sine"],
    ];
    partials.forEach(([frequency, volume, type], index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.detune.setValueAtTime(index % 2 === 0 ? -3 : 4, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.008 + index * 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.55);
      oscillator.connect(gain);
      gain.connect(dry);
      gain.connect(convolver);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 3.7);
    });

    const strikeLength = Math.floor(ctx.sampleRate * 0.055);
    const strikeBuffer = ctx.createBuffer(1, strikeLength, ctx.sampleRate);
    const strikeData = strikeBuffer.getChannelData(0);
    for (let i = 0; i < strikeLength; i += 1) {
      strikeData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / strikeLength, 4);
    }
    const strike = ctx.createBufferSource();
    const highPass = ctx.createBiquadFilter();
    const strikeGain = ctx.createGain();
    strike.buffer = strikeBuffer;
    highPass.type = "highpass";
    highPass.frequency.value = 1500;
    strikeGain.gain.value = 0.16;
    strike.connect(highPass);
    highPass.connect(strikeGain);
    strikeGain.connect(dry);
    strikeGain.connect(convolver);
    strike.start();
  };

  const churchBell = () => {
    if (typeof window === "undefined" || !enabledRef.current) return;
    const bell = churchBellPlayer.current ?? new Audio(asset("/audio/church-bell-real-v1.mp3"));
    churchBellPlayer.current = bell;
    bell.pause();
    bell.currentTime = 0;
    bell.volume = 0.68;
    void bell.play().catch(() => undefined);
  };

  const thud = () => {
    tone(88, 0.32, 0.22);
    tone(55, 0.52, 0.16, 0.08);
  };

  const setAudio = (next: boolean) => {
    const ctx = ensure();
    const audioPlayers = ensurePlayers();
    if (typeof window !== "undefined" && !churchBellPlayer.current) {
      churchBellPlayer.current = new Audio(asset("/audio/church-bell-real-v1.mp3"));
      churchBellPlayer.current.preload = "auto";
      churchBellPlayer.current.load();
    }
    if (next && churchBellPlayer.current) {
      const bell = churchBellPlayer.current;
      bell.volume = 0;
      void bell.play().then(() => {
        bell.pause();
        bell.currentTime = 0;
      }).catch(() => undefined);
    }
    enabledRef.current = next;
    setEnabled(next);
    if (master.current && ctx) {
      master.current.gain.cancelScheduledValues(ctx.currentTime);
      master.current.gain.setTargetAtTime(next ? 0.72 : 0, ctx.currentTime, 0.04);
    }
    if (!audioPlayers) return;
    const active = audioPlayers[activePlayer.current];
    if (next && active.src) {
      active.volume = 0;
      void active.play().then(() => fade(active, null, currentVolume.current, 240)).catch(() => undefined);
    } else if (!next) {
      cancelFade();
      audioPlayers.forEach((player) => {
        player.pause();
        player.volume = 0;
      });
    }
  };

  const toggle = () => setAudio(!enabledRef.current);
  const enable = () => setAudio(true);

  return { enabled, enable, playTrack, restartTrack, fadeTrack, tone, handbell, churchBell, thud, toggle };
}

function TiChinFu({ intensity = 1, revealed, onInspect }: { intensity?: number; revealed: boolean; onInspect: () => void }) {
  return (
    <>
      <button
        className={`ti-figure ${revealed ? "is-revealed" : "is-silhouette"}`}
        style={{ "--ti-opacity": String(Math.min(0.28 + intensity * 0.2, 0.94)) } as React.CSSProperties}
        onClick={onInspect}
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* A raw img keeps the transparent corpse cutout portable in the edge build. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/ti-chin-fu-corpse-v3.webp")} alt="Ti Chin-Fu, de seda amarela, morto de costas, com o papagaio nos braços frios" />
      </button>
      <button
        className={`corpse-toggle ${revealed ? "is-dismiss" : "is-question"}`}
        onClick={onInspect}
        aria-label={revealed ? "É melhor não o ver…" : "Revelar o corpo de Ti Chin-Fu"}
        aria-pressed={revealed}
      >
        <span aria-hidden="true">{revealed ? "É melhor não o ver…" : "?"}</span>
      </button>
    </>
  );
}

function DevilFigure() {
  return (
    <figure className="devil-figure" aria-label="O Diabo de preto, chapéu alto e luvas negras, com as mãos no cabo do guarda-chuva">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/devil-seated-cutout-v2.webp")} alt="O Diabo de preto, chapéu alto e luvas negras, com as mãos apoiadas no guarda-chuva" />
    </figure>
  );
}

function SourceQuote({ pt, compact = false, className = "" }: { pt: string; compact?: boolean; className?: string }) {
  return (
    <blockquote className={`source-inline bilingual-quote ${compact ? "compact" : ""} ${className}`}>
      <span lang="pt-PT">“{pt}”</span>
    </blockquote>
  );
}

function SourceSlip({ item }: { item: HotspotItem }) {
  return (
    <aside className="source-slip" aria-live="polite">
      <div><span>Objeto</span><b>{item.label}</b></div>
      <p>{item.translation}</p>
    </aside>
  );
}

function HotspotLayer({ items, visited, active, onSelect }: { items: HotspotItem[]; visited: string[]; active?: string; onSelect: (item: HotspotItem) => void }) {
  return (
    <div className="hotspot-layer" aria-label="Objetos que podes examinar">
      {items.map((item, index) => (
        <button
          key={item.id}
          className={`scene-hotspot ${visited.includes(item.id) ? "is-visited" : ""} ${active === item.id ? "is-active" : ""}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          onClick={() => onSelect(item)}
          aria-label={`Examinar: ${item.label}`}
        >
          <i>{String(index + 1).padStart(2, "0")}</i><span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function LetterOfExcuses({ onTone, onReturn }: { onTone: (frequency: number, duration?: number, volume?: number) => void; onReturn: () => void }) {
  const [letterPhase, setLetterPhase] = useState<"room" | "envelope" | "incoming" | "incomingClosed" | "reply">("room");
  const [unfoldStep, setUnfoldStep] = useState<1 | 2 | 3>(1);
  const [reasonSlots, setReasonSlots] = useState<Array<LetterReasonId | null>>([null, null, null]);
  const [draggingReason, setDraggingReason] = useState<LetterReasonId | null>(null);
  const [letterFolded, setLetterFolded] = useState(false);
  const chosenReasons = reasonSlots.filter((reason): reason is LetterReasonId => reason !== null);
  const reasoningComplete = chosenReasons.length === 3;

  const advanceUnfold = () => {
    if (unfoldStep === 3) {
      setLetterPhase("incomingClosed");
      onTone(164.81, 0.75, 0.045);
      return;
    }
    setUnfoldStep((step) => Math.min(3, step + 1) as 1 | 2 | 3);
    onTone(184 + unfoldStep * 24, 0.65, 0.055);
  };

  const placeReason = (reasonId: LetterReasonId, requestedSlot?: number) => {
    if (reasonSlots.includes(reasonId) || letterFolded) return;
    const slot = requestedSlot ?? reasonSlots.findIndex((reason) => reason === null);
    if (slot < 0 || slot > 2 || reasonSlots[slot] !== null) return;
    setReasonSlots((slots) => slots.map((reason, index) => index === slot ? reasonId : reason));
    onTone(220 + slot * 36, 0.52, 0.045);
  };

  const removeReason = (slot: number) => {
    if (letterFolded || reasonSlots[slot] === null) return;
    setReasonSlots((slots) => slots.map((reason, index) => index === slot ? null : reason));
    onTone(164.81, 0.45, 0.035);
  };

  const dropReason = (event: ReactDragEvent<HTMLButtonElement>, slot: number) => {
    event.preventDefault();
    const reasonId = event.dataTransfer.getData("text/plain") as LetterReasonId;
    if (letterReasons.some((reason) => reason.id === reasonId)) placeReason(reasonId, slot);
    setDraggingReason(null);
  };

  const sealReply = () => {
    if (!reasoningComplete || letterFolded) return;
    setLetterFolded(true);
    onTone(98, 1.1, 0.065);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector<HTMLElement>(".game-shell")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [letterPhase, letterFolded]);

  const reasonById = (reasonId: LetterReasonId | null) => letterReasons.find((reason) => reason.id === reasonId);
  const openRoomLetter = () => {
    setLetterPhase("envelope");
    onTone(196, 0.55, 0.045);
  };

  if (letterFolded) {
    return (
      <div className="letter-experience is-complete">
        <div className="folded-letter-result" aria-live="polite">
          <span>Legação Russa · Pequim</span>
          <strong>Ao general Camilloff</strong>
          <small>Teodoro</small>
          <em>Selada</em>
        </div>
        <SourceQuote compact pt="Bem, Ti Chin-Fu está contente." />
        <button className="primary-action letter-return-action" onClick={onReturn}>Voltar à Europa <span>→</span></button>
      </div>
    );
  }

  return (
    <div className={`letter-experience phase-${letterPhase}`}>
      {letterPhase === "room" && (
        <>
          <button className="room-letter-direct-action" type="button" onClick={openRoomLetter}>A carta sobre a mesa <span>→</span>
          </button>
          <button
            className="room-letter-hotspot"
            type="button"
            onClick={openRoomLetter}
            aria-label="Pegar na carta sobre a mesa"
          >
            <span>A carta sobre a mesa</span><i aria-hidden="true" />
          </button>
        </>
      )}

      {letterPhase === "envelope" && (
        <button className="camilloff-envelope" type="button" onClick={() => { setLetterPhase("incoming"); onTone(208, 0.65, 0.05); }} aria-label="Abrir a carta de Camilloff">
          <span>Legação Russa · Pequim</span>
          <b>Ao senhor Teodoro</b>
          <i>Camilloff</i>
          <em>Abrir</em>
        </button>
      )}

      {letterPhase === "incoming" && (
        <article className={`camilloff-letter unfold-${unfoldStep}`} aria-label="A carta de Camilloff">
          <div className="camilloff-letter-panels">
            <section className="letter-fact-panel fact-error">
              <p lang="pt-PT">Enquanto à viúva e família de Ti Chin-Fu, houve um engano […]</p>

            </section>
            <section className="letter-fact-panel fact-cantao" aria-hidden={unfoldStep < 2}>
              <p lang="pt-PT">É no Sul da China, na província de Cantão.</p>

            </section>
            <section className="letter-fact-panel fact-kaoli" aria-hidden={unfoldStep < 3}>
              <p lang="pt-PT">Mas também há uma família Ti Chin-Fu para além da Grande Muralha […]</p>

            </section>
          </div>
          <button className="letter-unfold-control" type="button" onClick={advanceUnfold}>
            {unfoldStep < 3 ? "Continuar" : "Fechar a carta"} <span>→</span>
          </button>
        </article>
      )}

      {letterPhase === "incomingClosed" && (
        <div className="incoming-letter-closed" aria-live="polite">
          <div className="closed-letter-paper" aria-label="A carta de Camilloff, já fechada">
            <span>Carta de Camilloff</span><i>Lida</i>
          </div>
          <button className="primary-action write-reply-action" type="button" onClick={() => { setLetterPhase("reply"); onTone(196, 0.7, 0.05); }}>Responder <span>→</span>
          </button>
        </div>
      )}

      {letterPhase === "reply" && (
        <section className="reply-composer" aria-label="Escrever a resposta">
          <div className="reply-guidance">
            <p>Ti Chin-Fu e o seu papagaio nunca mais tinham aparecido. Pouco a pouco, o silêncio do morto tornava-se uma razão para eu partir.</p>
            <strong>Escolhe três pensamentos para a carta</strong>
          </div>
          <div className="reason-margin" aria-label="Seis pensamentos de Teodoro">
            {letterReasons.map((reason) => {
              const selected = reasonSlots.includes(reason.id);
              return (
                <button
                  key={reason.id}
                  className={`reason-note reason-${reason.id} ${selected ? "is-selected" : ""} ${draggingReason === reason.id ? "is-dragging" : ""}`}
                  type="button"
                  draggable={!selected}
                  disabled={selected}
                  onClick={() => placeReason(reason.id)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", reason.id);
                    event.dataTransfer.effectAllowed = "move";
                    setDraggingReason(reason.id);
                  }}
                  onDragEnd={() => setDraggingReason(null)}
                >
                  <span>{reason.text}</span><small>{reason.mark}</small>
                </button>
              );
            })}
          </div>
          <article className="reply-letter" aria-label="Resposta de Teodoro a Camilloff">
            <div className="reason-folds" aria-label="As três partes da carta">
              {reasonSlots.map((reasonId, index) => {
                const reason = reasonById(reasonId);
                return (
                  <button
                    key={index}
                    className={`reason-fold-slot ${reason ? "is-filled" : ""}`}
                    type="button"
                    onClick={() => removeReason(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropReason(event, index)}
                    aria-label={reason ? `Retirar: ${reason.text}` : `Parte ${index + 1} em branco`}
                  >
                    <b>{["Primeira parte", "Segunda parte", "Terceira parte"][index]}</b>
                    {reason ? <span>{reason.text}</span> : <em>Coloca aqui um pensamento</em>}
                  </button>
                );
              })}
            </div>
            {reasoningComplete && (
              <div className="letter-conclusion" aria-live="polite" aria-label="Portanto, fiz tudo o que podia.">
                <div className="ink-lines" aria-hidden="true"><i /><i /><i /></div>
                <span>Portanto,</span><strong>fiz tudo o que podia.</strong>
                <p>Peço-lhe ainda que envie à viúva de Ti Chin-Fu o dinheiro que depositei na casa comercial Tsing-Fó, na Avenida de Chá-Couá, junto ao arco de Tong e perto do templo de Kouan-Yin.</p>
              </div>
            )}
          </article>
        </section>
      )}

      {reasoningComplete && (
        <button className="seal-letter-action" type="button" onClick={sealReply}>Selar a carta <span>→</span>
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [preparedStage, setPreparedStage] = useState<Stage>("intro");
  const [loadingStage, setLoadingStage] = useState<Stage | null>(null);
  const [loadingError, setLoadingError] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [roomFinds, setRoomFinds] = useState<string[]>([]);
  const [officeDocumentsRead, setOfficeDocumentsRead] = useState<string[]>([]);
  const [activeOfficeDocument, setActiveOfficeDocument] = useState<number | null>(null);
  const [officeDozing, setOfficeDozing] = useState(false);
  const [officeDozed, setOfficeDozed] = useState(false);
  const [officeDreamsPopped, setOfficeDreamsPopped] = useState<number[]>([]);
  const [officeDreamsBursting, setOfficeDreamsBursting] = useState<number[]>([]);
  const [refusals, setRefusals] = useState(0);
  const [bellRung, setBellRung] = useState(false);
  const [bellSequence, setBellSequence] = useState<"" | "ringing" | "black">("");
  const [deathAnimationDone, setDeathAnimationDone] = useState(false);
  const [deathAnimationRun, setDeathAnimationRun] = useState(0);
  const [inheritanceOpened, setInheritanceOpened] = useState(false);
  const [chosenLuxuries, setChosenLuxuries] = useState<string[]>([]);
  const [avoidance, setAvoidance] = useState("");
  const [routeIndex, setRouteIndex] = useState(0);
  const [beijingDestination, setBeijingDestination] = useState<BeijingDestination>("");
  const [beijingVisited, setBeijingVisited] = useState<Exclude<BeijingDestination, "">[]>([]);
  const [camilloffDepartureStep, setCamilloffDepartureStep] = useState(0);
  const [camilloffDeparturePhase, setCamilloffDeparturePhase] = useState<"confession" | "briefing" | "leaving" | "gone">("confession");
  const [missionWaking, setMissionWaking] = useState(false);
  const [missionWakeAttempt, setMissionWakeAttempt] = useState<1 | 2 | 3>(1);
  const [missionWakePhase, setMissionWakePhase] = useState<"opening" | "closing">("opening");
  const missionWakeTimers = useRef<number[]>([]);
  const [returnStops, setReturnStops] = useState<string[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [visualFinds, setVisualFinds] = useState<Partial<Record<Stage, string[]>>>({});
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [ghostRevealed, setGhostRevealed] = useState(true);
  const [testamentOpen, setTestamentOpen] = useState(false);
  const [finalBookPhase, setFinalBookPhase] = useState<0 | 1 | 2>(0);
  const [finalArtifactsSeen, setFinalArtifactsSeen] = useState<string[]>([]);
  const [finaleStarted, setFinaleStarted] = useState(false);
  const [stageHistory, setStageHistory] = useState<Stage[]>([]);
  const sound = useSound();
  const ringing = bellSequence === "ringing";

  const info = stageInfo[stage];
  const nextReturnStop = returnPlaces.find((place) => !returnStops.includes(place));
  const isEast = ["map", "beijing", "repose", "camilloffDeparture", "camilloffIntercut", "camilloffReturn", "tienho", "mission", "letter"].includes(stage);
  const beijingStreetBackgrounds: Record<Exclude<BeijingDestination, "">, string> = {
    tartar: asset("/pequim-tartar-city-v1.webp"),
    chinese: asset("/pequim-chinese-quarter-v1.webp"),
  };
  const background = stageBackgrounds[stage];
  const stageIsReady = preparedStage === stage;
  const ghostIntensity = stage === "luxury" ? chosenLuxuries.length : corpsePresenceStages.includes(stage) ? 3 : 0;
  const currentHotspots = sceneHotspots[stage] ?? [];
  const currentVisited = visualFinds[stage] ?? [];
  const hasInspectedAll = currentHotspots.length > 0 && currentVisited.length >= currentHotspots.length;
  const allBeijingStopsVisited = beijingDestinationKeys.every((place) => beijingVisited.includes(place));
  const showBeijingCurtain = stage === "repose" && Boolean(beijingDestination);
  const officeComplete = officeDocumentsRead.length === officeDocuments.length && officeDozed;
  const openOfficeDocument = activeOfficeDocument === null ? null : officeDocuments[activeOfficeDocument];

  const resetRevisitableStage = (next: Stage) => {
    if (next === "office") {
      setOfficeDocumentsRead([]);
      setActiveOfficeDocument(null);
      setOfficeDozing(false);
      setOfficeDozed(false);
      setOfficeDreamsPopped([]);
      setOfficeDreamsBursting([]);
    }
    if (next === "market") {
      setVisualFinds((finds) => ({ ...finds, market: [] }));
    }
    if (next === "bell" && !bellRung) setRefusals(0);
    if (next === "ghost") setAvoidance("");
    if (next === "beijing") {
      setBeijingDestination("");
      setBeijingVisited([]);
      setVisualFinds((finds) => ({ ...finds, beijing: [] }));
    }
    if (next === "repose") {
      setBeijingDestination("");
      setBeijingVisited([]);
    }
    if (next === "camilloffDeparture") {
      setCamilloffDepartureStep(0);
      setCamilloffDeparturePhase("confession");
    }
    if (next === "testament") {
      setTestamentOpen(false);
      setFinalBookPhase(0);
      setFinalArtifactsSeen([]);
      setFinaleStarted(false);
    }
  };

  const enterPreparedStage = async (next: Stage, updateHistory: () => void) => {
    if (transitioning) return;
    resetRevisitableStage(next);
    setTransitioning(true);
    setLoadingStage(next);
    setLoadingError("");
    updateHistory();
    try {
      await Promise.all([preloadStage(next), new Promise((resolve) => window.setTimeout(resolve, 360))]);
      setPreparedStage(next);
      setStage(next);
      setSelectedHotspot(null);
      setGhostRevealed(true);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        setTransitioning(false);
        setLoadingStage(null);
      }));
    } catch {
      setLoadingError("Não foi possível carregar a cena. Verifica a ligação e tenta novamente.");
    }
  };

  const go = (next: Stage) => {
    void enterPreparedStage(next, () => setStageHistory((history) => [...history, stage]));
  };

  const goBack = () => {
    const previous = stageHistory.at(-1);
    if (!previous) return;
    void enterPreparedStage(previous, () => setStageHistory((history) => history.slice(0, -1)));
  };

  const retryLoadingStage = () => {
    if (!loadingStage) return;
    setLoadingError("");
    void preloadStage(loadingStage).then(() => {
      setPreparedStage(loadingStage);
      setStage(loadingStage);
      setSelectedHotspot(null);
      setGhostRevealed(true);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        setTransitioning(false);
        setLoadingStage(null);
      }));
    }).catch(() => setLoadingError("Ainda não foi possível carregar a cena. Tenta novamente mais tarde."));
  };

  const beginMissionAwakening = async () => {
    missionWakeTimers.current.forEach((timer) => window.clearTimeout(timer));
    missionWakeTimers.current = [];
    await enterPreparedStage("mission", () => setStageHistory((history) => [...history, stage]));
    setMissionWaking(true);
    setMissionWakeAttempt(1);
    setMissionWakePhase("closing");
    sound.churchBell();

    const schedule = (delay: number, action: () => void) => {
      missionWakeTimers.current.push(window.setTimeout(action, delay));
    };

    schedule(360, () => setMissionWakePhase("opening"));
    schedule(1850, () => setMissionWakePhase("closing"));
    schedule(2850, () => {
      setMissionWakeAttempt(2);
      setMissionWakePhase("opening");
      sound.churchBell();
    });
    schedule(4450, () => setMissionWakePhase("closing"));
    schedule(5600, () => {
      setMissionWakeAttempt(3);
      setMissionWakePhase("opening");
      sound.churchBell();
    });
    schedule(7700, () => {
      setMissionWaking(false);
      missionWakeTimers.current = [];
    });
  };

  const reset = () => {
    setStage("intro");
    setPreparedStage("intro");
    setLoadingStage(null);
    setLoadingError("");
    setTransitioning(false);
    setRoomFinds([]);
    setOfficeDocumentsRead([]);
    setActiveOfficeDocument(null);
    setOfficeDozing(false);
    setOfficeDozed(false);
    setOfficeDreamsPopped([]);
    setOfficeDreamsBursting([]);
    setRefusals(0);
    setBellRung(false);
    setBellSequence("");
    setDeathAnimationDone(false);
    setDeathAnimationRun(0);
    setInheritanceOpened(false);
    setChosenLuxuries([]);
    setAvoidance("");
    setRouteIndex(0);
    setBeijingDestination("");
    setBeijingVisited([]);
    setCamilloffDepartureStep(0);
    setCamilloffDeparturePhase("confession");
    missionWakeTimers.current.forEach((timer) => window.clearTimeout(timer));
    missionWakeTimers.current = [];
    setMissionWaking(false);
    setMissionWakeAttempt(1);
    setMissionWakePhase("opening");
    setReturnStops([]);
    setInfoOpen(false);
    setVisualFinds({});
    setSelectedHotspot(null);
    setGhostRevealed(true);
    setTestamentOpen(false);
    setFinalBookPhase(0);
    setFinalArtifactsSeen([]);
    setFinaleStarted(false);
    setStageHistory([]);
  };

  const progress = useMemo(() => {
    const value = stageOrder.indexOf(stage);
    return Math.max(2, ((value < 0 ? 2 : value + 1) / stageOrder.length) * 100);
  }, [stage]);

  useEffect(() => {
    const currentIndex = stageOrder.indexOf(stage);
    const targets = stagePreloadBranches[stage] ?? (currentIndex >= 0 && currentIndex < stageOrder.length - 1 ? [stageOrder[currentIndex + 1]] : []);
    targets.forEach((target) => { void preloadStage(target).catch(() => undefined); });
  }, [stage]);

  useEffect(() => {
    // Register hotspots to the actual covered artwork, including its crop and
    // subtle scale, instead of assuming that the viewport is a 16:9 image.
    const shell = document.querySelector<HTMLElement>(".game-shell");
    const backdrop = document.querySelector<HTMLElement>(".scene-image");
    if (!shell || !backdrop) return;
    const artwork = new Image();
    const align = () => {
      if (!artwork.naturalWidth) return;
      const rect = backdrop.getBoundingClientRect();
      const scale = Math.max(rect.width / artwork.naturalWidth, rect.height / artwork.naturalHeight);
      const width = artwork.naturalWidth * scale;
      const height = artwork.naturalHeight * scale;
      const position = getComputedStyle(backdrop).backgroundPosition.split(" ");
      const x = parseFloat(position[0]) / 100;
      const y = parseFloat(position[1]) / 100;
      shell.style.setProperty("--art-width", `${width}px`);
      shell.style.setProperty("--art-height", `${height}px`);
      shell.style.setProperty("--art-left", `${rect.left + (rect.width - width) * x}px`);
      shell.style.setProperty("--art-top", `${rect.top + (rect.height - height) * y}px`);
    };
    artwork.onload = align;
    artwork.src = stageBackgrounds[stage];
    const observer = new ResizeObserver(align);
    observer.observe(backdrop);
    window.addEventListener("resize", align);
    window.visualViewport?.addEventListener("resize", align);
    return () => {
      artwork.onload = null;
      observer.disconnect();
      window.removeEventListener("resize", align);
      window.visualViewport?.removeEventListener("resize", align);
    };
  }, [stage]);

  useEffect(() => {
    const resetScrollPosition = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.querySelectorAll<HTMLElement>(".game-shell, .scene-card, .intercut-stage, .intercut-copy, .map-workbench").forEach((element) => {
        element.scrollTop = 0;
        element.scrollLeft = 0;
      });
    };

    resetScrollPosition();
    const frame = window.requestAnimationFrame(resetScrollPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  useEffect(() => {
    if (!stageIsReady) return;
    if (stage === "tienho") {
      sound.fadeTrack(500);
      return;
    }
    const cue = stageMusic[stage];
    if (stage === "testament") sound.restartTrack(cue.src, cue.volume);
    else sound.playTrack(cue.src, cue.volume);
    // Track transitions follow narrative stages; the sound controller persists between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, stageIsReady]);

  useEffect(() => {
    if (activeOfficeDocument === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveOfficeDocument(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeOfficeDocument]);

  useEffect(() => {
    if (stage !== "tiDeath" || !stageIsReady) return;
    // Reset the one-shot animation whenever this scene is entered or replayed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeathAnimationDone(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeathAnimationDone(true);
      return;
    }
    const startled = window.setTimeout(() => sound.tone(92.5, 1.35, 0.1, 0, "sine"), 1350);
    const impact = window.setTimeout(() => sound.tone(55, 1.8, 0.12, 0, "triangle"), 4350);
    const finished = window.setTimeout(() => setDeathAnimationDone(true), 9000);
    return () => {
      window.clearTimeout(startled);
      window.clearTimeout(impact);
      window.clearTimeout(finished);
    };
    // The sound controller intentionally persists between narrative stages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, deathAnimationRun, stageIsReady]);

  const inspectHotspot = (item: HotspotItem) => {
    const existing = visualFinds[stage] ?? [];
    if (!existing.includes(item.id)) {
      setVisualFinds((finds) => {
        const stageFinds = finds[stage] ?? [];
        return stageFinds.includes(item.id) ? finds : { ...finds, [stage]: [...stageFinds, item.id] };
      });
      if (stage === "room") setRoomFinds((finds) => finds.includes(item.id) ? finds : [...finds, item.id]);
      if (stage === "luxury") setChosenLuxuries((finds) => finds.includes(item.id) ? finds : [...finds, item.id]);
    }
    setSelectedHotspot(item);
    sound.tone(246.94 + existing.length * 18, 0.55, 0.12, 0, "triangle");
  };

  const refuse = () => {
    sound.tone(122 - refusals * 12, 0.8, 0.08);
    if (refusals >= 2) {
      go("refusalEnding");
    } else {
      setRefusals(refusals + 1);
    }
  };

  const ringBell = () => {
    if (bellSequence || bellRung) return;
    setBellRung(true);
    setBellSequence("ringing");
    sound.handbell();
    window.setTimeout(() => {
      setBellSequence("black");
    }, 4300);
    window.setTimeout(() => {
      setBellSequence("");
      go("tiDeath");
    }, 5300);
  };

  const replayTiDeath = () => {
    setDeathAnimationDone(false);
    setDeathAnimationRun((run) => run + 1);
  };

  const chooseAvoidance = (choice: string) => {
    setAvoidance(choice);
  };

  const chooseBeijingDestination = (destination: Exclude<BeijingDestination, "">) => {
    setBeijingDestination(destination);
    setBeijingVisited((visited) => visited.includes(destination) ? visited : [...visited, destination]);
    setSelectedHotspot(null);
    sound.tone(174.61, 0.75, 0.06, 0, "triangle");
  };

  const returnToLitter = () => {
    setBeijingDestination("");
    setSelectedHotspot(null);
  };

  const advanceCamilloffDeparture = () => {
    setCamilloffDepartureStep((step) => Math.min(step + 1, camilloffDepartureLines.length - 1));
    sound.tone(220 + camilloffDepartureStep * 18, 0.42, 0.045, 0, "triangle");
  };

  const sendCamilloffOff = () => {
    if (camilloffDeparturePhase !== "briefing") return;
    setCamilloffDeparturePhase("leaving");
    sound.thud();
    [360, 720, 1080, 1440].forEach((delay, index) => {
      window.setTimeout(() => sound.tone(116 - index * 9, 0.42, 0.035 - index * 0.006, 0, "triangle"), delay);
    });
    window.setTimeout(() => setCamilloffDeparturePhase("gone"), 2100);
  };

  const inspectOfficeDocument = (index: number) => {
    const document = officeDocuments[index];
    setOfficeDocumentsRead((read) => read.includes(document.id) ? read : [...read, document.id]);
    setActiveOfficeDocument(index);
    sound.tone(220, 0.55, 0.05, 0, "triangle");
  };

  const toggleOfficeDoze = () => {
    setOfficeDozed(true);
    setOfficeDozing((dozing) => {
      if (!dozing) {
        setOfficeDreamsPopped([]);
        setOfficeDreamsBursting([]);
      }
      return !dozing;
    });
    sound.tone(123.47, 0.9, 0.045, 0, "sine");
  };

  const popOfficeDream = (index: number) => {
    if (officeDreamsBursting.includes(index)) return;
    setOfficeDreamsBursting((bursting) => [...bursting, index]);
    sound.tone(392 + index * 80, 0.32, 0.035, 0, "triangle");
    window.setTimeout(() => {
      setOfficeDreamsPopped((popped) => popped.includes(index) ? popped : [...popped, index]);
      setOfficeDreamsBursting((bursting) => bursting.filter((value) => value !== index));
    }, 460);
  };

  const openFinalTestament = () => {
    setFinalBookPhase(0);
    setTestamentOpen(true);
    setFinalArtifactsSeen((seen) => seen.includes("testament") ? seen : [...seen, "testament"]);
    sound.tone(164.81, 0.85, 0.06, 0, "triangle");
  };

  const closeFinalTestament = () => {
    setTestamentOpen(false);
    if (finalArtifactsSeen.includes("book")) setFinaleStarted(true);
  };

  const openFinalBook = () => {
    setTestamentOpen(false);
    setFinalBookPhase(1);
    sound.tone(196, 0.75, 0.055, 0, "triangle");
  };

  const turnFinalBookCover = () => {
    setFinalBookPhase(2);
    setFinalArtifactsSeen((seen) => seen.includes("book") ? seen : [...seen, "book"]);
    sound.tone(246.94, 0.9, 0.06, 0, "triangle");
  };

  const closeFinalBook = () => {
    setFinalBookPhase(0);
    sound.tone(196, 0.65, 0.045, 0, "triangle");
    if (finalArtifactsSeen.includes("testament")) setFinaleStarted(true);
  };

  const finalArtifactsRead = finalArtifactsSeen.includes("testament") && finalArtifactsSeen.includes("book");

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview");
    const previews: Record<string, Stage> = {
      "ti-death": "tiDeath", office: "office", bell: "bell", journey: "map",
      "camilloff-departure": "camilloffDeparture", "camilloff-return": "camilloffReturn",
      "camilloff-sequence": "camilloffDeparture", "camilloff-intercut": "camilloffIntercut",
      "devil-return": "devilReturn", "night-road": "prison", supplication: "supplication",
      tienho: "tienho", "mission-awakening": "tienho", mission: "mission",
      "letter-excuses": "letter", testament: "testament",
    };
    const previewStage = preview
      ? previews[preview] ?? [...stageOrder, "refusalEnding" as Stage].find((value) => value === preview)
      : undefined;
    if (!previewStage) return;
    setTransitioning(true);
    setLoadingStage(previewStage);
    void preloadStage(previewStage).then(() => {
      setPreparedStage(previewStage);
      setStage(previewStage);
      setStageHistory([]);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        setTransitioning(false);
        setLoadingStage(null);
      }));
    }).catch(() => setLoadingError("Não foi possível carregar a cena de teste. Verifica a ligação e tenta novamente."));
  }, []);

  return (
    <main className={`game-shell stage-${stage} ${stage === "camilloffDeparture" ? `departure-${camilloffDeparturePhase}` : ""} ${currentHotspots.length > 0 ? "has-hotspots" : ""} ${showBeijingCurtain ? "has-beijing-curtain" : ""} ${transitioning ? "is-transitioning" : ""} ${ringing ? "is-ringing-bell" : ""} ${finaleStarted ? "is-final-reader-address" : ""}`}>
      <div className="orientation-gate" role="status" aria-live="polite">
        <span className="orientation-phone" aria-hidden="true">▯</span>
        <strong>Roda o telemóvel</strong>
        <p>Joga O Mandarim com o telemóvel na horizontal.</p>
      </div>
      {(transitioning || !stageIsReady) && (
        <div className={`scene-loading-curtain ${loadingError ? "has-error" : ""}`} role="status" aria-live="polite" aria-busy="true">
          {loadingError && <div className="scene-loading-error"><strong>{loadingError}</strong><button type="button" onClick={retryLoadingStage}>Tentar novamente</button></div>}
        </div>
      )}
      <div className="scene-image" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      {stage === "office" && <div className={`office-doze-image ${officeDozing ? "is-visible" : ""}`} aria-hidden="true" />}
      <div className="scene-vignette" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />
      {stage === "camilloffDeparture" && <div className="departure-motion-layer" aria-hidden="true"><span>As rodas afastam-se</span></div>}

      <header className="topbar">
        <div className="navigation-actions">
          <button className="wordmark" onClick={reset} aria-label="Voltar à capa do jogo">O Mandarim<span>· Narrativa interativa</span></button>
          {stageHistory.length > 0 && !ringing && camilloffDeparturePhase !== "leaving" && <button className="back-button" onClick={goBack}>← Voltar</button>}
        </div>
        <div className="top-actions">
          {stage === "intro" && <LanguageSwitch locale="pt" />}
          <button className={`sound-button ${sound.enabled ? "is-on" : ""}`} onClick={sound.toggle} aria-label={sound.enabled ? "Desativar música e efeitos sonoros" : "Ativar música e efeitos sonoros"} title={sound.enabled ? "Desativar música e efeitos sonoros" : "Ativar música e efeitos sonoros"}>
            <span aria-hidden="true">{sound.enabled ? "♪" : "♪̸"}</span><b>{sound.enabled ? "Som: ligado" : "Ativar som"}</b>
          </button>
          <button className="icon-button" onClick={() => setInfoOpen(true)} aria-label="Sobre o jogo" title="Sobre o jogo">i</button>
        </div>
      </header>

      {stage !== "intro" && (
        <div className="progress-track" aria-label={`Progresso da história ${Math.round(progress)}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      {currentHotspots.length > 0 && !(stage === "mission" && missionWaking) && (
        <HotspotLayer items={currentHotspots} visited={currentVisited} active={selectedHotspot?.id} onSelect={inspectHotspot} />
      )}

      {stage === "office" && (
        <div className="office-document-hotspots" aria-label="Documentos sobre a mesa">
          {officeDocuments.map((document, index) => (
            <button
              key={document.id}
              className={officeDocumentsRead.includes(document.id) ? "is-read" : ""}
              style={{ left: `${document.x}%`, top: `${document.y}%` }}
              type="button"
              onClick={() => inspectOfficeDocument(index)}
              aria-label={`Abrir documento: ${document.title}`}
            >
              <span>{officeDocumentsRead.includes(document.id) ? "✓" : ["Ⅰ", "Ⅱ", "Ⅲ"][index]}</span>
            </button>
          ))}
        </div>
      )}

      {stage === "office" && officeDozing && (
        <div className="office-dream-layer" aria-label="Os devaneios de Teodoro">
          {officeDreams.map((dream, index) => !officeDreamsPopped.includes(index) && (
            <button key={dream} className={`office-dream-bubble ${officeDreamsBursting.includes(index) ? "is-bursting" : ""}`} type="button" onClick={() => popOfficeDream(index)} aria-label={`Devaneio ${index + 1}`}>
              <span>“{dream}”</span>
            </button>
          ))}
        </div>
      )}

      {stage === "office" && openOfficeDocument && (
        <div className="office-document-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveOfficeDocument(null);
        }}>
          <article className="official-paper office-document-sheet" role="dialog" aria-modal="true" aria-labelledby="office-document-title">
            <button className="office-document-close" type="button" onClick={() => setActiveOfficeDocument(null)} aria-label="Fechar documento">×</button>
            <span>Ministério do Reino de Portugal</span>
            <h2 id="office-document-title">{openOfficeDocument.title}</h2>
            <small>{openOfficeDocument.number}</small>
            {openOfficeDocument.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <footer>À consideração de Sua Excelência o Ministro<br /><b>Secretaria Central de Lisboa</b></footer>
          </article>
        </div>
      )}

      {showBeijingCurtain && beijingDestination && (
        <BeijingCurtainScene
          key={beijingDestination}
          title={beijingDestinations[beijingDestination].title}
          exterior={beijingStreetBackgrounds[beijingDestination]}
          soundEnabled={sound.enabled}
          onDepart={returnToLitter}
        >
          {beijingDestination === "tartar" ? (
            <>
              <SourceQuote pt="A habitação de Camilloff ficava na Cidade Tártara, nos bairros militares e nobres. Há aqui uma tranquilidade austera." />
              <p>Carruagens de rodas altas, pregadas de ouro, e liteiras de funcionários atravessam as ruas largas. As lojas sumptuosas exibem porcelanas Ming, bronzes, esmaltes, marfim e sedas. Por trás das muralhas, os telhados amarelos do palácio brilham entre as árvores. Arqueiros nobres, funcionários de pena de pavão e enormes papagaios de papel guardam um mundo inacessível.</p>
              <SourceQuote compact pt="Aqui está o vasto palácio imperial, entre arvoredos misteriosos, com os seus telhados de um amarelo de oiro vivo!" />
            </>
          ) : beijingDestination === "chinese" ? (
            <>
              <SourceQuote pt="E lá fomos penetrando na Cidade Chinesa, pela porta monstruosa de Tchin-Men. Aqui habita a burguesia, o mercador, a populaça." />
              <p>As lajes estão imundas e enlameadas. Cães famintos uivam nos terrenos vazios; os enxurros exalam um cheiro acre, e a poeira amarela o ar. Caravanas de camelos avançam entre barracas degradadas, carregadores e mendigos. Quanto mais nos aproximamos do Templo do Céu, mais a miséria parece uma muralha sem fim.</p>
              <SourceQuote compact pt="Uma multidão rumorosa e espessa, onde domina o tom pardo e azulado dos trajes, circula sem cessar; a poeira envolve tudo de uma névoa amarelada; um fedor acre exala-se dos enxurros negros […]" />
            </>
          ) : null}
        </BeijingCurtainScene>
      )}

      {stage === "supplication" && (
        <SupplicationSequence soundEnabled={sound.enabled} onContinue={() => go("testament")}>
          <TiChinFu
            intensity={ghostIntensity}
            revealed={ghostRevealed}
            onInspect={() => {
              setGhostRevealed(!ghostRevealed);
              sound.tone(98, 1.8, 0.12, 0, "sine");
            }}
          />
        </SupplicationSequence>
      )}

      {stage === "tienho" && (
        <TienhoSequence
          onComplete={beginMissionAwakening}
        />
      )}

      <section className={`scene-card ${isEast ? "scene-card-east" : ""}`} aria-live="polite" aria-hidden={showBeijingCurtain || undefined}>
        {info.act && <div className="scene-kicker chapter-kicker">{info.act}</div>}
        <h1 className="chapter-title">{info.title}</h1>
        {info.subtitle && <div className="scene-pt">{info.subtitle}</div>}
        {selectedHotspot && !["market", "room", "luxury", "beijing", "mission", "renounce"].includes(stage) && <SourceSlip item={selectedHotspot} />}

        {stage === "intro" && (
          <div className="intro-content">
            <p className="lede">Uma campainha, uma viagem ao Extremo Oriente<br />e uma dívida que nunca se acaba de pagar.</p>
            <button className="primary-action bell-action" onClick={() => { sound.enable(); go("office"); }}>
              <span>Começar</span>
            </button>
            <p className="edition-note">Uma adaptação da novela de Eça de Queirós</p>
          </div>
        )}

        {stage === "office" && (
          <div className="scene-body office-scene">
            <SourceQuote pt="A minha existência era bem equilibrada e suave. Toda a semana, de mangas de lustrina à carteira da minha repartição, ia lançando, numa formosa letra cursiva, sobre o papel «Tojal» do Estado, estas frases fáceis: […]" />
            <p>Bastava-me copiar respeitosamente, letra a letra, para receber com segurança os meus vinte mil réis mensais.</p>
            <div className="office-mobile-documents" aria-label="Os três documentos da mesa">
              {officeDocuments.map((document, index) => (
                <button key={document.id} className={officeDocumentsRead.includes(document.id) ? "is-read" : ""} type="button" onClick={() => inspectOfficeDocument(index)}>
                  <span>{officeDocumentsRead.includes(document.id) ? "✓" : ["Ⅰ", "Ⅱ", "Ⅲ"][index]}</span>{document.title}
                </button>
              ))}
            </div>
            <div className="office-actions">
              <div className="office-document-progress"><span>Documentos sobre a mesa</span><b>{officeDocumentsRead.length} / {officeDocuments.length}</b><small>{officeDocumentsRead.length === officeDocuments.length ? "Os três documentos estão copiados" : "Ler os documentos"}</small></div>
              <button className={`object-action ${officeDozed ? "is-read" : ""}`} onClick={toggleOfficeDoze}><span>{officeDozing ? "Acordar" : "Dormitar"}</span></button>
            </div>
            {officeComplete ? (
              <button className="primary-action" onClick={() => go("market")}>Sair da repartição <span>→</span></button>
            ) : null}
          </div>
        )}

        {stage === "market" && (
          <div className="scene-body market-scene">
            <SourceQuote pt="tinha tomado o hábito discreto de comprar na Feira da Ladra antigos volumes desirmanados, e à noite, no meu quarto, repastava-me dessas leituras curiosas." />
            <p>As bancas da feira estendem-se pela encosta. Óculos antigos, relicários sem relíquias, imagens descascadas e relógios parados amontoam-se lado a lado. Aqueles livros estranhos cabem mais facilmente no meu orçamento do que um jantar.</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.market ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <>
                <SourceQuote compact pt="O tipo venerando, o papel amarelado com picadas de traça, a grave encadernação freirática, a fitinha verde marcando a página — encantavam-me!" />
                <p>Contei algumas moedas de cobre e, com o velho livro debaixo do braço, voltei ao número 106 da Travessa da Conceição.</p>
                <button className="primary-action" onClick={() => go("room")}>Voltar a casa <span>→</span></button>
              </>
            ) : <p className="discovery-count">Vistos {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "room" && (
          <div className="scene-body room-scene-copy">
            <p>O livro que trouxe da feira está aberto sobre a mesa, na página marcada pela fita verde.</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.room ?? []).map((item) => (
                <button key={item.id} className={roomFinds.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{roomFinds.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <p className="discovery-count">Vistos {currentVisited.length} / {currentHotspots.length} </p>
            <button className="primary-action room-book-action" onClick={() => go("book")}>Ler o livro <span>→</span></button>
          </div>
        )}

        {stage === "book" && (
          <div className="scene-body book-scene">
            <article className="book-leaf featured-book-page">
              <span>Brecha das Almas</span>
              <blockquote lang="pt-PT">«No fundo da China existe um mandarim mais rico que todos os reis de que a fábula ou a história contam. Dele nada conheces, nem o nome, nem o semblante, nem a seda de que se veste. Para que tu herdes os seus cabedais infindáveis, basta que toques essa campainha, posta a teu lado, sobre um livro. Ele soltará apenas um suspiro, nesses confins da Mongólia. Será então um cadáver: e tu verás a teus pés mais ouro do que pode sonhar a ambição de um avaro. Tu, que me lês e és um homem mortal, tocarás tu a campainha?»</blockquote>

            </article>
            <button className="primary-action" onClick={() => { sound.tone(164.81, 0.8, 0.08, 0, "triangle"); go("bell"); }}>Ouvir a voz <span>→</span></button>
          </div>
        )}

        {stage === "bell" && (
          <div className="scene-body bell-scene">
            <div className="devil-dialogue-card">
              <span>O Diabo</span>
              <blockquote className="source-inline bilingual-quote compact">
                <span lang="pt-PT">“Vamos, Teodoro, meu amigo, estenda a mão, toque a campainha, seja um forte!”</span>

              </blockquote>
            </div>
            {refusals > 0 && refusals < 3 && !bellRung && (
              <div className="devil-reply">
                <span>O Diabo</span>
                <p>“{refusalLines[refusals - 1]}”</p>
              </div>
            )}
            {bellRung && !ringing ? (
              <div className="consequence locked-choice">
                <p>O metal continua a ressoar. O suspiro que se ouviu ao longe já não pode ser desfeito.</p>
                <button className="primary-action" onClick={() => go("tiDeath")}>O som chega ao longe <span>→</span></button>
              </div>
            ) : (
              <div className="bell-choice">
                <button className={`bell-object ${ringing ? "is-ringing" : ""}`} onClick={ringBell} disabled={ringing} aria-label="Tocar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset("/bell-v1.webp")} alt="Uma delicada campainha europeia de latão do século XIX" />
                </button>
                <div className="choice-stack">
                  <button className="choice-button dangerous" onClick={ringBell} disabled={ringing}><span>Tocar</span></button>
                  <button className="choice-button" onClick={refuse} disabled={ringing}><span>Recusar</span></button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === "tiDeath" && stageIsReady && (
          <div className="ti-death-scene" key={deathAnimationRun}>
            <div className="death-mist death-mist-back" aria-hidden="true" />
            <div className="death-character-stage" aria-label="Animação em recortes: Ti Chin-Fu ouve a campainha e cai morto junto ao arroio do jardim">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ti-alive-cutout" src={asset("/ti-chin-fu-alive-v3.webp")} alt="Ti Chin-Fu, corpulento e de barba branca, vestido de seda amarela e com um papagaio de papel, junto ao arroio" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ti-corpse-cutout" src={asset("/ti-chin-fu-corpse-v3.webp")} alt="Ti Chin-Fu cai de costas na relva, ainda com o papagaio nos braços frios" />
              <div className="death-ground-shadow" aria-hidden="true" />
            </div>
            <div className="death-mist death-mist-front" aria-hidden="true" />
            <aside className={`death-caption ${deathAnimationDone ? "is-visible" : ""}`}>
              <blockquote lang="pt-PT">“Agora jaz à beira de um arroio cantante, todo vestido de seda amarela, morto, de pança ao ar, sobre a relva verde: e nos braços frios tem o seu papagaio de papel, que parece tão morto como ele.”</blockquote>

              <div className="death-actions">
                <button onClick={replayTiDeath}>Rever</button>
                <button className="primary-action" onClick={() => go("inheritance")}>Um mês depois <span>→</span></button>
              </div>
            </aside>
          </div>
        )}

        {stage === "refusalEnding" && (
          <div className="scene-body ending-body refusal-body">
            <div className="ending-mark">I</div>
            <blockquote className="ending-quote">“Muito bem, meu caro amigo. Conservou a consciência — e também a pobreza. Mas isto é só hoje. Oxalá nunca se arrependa.”</blockquote>
            <p className="original-note">O Diabo desapareceu. Esta noite, a tentação não venceu.<br />(Diálogo original do jogo; não pertence ao texto de Eça.)</p>
            <button className="primary-action" onClick={() => setFinaleStarted(true)}>Fechar o livro <span>→</span></button>
          </div>
        )}

        {stage === "inheritance" && (
          <div className="scene-body inheritance-scene">
            {!inheritanceOpened ? (
              <>
                <SourceQuote compact pt="Decorreu um mês." />
                <p>Numa manhã de domingo, em agosto, dormitava na cama, em mangas de camisa, com o cigarro apagado nos lábios. A porta rangeu de mansinho. Entreabri os olhos e vi um senhor calvo inclinar-se junto de mim.</p>
                <div className="messenger-dialogue">
                  <span>Silvestre</span>
                  <SourceQuote compact pt="O Sr. Teodoro?... O Sr. Teodoro do Ministério do Reino?" />
                  <p>Era baixo e gordo. As suíças brancas roçavam-lhe as lapelas escuras, e os óculos de ouro tremiam sobre o rosto redondo. Nas mãos trazia um envelope volumoso, fechado com lacre negro.</p>
                </div>
                <div className="sealed-letter">
                  <button type="button" aria-label="Abrir o envelope de lacre negro" onClick={() => { setInheritanceOpened(true); sound.tone(329.63, 0.9, 0.08); }}>
                    <span className="wax-seal" aria-hidden="true" />
                    <span className="sealed-letter-open">Abrir</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <SourceQuote pt="São cento e seis mil contos, senhor! […] da herança depositada do mandarim Ti Chin-Fu!" />
                <p>A casa Silvestre tinha relações com comerciantes de Macau e Hong-Kong. A notícia chegara no paquete de Southampton. Eu, pobre amanuense ainda há um mês, era agora o único herdeiro daquele morto desconhecido.</p>
                <div className="money-number">106000 <small>contos</small></div>
                <SourceQuote compact pt="— Pobre Ti Chin-Fu!... — Morreu? — Estava no seu jardim, sossegado, armando, para o lançar ao ar, um papagaio de papel […]" />
                <p>O morto desconhecido tinha, enfim, um nome.</p>
                <button className="primary-action" onClick={() => go("luxury")}>Mudar para o Loreto <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "luxury" && (
          <div className="scene-body">
            <SourceQuote pt="Então começou a minha vida de milionário." />
            <p>Tinha à minha disposição todos os prazeres do mundo. Mas aquela figura sinistra, que de vez em quando me aparecia, tirava-lhes todo o sabor.</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.luxury ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => { sound.tone(110, 2.4, 0.08); go("ghost"); }}>Não posso ignorá-lo… <span>→</span></button>
            ) : <p className="discovery-count">Vistos {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "ghost" && (
          <div className="scene-body ghost-scene">
            <SourceQuote pt="ou estirada no limiar da porta, ou atravessada sobre o leito de ouro — lá jazia a figura bojuda, de rabicho negro e túnica amarela, com o seu papagaio nos braços... Era o mandarim Ti Chin-Fu!" />
            {avoidance ? (
              <div className="consequence">
                <p>{avoidance === "pleasure" ? "Tentei afogar a culpa em música, banquetes e noites de folia. Mas, depois de os convidados partirem, o cadáver de Ti Chin-Fu continuava estendido à minha porta." : avoidance === "church" ? "Paguei missas e a construção de igrejas. As orações, porém, não afastaram Ti Chin-Fu." : "Viajei por toda a parte. Fosse aonde fosse, a imagem do cadáver seguia-me."}</p>
                <SourceQuote compact pt="Partiria para Pequim; descobriria a família de Ti Chin-Fu […]" />
                <button className="primary-action" onClick={() => go("map")}>Ir à China <span>→</span></button>
              </div>
            ) : (
              <>
                <SourceQuote compact pt="Tinha eliminado a criatura, de longe, com uma campainha. […] eu assassinara um velho!" />
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => chooseAvoidance("pleasure")}><span>Buscar os prazeres</span></button>
                  <button className="choice-button" onClick={() => chooseAvoidance("church")}><span>Recorrer à Igreja</span></button>
                  <button className="choice-button" onClick={() => chooseAvoidance("travel")}><span>Viajar para esquecer</span></button>
                </div>
              </>
            )}
          </div>
        )}

        {stage === "map" && (
          <div className="scene-body map-scene">
            <SourceQuote pt="Anelei, suspirei por pisar a terra da China! […] pus a proa ao Oriente." />
            <p>Uma noite, parti para Marselha. Ali fretei, por uma fortuna, o paquete Ceilão e pus a proa ao Oriente.</p>
            <div className="route" role="img" aria-label={`Progresso da viagem: ${routes[routeIndex][0]}; ${routeTransports[Math.min(routeIndex, routeTransports.length - 1)].label}`}>
              <div className="route-line"><span style={{ width: `${(routeIndex / (routes.length - 1)) * 100}%` }} /></div>
              <div className="route-transport-legend" aria-hidden="true">
                {routeTransports.map((transport, index) => (
                  <span
                    key={transport.id}
                    className={`route-transport transport-${transport.id} ${index < routeIndex ? "is-complete" : ""} ${index === Math.min(routeIndex, routeTransports.length - 1) ? "is-current" : ""}`}
                    style={{ left: `${((index + 0.5) / routeTransports.length) * 100}%` }}
                  >
                    <i />
                  </span>
                ))}
              </div>
              {routes.map((stop, index) => (
                <button key={stop[0]} className={`route-stop ${index <= routeIndex ? "is-reached" : ""} ${index === routeIndex ? "is-current" : ""}`} style={{ left: `${(index / (routes.length - 1)) * 100}%` }} disabled aria-label={stop[0]}>
                  <i /><span>{stop[0]}</span>
                </button>
              ))}
            </div>
            <div className="travel-caption">
              <strong>{routes[routeIndex][0]}</strong>
              <span>{routes[routeIndex][1]}</span>
            </div>
            {routeIndex < routes.length - 1 ? (
              <button className="primary-action" onClick={() => { setRouteIndex(routeIndex + 1); sound.tone(146.83 + routeIndex * 9, 1, 0.05); }}>Continuar a viagem <span>→</span></button>
            ) : (
              <button className="primary-action" onClick={() => go("beijing")}>Entrar em Pequim <span>→</span></button>
            )}
          </div>
        )}

        {stage === "beijing" && (
          <div className="scene-body beijing-arrival-scene">
            <SourceQuote pt="Pequim está diante de mim! E uma vasta muralha, monumental e bárbara, de um negro baço, estendendo-se a perder de vista […]" />
            <p>Os beirais sobrepostos das portas recortam-se no poente rubro. A norte, as montanhas da Mongólia parecem suspensas numa névoa violeta. Ao pé da muralha negra, comprime-se um mercado estranho: lanternas recortam manchas vermelhas no crepúsculo, e os toldos brancos lembram borboletas pousadas junto ao muro.</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.beijing ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {!hasInspectedAll ? (
              <p className="discovery-count">Vistos {currentVisited.length} / {currentHotspots.length}</p>
            ) : (
              <>
                <SourceQuote compact pt="Uma rica liteira esperava-me à Porta de Tung Tsen-Men, para eu atravessar Pequim até à residência militar de Camilloff." />
                <button className="primary-action" onClick={() => go("repose")}>Subir à liteira <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "repose" && (
          <div className="scene-body beijing-tour-scene">
            {!beijingDestination && (
              <>
                <SourceQuote pt="Senti-me triste; subi à liteira, cerrei as cortinas de seda escarlate todas bordadas a ouro; e cercado dos cossacos, eis-me entrando a velha Pequim […]" />
                <p>Passam para lá da cortina os sons de rodas, varais, cascos e camelos. Em cada paragem, posso mandar deter os carregadores e abrir a cortina para ver o luxo de Pequim — ou a sua miséria.</p>
                <div className="beijing-destination-grid">
                  {beijingDestinationKeys.map((key) => {
                    const destination = beijingDestinations[key];
                    return (
                    <button key={key} className={beijingVisited.includes(key) ? "is-visited" : ""} onClick={() => chooseBeijingDestination(key)}>
                      <span>{beijingVisited.includes(key) ? "Revisitar" : "Visitar"}</span>
                      <strong>{destination.title}</strong>
                      {destination.original && <em>{destination.original}</em>}
                      <small>{destination.summary}</small>
                    </button>
                    );
                  })}
                </div>
                {allBeijingStopsVisited && <button className="primary-action" onClick={() => go("camilloffDeparture")}>Ir a Camilloff <span>→</span></button>}
              </>
            )}
          </div>
        )}

        {stage === "camilloffDeparture" && (
          <div className={`scene-body camilloff-departure ${camilloffDeparturePhase}`}>
            {camilloffDeparturePhase === "confession" ? (
              <div className="departure-confession">
                <div className="departure-time-label">Residência de Camilloff</div>
                <SourceQuote compact pt="— O meu prezado hóspede sabe o chinês? — perguntou-me de repente, fixando em mim a pupila sagaz. — Sei duas palavras importantes, general: «mandarim» e «chá»." />
                <p>De volta a casa de Camilloff, contei-lhe da campainha, da morte de Ti Chin-Fu e do motivo da viagem. O general pouco disse; quis apenas saber a quem deveria chegar a reparação.</p>
                <div className="departure-proposal">
                  <div className="speaker">Camilloff</div>
                  <SourceQuote compact pt="Faça uma coisa. Procure a família de Ti Chin-Fu..." />
                  <p>Só encontrando a família do morto poderia a reparação chegar a quem perdera a fortuna. Camilloff prometeu ir pessoalmente ao yamen do príncipe Tong.</p>
                </div>
                <button className="primary-action" onClick={() => setCamilloffDeparturePhase("briefing")}>Ouvir o plano <span>→</span></button>
              </div>
            ) : camilloffDeparturePhase === "gone" ? (
              <div className="departure-afterglow">
                <p className="departure-soundline">A porta fechou-se. Cascos e rodas afastaram-se pela calçada.</p>
                <p>Enquanto o general percorria a cidade em busca da família de Ti Chin-Fu, eu ficava em sua casa, gozando a calorosa hospitalidade da generala.</p>
                <button className="primary-action" onClick={() => go("camilloffIntercut")}>Esperar notícias <span>→</span></button>
              </div>
            ) : (
              <>
                <SourceQuote compact pt="quando o general saiu com a sua escolta cossaca para o Yamen do príncipe Tong, a informar-se da residência da família Ti Chin-Fu — […]" />
                <div className="departure-dialogue" aria-live="polite">
                  <div className="speaker">{camilloffDepartureLines[camilloffDepartureStep].speaker}</div>
                  <p>{camilloffDepartureLines[camilloffDepartureStep].text}</p>
                  <div className="departure-count">{String(camilloffDepartureStep + 1).padStart(2, "0")} / {String(camilloffDepartureLines.length).padStart(2, "0")}</div>
                </div>
                {camilloffDepartureStep < camilloffDepartureLines.length - 1 ? (
                  <button className="primary-action" onClick={advanceCamilloffDeparture}>Continuar <span>→</span></button>
                ) : (
                  <button className="primary-action" onClick={sendCamilloffOff}>Acompanhar à porta <span>→</span></button>
                )}
              </>
            )}
          </div>
        )}

        {stage === "camilloffIntercut" && (
          <CamilloffIntercut
            onTone={(frequency, duration, volume) => sound.tone(frequency, duration, volume, 0, "triangle")}
            onComplete={() => go("camilloffReturn")}
          />
        )}

        {stage === "camilloffReturn" && (
          <CamilloffReturnMap
            onTone={(frequency, duration, volume) => sound.tone(frequency, duration, volume, 0, "triangle")}
            onContinue={() => go("tienho")}
          />
        )}

        {stage === "mission" && (
          <div className="scene-body">
            <SourceQuote pt="[…] um sino tocava a matinas: […] rolaram-me das pálpebras duas lágrimas mudas." />
            <p>Dois padres lazaristas encontraram-me inconsciente na estrada, de manhã, e levaram-me de maca para o convento. Só depois soube que Sá-Tó, embora ferido, conseguira voltar a Pequim.</p>
            <SourceQuote compact pt="O superior lazarista era o excelente padre Giulio. […] com a sua túnica roxa, o rabicho longo, a barba venerável, agitando devagar um enorme leque — […]" />
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.mission ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => go("letter")}>Voltar ao quarto <span>→</span></button>
            ) : (
              <p className="discovery-count">Vistos {currentVisited.length} / {currentHotspots.length}</p>
            )}
          </div>
        )}

        {stage === "letter" && (
          <LetterOfExcuses
            onTone={(frequency, duration, volume) => sound.tone(frequency, duration, volume, 0, "triangle")}
            onReturn={() => go("return")}
          />
        )}

        {stage === "return" && (
          <div className="scene-body ghost-scene">
            <p>O Java levou-me de Hong-Kong de volta à Europa. Até então, julgara apaziguado o rancor de Ti Chin-Fu. Mas, naquela noite, às onze horas, entrei na cabina já às escuras. O luar atravessava o vidro…</p>
            <SourceQuote
              pt="Eram onze horas quando desci ao meu beliche. As luzes já estavam apagadas: mas a Lua que se erguia ao nível da água, redonda e branca, batia o vidro da cabina com um raio de claridade: e então, a essa meia-tinta pálida, lá vi, estirada sobre a maca, a figura pançuda, vestida de seda amarela, com o seu papagaio nos braços!"

            />
            <SourceQuote compact pt="Era ele, outra vez! E foi ele, perpetuamente!" />
            <p>Ti Chin-Fu reapareceu de súbito no navio de regresso. Durante o resto da viagem, não voltou a dar-me sossego.</p>
            <div className="return-route-guide" id="return-route-guide">
              <span>Seleciona os lugares para seguir o morto na viagem.</span>
              <b>Vistos {returnStops.length} / {returnPlaces.length}</b>
            </div>
            <div className="return-stamps" aria-label="Escalas do regresso" aria-describedby="return-route-guide">
              {returnPlaces.map((place, index) => (
                <button key={place} className={returnStops.includes(place) ? "is-read" : place === nextReturnStop ? "is-next" : ""} style={{ animationDelay: `${index * 0.16}s` }} onClick={() => {
                  setReturnStops((stops) => stops.includes(place) ? stops : [...stops, place]);
                  sound.tone(110 + index * 14, 0.7, 0.11, 0, "triangle");
                }}>{place}</button>
              ))}
            </div>
            {returnStops.length >= returnPlaces.length ? (
              <>
                <SourceQuote compact pt="Quando desembarquei em Lisboa, no Cais das Colunas, a sua figura bojuda enchia todo o arco da Rua Augusta; […]" />
                <button className="primary-action" onClick={() => go("reckoning")}>Voltar ao Loreto <span>→</span></button>
              </>
            ) : null}
          </div>
        )}

        {stage === "reckoning" && (
          <div className="scene-body ghost-scene reckoning-scene">
            <SourceQuote
              pt="Então, certo que não poderia jamais aplacar Ti Chin-Fu, toda essa noite no meu quarto ao Loreto, onde como outrora as velas inumeráveis das serpentinas davam aos damascos tons de sangue fresco, meditei sacudir de mim, como um adorno de pecado, esses milhões sobrenaturais."

            />
            <p>Percorrera meio mundo sem me livrar de Ti Chin-Fu. Se a riqueza era o caminho por onde o cadáver vinha ter comigo, só me restava cortá-lo.</p>
            <SourceQuote compact pt="E assim me libertaria talvez daquela pança e daquele papagaio abominável!" />
            <button className="primary-action" onClick={() => go("renounce")}>Abandonar a fortuna <span>→</span></button>
          </div>
        )}

        {stage === "renounce" && (
          <div className="scene-body">
            <SourceQuote pt="Abandonei o palacete ao Loreto, a existência de nababo." />
            <p>Voltei a alugar o antigo quarto em casa de Madame Marques, mas já não consegui recuperar a paz daquela pobreza.</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.renounce ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <div className="ledger-animation" aria-hidden="true"><span>O palacete do Loreto</span><i>Cento e seis mil contos</i><b>{currentVisited.length >= 3 ? "Ainda meus" : "Zero?"}</b></div>
            <div className="consequence">
              <SourceQuote pt="todos aqueles que a minha opulência humilhara cobriram-me de ofensas, como se alastra de lixo uma estátua derrubada de príncipe decaído." />
              <SourceQuote compact pt="Então, indignado, um dia subitamente reentrei com estrondo no meu palacete e no meu luxo." />
              {hasInspectedAll ? (
                <button className="primary-action" onClick={() => go("prison")}>Entrar no palacete <span>→</span></button>
              ) : (
                <p className="discovery-count">Vistos {currentVisited.length} / {currentHotspots.length}</p>
              )}
            </div>
          </div>
        )}

        {stage === "prison" && (
          <div className="scene-body loreto-restored-body">
            <SourceQuote
              pt="Logo, Lisboa, sem hesitar, se rojou aos meus pés. A Madame Marques chamou-me, chorando, «filho do seu coração». Os jornais deram-me os qualificativos que, de antiga tradição, pertencem à Divindade: fui o Omnipotente, fui o Omnisciente! A Aristocracia beijou-me os dedos como a um tirano: e o Clero incensou-me como a um ídolo."

            />
            <p>As janelas do Loreto voltaram a iluminar-se. Criados de libré negra circulavam de novo pelos salões. Lisboa inteira era minha outra vez, mas a sua reverência só me causava tédio.</p>
            <SourceQuote compact pt="Desde então uma saciedade enervante mantém-me semanas inteiras num sofá, mudo e soturno, pensando na felicidade do não-ser..." />
            <button className="primary-action" onClick={() => go("devilReturn")}>Sair para a noite <span>→</span></button>
          </div>
        )}

        {stage === "devilReturn" && (
          <div className="scene-body devil-street-body">
            <SourceQuote
              pt="Uma noite, recolhendo só por uma rua deserta, vi diante de mim o Personagem vestido de preto com o guarda-chuva debaixo do braço, o mesmo que no meu quarto feliz da Travessa da Conceição me fizera, a um ti-li-tim de campainha, herdar tantos milhões detestáveis."

            />
            <p>A luz do gás caía sobre o chapéu alto e o casaco preto. Ele parecia tão grave e sereno como da primeira vez, como se nunca me tivesse feito nada de terrível.</p>
            <button className="primary-action" onClick={() => go("supplication")}>Alcançá-lo <span>→</span></button>
          </div>
        )}

        {stage === "testament" && (
          <>
            <div className="scene-body testament-body">
              <p className="ending-label">Desfecho</p>
              <p>Voltei ao palacete do Loreto e sentei-me, angustiado, à secretária. O Diabo recusava desfazer o negócio, e o cadáver de Ti Chin-Fu não me abandonara.</p>
              <p>Ia definhando dia após dia. Sentindo que o fim se aproximava, escrevi a minha história e fiz testamento.</p>
              <div className="final-artifact-progress" aria-live="polite">
                <button type="button" className={finalArtifactsSeen.includes("testament") ? "is-read" : ""} onClick={openFinalTestament} aria-label="Ler o testamento">Testamento</button>
                <button type="button" className={finalArtifactsSeen.includes("book") ? "is-read" : ""} onClick={openFinalBook} aria-label="Abrir O Mandarim">O Mandarim</button>
              </div>
              {finalArtifactsRead && <p className="ending-transition-note">Fecha a última página.</p>}
            </div>

            <div className="ending-object-hotspots" aria-label="Objetos sobre a mesa">
              <button className={finalArtifactsSeen.includes("testament") ? "is-read testament-hotspot" : "testament-hotspot"} onClick={openFinalTestament} aria-label="Abrir">
                <i>01</i><span>Testamento</span>
              </button>
              <button className={finalArtifactsSeen.includes("book") ? "is-read final-book-hotspot" : "final-book-hotspot"} onClick={openFinalBook} aria-label="Examinar">
                <i>02</i><span>O Mandarim</span>
              </button>
            </div>

            {testamentOpen && (
              <div className="artifact-overlay" role="dialog" aria-modal="true" aria-label="Testamento de Teodoro">
                <article className="will-sheet">
                  <button className="artifact-close" onClick={closeFinalTestament}>Fechar</button>
                  <p className="will-kicker">Testamento</p>
                  <h2>Testamento de Teodoro</h2>
                  <p>Deixo os meus milhões ao Diabo. Esse dinheiro sempre lhe pertenceu.</p>
                </article>
              </div>
            )}

            {finalBookPhase > 0 && (
              <div className="artifact-overlay final-book-overlay" role="dialog" aria-modal="true" aria-label="O Mandarim">
                <div className="final-book-dialog">
                  {finalBookPhase === 1 ? (
                    <>
                      <div className="final-book-cover" aria-label="Capa de O Mandarim">
                        <small>Por Teodoro</small>
                        <span>O Mandarim</span>
                      </div>
                      <button className="final-book-action" onClick={turnFinalBookCover}>Abrir</button>
                    </>
                  ) : (
                    <>
                      <article className="final-book-page" aria-label="O livro aberto">
                        <section className="final-book-leaf">
                          <p lang="pt-PT"><em>Só sabe bem o pão que dia a dia ganham as nossas mãos: nunca mates o Mandarim!</em></p>
                        </section>

                      </article>
                      <button className="final-book-action" onClick={closeFinalBook}>Fechar</button>
                    </>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </section>

      {finaleStarted && (
        <FinalReaderAddress
          creditsOnly={stage === "refusalEnding"}
          onSilence={sound.fadeTrack}
          onRing={sound.handbell}
          onEndingMusic={() => sound.restartTrack(musicCues.mystery.src, 0.58)}
          onRestart={reset}
        />
      )}

      {bellSequence && (
        <div className={`bell-cinematic is-${bellSequence}`} aria-hidden="true">
          {ringing && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/bell-v1.webp")} alt="" />
            </>
          )}
        </div>
      )}

      {ghostIntensity > 0 && stage !== "supplication" && !finaleStarted && (
        <TiChinFu
          key={stage}
          intensity={ghostIntensity}
          revealed={ghostRevealed}
          onInspect={() => {
            setGhostRevealed(!ghostRevealed);
            sound.tone(98, 1.8, 0.12, 0, "sine");
          }}
        />
      )}

      {stage === "devilReturn" && (
        <figure className="devil-return-figure" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/devil-standing-v1.webp")} alt="" />
        </figure>
      )}

      {stage === "bell" && <DevilFigure />}

      {stage === "mission" && missionWaking && (
        <div
          className={`mission-awakening attempt-${missionWakeAttempt} phase-${missionWakePhase}`}
          role="dialog"
          aria-modal="true"
          aria-live="assertive"
          aria-label={`Ao som de matinas, Teodoro tenta abrir os olhos: tentativa ${missionWakeAttempt}`}
        >
          <div className="mission-awakening-scene" aria-hidden="true" />
          <div className="mission-awakening-darkness" aria-hidden="true" />
        </div>
      )}

      <footer className="game-footer">
        <span>{stage === "intro" ? "1880 / 2026" : info.subtitle ? `${info.act} · ${info.subtitle}` : info.act}</span>
        <span>{sound.enabled ? "Som ligado" : "Sem som"}</span>
      </footer>

      {infoOpen && (
        <div className="modal-backdrop">
          <section className="info-modal" role="dialog" aria-modal="true" aria-label="Sobre esta edição">
            <button className="modal-close" onClick={() => setInfoOpen(false)} aria-label="Fechar">×</button>
            <div className="scene-kicker">Sobre esta edição</div>
            {ABOUT_COPY.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p className="credits">{CREATOR_COPY}</p>
            <div className="music-credits">
              <span>Música</span>
              {MUSIC_CREDITS.map((credit) => (
                <a key={credit.title} href={credit.href} target="_blank" rel="noreferrer">{credit.title} · {credit.creator} · {credit.license}</a>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
