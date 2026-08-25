"use client";

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
  tartar: { title: "紫禁城", original: "", summary: "宫墙、权贵与金色屋顶" },
  chinese: { title: "老百姓的街巷", original: "", summary: "泥泞、尘土与拥挤的人群" },
};

const beijingDestinationKeys = ["tartar", "chinese"] as const;

const routes = [
  ["里斯本", "一个夜晚，我动身前往马赛，决意亲赴北京寻找狄鑫福的家族。"],
  ["马赛", "我包下整艘“锡兰号”邮船，从马赛向东方启航。"],
  ["上海", "“锡兰号”航行到上海，一路风平浪静，但我丝毫没有观光的兴致，心中只想着此行的目的。"],
  ["天津", "我从上海沿河乘罗素公司的小轮船抵达天津。"],
  ["通州", "又从天津换乘低矮的平底船，穿过白河两岸的稻田抵达通州，卡米洛夫派出的翻译萨托在此处迎接。"],
  ["北京", "我骑上卡米洛夫送来的满洲小马，在哥萨克人萨托的护送下穿过尘土飞扬的平原，赶往北京。"],
];

const routeTransports = [
  { id: "train", label: "火车", route: "里斯本 → 马赛" },
  { id: "mail-steamer", label: "“锡兰号”邮船", route: "马赛 → 上海" },
  { id: "river-steamer", label: "罗素公司小轮船", route: "上海 → 天津" },
  { id: "flatboat", label: "平底船", route: "天津 → 通州" },
  { id: "pony", label: "满洲小马", route: "通州 → 北京" },
] as const;

const returnPlaces = ["新加坡", "锡兰", "苏伊士", "马耳他", "直布罗陀", "里斯本"] as const;

const letterReasons = [
  { id: "distance", text: "我已经走过半个世界。", mark: "漫长的路已经足以证明诚意。" },
  { id: "tienho", text: "我险些死在天河村。", mark: "干涸的血迹停在这一行旁边。" },
  { id: "addresses", text: "两个地址都无法确认。", mark: "我们离真相是不是越来越远了？" },
  { id: "absence", text: "狄鑫福已经很久没有出现。", mark: "死者的沉默仿佛也是一种回答。" },
  { id: "donation", text: "我已经留下了足够的捐款。", mark: "真金白银最能说明诚意。" },
  { id: "uncertainty", text: "再寻找也未必能找到狄鑫福真正的家人。", mark: "停下无用功吧。" },
] as const;

type LetterReasonId = (typeof letterReasons)[number]["id"];

const stageInfo: Record<Stage, { act: string; title: string; subtitle: string }> = {
  intro: { act: "", title: "《满大人》", subtitle: "一声轻响" },
  office: { act: "第一幕 · 里斯本", title: "抄写员的白昼", subtitle: "王国内政部" },
  market: { act: "第一幕 · 里斯本", title: "寻宝", subtitle: "旧货市场" },
  room: { act: "第一幕 · 里斯本", title: "抄写员的夜晚", subtitle: "特奥多罗的房间" },
  book: { act: "第一幕 · 旧书", title: "发亮的字句", subtitle: "" },
  bell: { act: "第一幕 · 诱惑", title: "魔鬼的提议", subtitle: "桌上的铃" },
  tiDeath: { act: "第一幕 · 远方", title: "狄鑫福之死", subtitle: "遥远的中国" },
  refusalEnding: { act: "特别结局", title: "坚定的拒绝", subtitle: "" },
  inheritance: { act: "第二幕 · 财富", title: "陌生人的遗产", subtitle: "" },
  luxury: { act: "第三幕 · 黄金", title: "百万富翁", subtitle: "洛雷托宫殿" },
  ghost: { act: "第三幕 · 亡者", title: "宴席上的客人", subtitle: "狄鑫福" },
  map: { act: "第四幕 · 远行", title: "向东方去", subtitle: "从里斯本到北京" },
  beijing: { act: "第五幕 · 北京", title: "城门之前", subtitle: "东直门外" },
  repose: { act: "第五幕 · 北京", title: "轿中北京", subtitle: "宫墙与老百姓的街巷" },
  camilloffDeparture: { act: "第五幕 · 北京", title: "临行嘱托", subtitle: "卡米洛夫府邸前" },
  camilloffIntercut: { act: "第五幕 · 北京", title: "府邸内外", subtitle: "两地之间" },
  camilloffReturn: { act: "第五幕 · 北京", title: "与卡米洛夫的会谈", subtitle: "纸上的道路" },
  tienho: { act: "第六幕 · 远东", title: "天河村", subtitle: "客栈外的人群" },
  mission: { act: "第七幕 · 修道院", title: "修道院的清晨", subtitle: "晨祷钟声" },
  letter: { act: "第七幕 · 修道院", title: "卡米洛夫的信", subtitle: "特奥多罗的小房间" },
  return: { act: "第七幕 · 返航", title: "死者同行", subtitle: "从中国返回欧洲" },
  reckoning: { act: "第八幕 · 里斯本", title: "无法平息的亡灵", subtitle: "洛雷托宫殿" },
  renounce: { act: "第八幕 · 里斯本", title: "重返贫穷", subtitle: "特奥多罗的房间" },
  prison: { act: "第八幕 · 里斯本", title: "谄媚与奉承", subtitle: "洛雷托宫殿" },
  devilReturn: { act: "第八幕 · 夜路", title: "与魔鬼的重逢", subtitle: "小巷里" },
  supplication: { act: "第八幕 · 夜路", title: "乞求", subtitle: "" },
  testament: { act: "正篇结局", title: "弥留之际", subtitle: "洛雷托宫殿" },
};

const corpsePresenceStages: Stage[] = ["ghost", "map", "return", "reckoning", "renounce", "prison", "devilReturn", "supplication", "testament"];

const musicCues = {
  mystery: { src: "/audio/unsolved-investigation-v1.ogg", volume: 0.74 },
  ballroom: { src: "/audio/apparitions-ball.mp3", volume: 0.2 },
  haunting: { src: "/audio/i-swear-i-saw-it.ogg", volume: 0.23 },
  journey: { src: "/audio/the-journey-begins.ogg", volume: 0.22 },
  pursuit: { src: "/audio/pursuit.mp3", volume: 0.2 },
  reflection: { src: "/audio/unsolved-investigation-v1.ogg", volume: 0.74 },
  oriental: { src: "/audio/asianoriental1.ogg", volume: 0.3 },
  mansionIntercut: { src: "/audio/apparitions-ball.mp3", volume: 0.16 },
  mapMeeting: { src: "/audio/unsolved-investigation-v1.ogg", volume: 0.62 },
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

const refusalLines = [
  "你把良心称作原则，不过是因为今晚的价钱还没有说得足够具体。",
  "别急着自豪，我亲爱的先生。饥饿很会替哲学修改措辞。",
];

const officeDocuments = [
  {
    id: "lamp-oil",
    title: "关于走廊灯油定额之呈报",
    number: "第 174/B 号 · 行政庶务科",
    x: 9,
    y: 76,
    paragraphs: [
      "西翼三层本月多耗四分之一品脱灯油，查因阴雨提早点灯，并非保管疏失。自下月起，每盏灯的灯芯略短一分；旧灯芯仍须登记入库。",
      "本案不增加开支。《灯油领取簿》改用浅褐色封面，以别旧册。",
    ],
  },
  {
    id: "paper-margin",
    title: "公文纸左侧页边距统一办法",
    number: "第 208/C 号 · 文书格式委员会",
    x: 25,
    y: 79,
    paragraphs: [
      "委员会第六次讨论公文纸左侧留白。七人中，四人赞成一指半，两人赞成一指又四分之一，一人因墨水未干没有表态。",
      "决定仍用一指半。略窄者不必重抄，只在目录注明；月底另报直尺刻度是否清楚。",
    ],
  },
  {
    id: "umbrella-rack",
    title: "雨伞架编号复核清册",
    number: "第 39/A 号 · 财产保管处",
    x: 48,
    y: 62,
    paragraphs: [
      "正门雨伞架第四、十九、三十一号铜牌已经磨损。木工房须照一八七二年式样重刻；施工时以麻绳封住三孔，不得借用相邻号码。",
      "无主黑伞已存六十日。下月一日仍无人认领，便与断柄鸡毛掸一并移交旧物室。",
    ],
  },
] as const;

const officeDreams = [
  "在豪华饭店喝着香槟，被侍者环绕……",
  "维纳斯温柔的手向我伸来，把我揽入怀中……",
] as const;

const camilloffDepartureLines = [
  {
    speaker: "卡米洛夫",
    text: "我先去佟亲王府禀告来意，如果亲王准许调查，就去衙门和档案院打听情况，再找管旧籍的书吏问问。",
  },
  {
    speaker: "卡米洛夫",
    text: "事情恐怕很麻烦，我要证明这番查问既不是危害国家安全的阴谋，也无意冒犯神圣礼制。",
  },
  {
    speaker: "卡米洛夫",
    text: "弗拉基米拉，我亲爱的夫人，请替我好好招待客人。",
  },
  {
    speaker: "卡米洛夫",
    text: "特奥多罗，您在我府里安心等候。我会尽力查办，帮您找到狄鑫福的家人。",
  },
] as const;

const sceneHotspots: Partial<Record<Stage, HotspotItem[]>> = {
  market: [
    { id: "telescope", label: "旧望远镜", x: 13, y: 64, translation: "黄铜镜筒上沾着海盐般的白斑。" },
    { id: "porcelain", label: "瓷制圣母像", x: 21, y: 70, translation: "一尊巴掌大小的瓷制圣母像，蓝釉已从圣母的衣褶上剥落。" },
    { id: "reliquary", label: "鎏金圣物匣", x: 54, y: 64, translation: "鎏金匣门只剩下一扇，里面没有圣骨，只有略微潮湿的天鹅绒。" },
    { id: "watch", label: "停摆的怀表", x: 49, y: 82, translation: "指针停在四点十七分，表冠已经锈死。" },
    { id: "old-volume", label: "虫蛀的旧书", x: 35, y: 78, translation: "古老庄严的字体、虫蛀且泛黄的纸张、修道院式的厚重装帧，还有夹在书中的绿色丝带——都令我着迷。" },
  ],
  room: [
    { id: "lamp", label: "绿色灯罩", x: 7, y: 41, translation: "在灯罩的遮掩下，灯光显得更加昏黄。" },
    { id: "folio", label: "旧书", x: 21, y: 73, translation: "古老庄严的字体、被虫蛀的黄纸、修道院式的厚重装帧，还有夹在那一页的绿色丝带——都令我着迷！" },
    { id: "bell", label: "黄铜摇铃", x: 34, y: 53, translation: "铃安安静静地放在我面前的一本法语词典上。" },
    { id: "lottery", label: "彩票", x: 43, y: 68, translation: "自从购买彩票以来，我每晚都会向圣母祈祷中奖。" },
    { id: "madonna", label: "圣母像", x: 42, y: 45, translation: "这幅悲苦圣母石版画是母亲留给我的。" },
  ],
  luxury: [
    { id: "gold-bed", label: "金床", x: 63, y: 67, translation: "床沿铺满錾花金片，趣味夸张而野蛮。" },
    { id: "decanter", label: "酒与水晶", x: 78, y: 59, translation: "世上最好的勃艮第葡萄酒，例如一八五八年的罗曼尼·康帝和一八六一年的香贝丹。" },
    { id: "coins", label: "金币", x: 86, y: 72, translation: "有了这个，整个世界都拜倒在我的脚下。" },
  ],
  beijing: [
    { id: "litter", label: "红绸轿子", x: 84, y: 69, translation: "一乘华贵的轿子正在东直门外等我，猩红色的丝帘上满是金线刺绣。" },
  ],
  mission: [
    { id: "bandage", label: "绷带", x: 46, y: 64, translation: "两位遣使会神父正在清洗我受伤的耳朵。" },
    { id: "well", label: "井", x: 66, y: 49, translation: "井上的滑轮吱呀作响。晨祷的钟声响了起来。" },
    { id: "breviary", label: "《日课经》", x: 60, y: 82, translation: "我把一卷英格兰银行钞票放在《日课经》上，那书正翻到《贫穷福音》的某一页。" },
    { id: "found-child", label: "神父捡到的弃婴", x: 91, y: 82, translation: "洛里奥神父在路旁发现了这个奄奄一息的孩子。把他抱回修道院喂养。" },
  ],
  renounce: [
    { id: "window", label: "雨中的窗口", x: 86, y: 27, translation: "窗外的里斯本一如既往，我却再也回不到从前的平静。" },
    { id: "newspaper", label: "报纸", x: 82, y: 77, translation: "报纸把我的穷困当作一场应得的笑话。" },
    { id: "bell-remains", label: "仍在桌上的铃", x: 61, y: 68, translation: "这柄摇铃没有消失，它像一笔无法注销的旧账，留在桌上。" },
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
      const ratio = Math.min((now - started) / duration, 1);
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
      const ratio = Math.min((now - started) / duration, 1);
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
    const bell = churchBellPlayer.current ?? new Audio("/audio/church-bell-real-v1.mp3");
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
      churchBellPlayer.current = new Audio("/audio/church-bell-real-v1.mp3");
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
        <img src="/ti-chin-fu-corpse-v3.webp" alt="狄鑫福身穿黄绸、仰卧而死，冷臂抱着纸鸢" />
      </button>
      <button
        className={`corpse-toggle ${revealed ? "is-dismiss" : "is-question"}`}
        onClick={onInspect}
        aria-label={revealed ? "还是不看见为好" : "显出狄鑫福的尸体"}
        aria-pressed={revealed}
      >
        <span aria-hidden="true">{revealed ? "还是不看见为好" : "?"}</span>
      </button>
    </>
  );
}

function DevilFigure() {
  return (
    <figure className="devil-figure" aria-label="魔鬼：黑衣、高礼帽、黑手套，双手按在雨伞柄上">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/devil-seated-cutout-v2.webp" alt="身穿黑衣、戴高礼帽、双手戴黑手套并按着雨伞柄的魔鬼" />
    </figure>
  );
}

function BilingualQuote({ pt, zh, compact = false, className = "" }: { pt: string; zh: string; compact?: boolean; className?: string }) {
  return (
    <blockquote className={`source-inline bilingual-quote ${compact ? "compact" : ""} ${className}`}>
      <span lang="pt">“{pt}”</span>
      <span className="quote-translation">“{zh}”</span>
    </blockquote>
  );
}

function SourceSlip({ item }: { item: HotspotItem }) {
  return (
    <aside className="source-slip" aria-live="polite">
      <div><span>物件</span><b>{item.label}</b></div>
      <p>{item.translation}</p>
    </aside>
  );
}

function HotspotLayer({ items, visited, active, onSelect }: { items: HotspotItem[]; visited: string[]; active?: string; onSelect: (item: HotspotItem) => void }) {
  return (
    <div className="hotspot-layer" aria-label="场景中的可检查物件">
      {items.map((item, index) => (
        <button
          key={item.id}
          className={`scene-hotspot ${visited.includes(item.id) ? "is-visited" : ""} ${active === item.id ? "is-active" : ""}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          onClick={() => onSelect(item)}
          aria-label={`检查：${item.label}`}
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

  const reasonById = (reasonId: LetterReasonId | null) => letterReasons.find((reason) => reason.id === reasonId);
  const openRoomLetter = () => {
    setLetterPhase("envelope");
    onTone(196, 0.55, 0.045);
  };

  if (letterFolded) {
    return (
      <div className="letter-experience is-complete">
        <div className="folded-letter-result" aria-live="polite">
          <span>俄罗斯公使馆 · 北京</span>
          <strong>致卡米洛夫将军</strong>
          <small>特奥多罗</small>
          <em>已封缄</em>
        </div>
        <BilingualQuote compact pt="Bem, Ti Chin-Fu está contente." zh="好吧，狄鑫福已经满意了。" />
        <button className="primary-action letter-return-action" onClick={onReturn}>返回欧洲 <span>→</span></button>
      </div>
    );
  }

  return (
    <div className={`letter-experience phase-${letterPhase}`}>
      {letterPhase === "room" && (
        <>
          <button className="room-letter-direct-action" type="button" onClick={openRoomLetter}>
            桌上的来信 <span>→</span>
          </button>
          <button
            className="room-letter-hotspot"
            type="button"
            onClick={openRoomLetter}
            aria-label="拿起桌上的来信"
          >
            <span>桌上的来信</span><i aria-hidden="true" />
          </button>
        </>
      )}

      {letterPhase === "envelope" && (
        <button className="camilloff-envelope" type="button" onClick={() => { setLetterPhase("incoming"); onTone(208, 0.65, 0.05); }} aria-label="拆开卡米洛夫的来信">
          <span>俄罗斯公使馆 · 北京</span>
          <b>致特奥多罗先生</b>
          <i>卡米洛夫</i>
          <em>拆信</em>
        </button>
      )}

      {letterPhase === "incoming" && (
        <article className={`camilloff-letter unfold-${unfoldStep}`} aria-label="卡米洛夫的信">
          <div className="camilloff-letter-panels">
            <section className="letter-fact-panel fact-error">
              <p lang="pt">Enquanto à viúva e família de Ti Chin-Fu, houve um engano...</p>
              <p>关于狄鑫福的遗孀和家人，事情弄错了……</p>
            </section>
            <section className="letter-fact-panel fact-cantao" aria-hidden={unfoldStep < 2}>
              <p lang="pt">É no Sul da China, na província de Cantão.</p>
              <p>他们住在中国南方的广东省。</p>
            </section>
            <section className="letter-fact-panel fact-kaoli" aria-hidden={unfoldStep < 3}>
              <p lang="pt">Mas também há uma família Ti Chin-Fu para além da Grande Muralha...</p>
              <p>但长城之外也有一个狄鑫福家族……</p>
            </section>
          </div>
          <button className="letter-unfold-control" type="button" onClick={advanceUnfold}>
            {unfoldStep < 3 ? "继续读信" : "合上信"} <span>→</span>
          </button>
        </article>
      )}

      {letterPhase === "incomingClosed" && (
        <div className="incoming-letter-closed" aria-live="polite">
          <div className="closed-letter-paper" aria-label="已经合上的卡米洛夫来信">
            <span>卡米洛夫的来信</span><i>已读</i>
          </div>
          <button className="primary-action write-reply-action" type="button" onClick={() => { setLetterPhase("reply"); onTone(196, 0.7, 0.05); }}>
            写回信 <span>→</span>
          </button>
        </div>
      )}

      {letterPhase === "reply" && (
        <section className="reply-composer" aria-label="撰写回信">
          <div className="reply-guidance">
            <p>狄鑫福和他的纸鸢始终没有再出现。死者的沉默，渐渐变成了允许我离开的理由。</p>
            <strong>从中选取三个念头，写进信里</strong>
          </div>
          <div className="reason-margin" aria-label="特奥多罗心中浮现的六个念头">
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
          <article className="reply-letter" aria-label="特奥多罗写给卡米洛夫的回信">
            <div className="reason-folds" aria-label="回信的三道折面">
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
                    aria-label={reason ? `移除理由：${reason.text}` : `第 ${index + 1} 道空白折面`}
                  >
                    <b>{["第一段", "第二段", "第三段"][index]}</b>
                    {reason ? <span>{reason.text}</span> : <em>把念头写在这里</em>}
                  </button>
                );
              })}
            </div>
            {reasoningComplete && (
              <div className="letter-conclusion" aria-live="polite" aria-label="所以，我已经尽力了。">
                <div className="ink-lines" aria-hidden="true"><i /><i /><i /></div>
                <span>所以，</span><strong>我已经尽力了。</strong>
                <p>另请您把我存放在清佛商人处的那笔钱寄给狄鑫福的遗孀。清佛商号在茶瓜大道，佟牌楼旁、观音庙附近。</p>
              </div>
            )}
          </article>
        </section>
      )}

      {reasoningComplete && (
        <button className="seal-letter-action" type="button" onClick={sealReply}>
          装入信封 <span>→</span>
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
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
  const backgrounds: Record<Stage, string> = {
    intro: "/intro-cover-v1.webp",
    office: "/ministry-office-awake-v1.webp",
    market: "/feira-da-ladra-v1.webp",
    room: "/lisbon-room-v3.webp",
    book: "/lisbon-room-v3.webp",
    bell: "/lisbon-room-v3.webp",
    tiDeath: "/ti-chin-fu-death-garden-v1.webp",
    refusalEnding: "/lisbon-room-v3.webp",
    inheritance: "/inheritance-messenger-v1.webp",
    luxury: "/palace-ghost.webp",
    ghost: "/palace-ghost.webp",
    map: "/east-journey.webp",
    beijing: "/pequim-arrival-v1.webp",
    repose: "/pequim-litter-interior-v1.webp",
    camilloffDeparture: "/camilloff-departure-v1.webp",
    camilloffIntercut: "/camilloff-day1-mansion.webp",
    camilloffReturn: "/camilloff-return-map-v1.webp",
    tienho: "/tienho-reality-v1.webp",
    mission: "/mission-cloister-v7.webp",
    letter: "/mission-room-v1.webp",
    return: "/lisbon-room-v3.webp",
    reckoning: "/palace-ghost.webp",
    renounce: "/renounce-room-v1.webp",
    prison: "/loreto-restored-v1.webp",
    devilReturn: "/supplication-street-v1.webp",
    supplication: "/devil-alone-street-v2.webp",
    testament: "/testament-study-v2.webp",
  };
  const beijingStreetBackgrounds: Record<Exclude<BeijingDestination, "">, string> = {
    tartar: "/pequim-tartar-city-v1.webp",
    chinese: "/pequim-chinese-quarter-v1.webp",
  };
  const background = backgrounds[stage];
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

  const go = (next: Stage) => {
    resetRevisitableStage(next);
    setTransitioning(true);
    setStageHistory((history) => [...history, stage]);
    window.setTimeout(() => {
      setStage(next);
      setSelectedHotspot(null);
      setGhostRevealed(true);
      setTransitioning(false);
    }, 280);
  };

  const goBack = () => {
    const previous = stageHistory.at(-1);
    if (!previous) return;
    resetRevisitableStage(previous);
    setTransitioning(true);
    setStageHistory((history) => history.slice(0, -1));
    window.setTimeout(() => {
      setStage(previous);
      setSelectedHotspot(null);
      setGhostRevealed(true);
      setTransitioning(false);
    }, 280);
  };

  const beginMissionAwakening = () => {
    missionWakeTimers.current.forEach((timer) => window.clearTimeout(timer));
    missionWakeTimers.current = [];
    go("mission");
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
    const order: Stage[] = ["intro", "office", "market", "room", "book", "bell", "tiDeath", "inheritance", "luxury", "ghost", "map", "beijing", "repose", "camilloffDeparture", "camilloffIntercut", "camilloffReturn", "tienho", "mission", "letter", "return", "reckoning", "renounce", "prison", "devilReturn", "supplication", "testament"];
    const value = order.indexOf(stage);
    return Math.max(2, ((value < 0 ? 2 : value + 1) / order.length) * 100);
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
    if (stage === "tienho") {
      sound.fadeTrack(500);
      return;
    }
    const cue = stageMusic[stage];
    if (stage === "testament") sound.restartTrack(cue.src, cue.volume);
    else sound.playTrack(cue.src, cue.volume);
    // Track transitions follow narrative stages; the sound controller persists between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (activeOfficeDocument === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveOfficeDocument(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeOfficeDocument]);

  useEffect(() => {
    if (stage !== "tiDeath") return;
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
  }, [stage, deathAnimationRun]);

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
    if (preview === "ti-death") {
      // The preview route intentionally selects its isolated demonstration scene on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage("tiDeath");
      setStageHistory([]);
    }
    if (preview === "office") {
      setStage("office");
      setStageHistory([]);
    }
    if (preview === "bell") {
      setStage("bell");
      setStageHistory([]);
    }
    if (preview === "journey") {
      setStage("map");
      setStageHistory([]);
    }
    if (preview === "camilloff-departure") {
      // This preview target supports isolated visual and interaction QA for the new transition scene.
      setStage("camilloffDeparture");
      setStageHistory([]);
    }
    if (preview === "camilloff-return") {
      setStage("camilloffReturn");
      setStageHistory([]);
    }
    if (preview === "camilloff-sequence") {
      setStage("camilloffDeparture");
      setStageHistory([]);
    }
    if (preview === "camilloff-intercut") {
      setStage("camilloffIntercut");
      setStageHistory([]);
    }
    if (preview === "devil-return") {
      setStage("devilReturn");
      setStageHistory([]);
    }
    if (preview === "night-road") {
      setStage("prison");
      setStageHistory([]);
    }
    if (preview === "supplication") {
      setStage("supplication");
      setStageHistory([]);
    }
    if (preview === "tienho") {
      setStage("tienho");
      setStageHistory([]);
    }
    if (preview === "mission-awakening") {
      setStage("tienho");
      setStageHistory([]);
    }
    if (preview === "mission") {
      setStage("mission");
      setStageHistory([]);
    }
    if (preview === "letter-excuses") {
      setStage("letter");
      setStageHistory([]);
    }
    if (preview === "testament") {
      setStage("testament");
      setStageHistory([]);
    }
  }, []);

  return (
    <main className={`game-shell stage-${stage} ${stage === "camilloffDeparture" ? `departure-${camilloffDeparturePhase}` : ""} ${currentHotspots.length > 0 ? "has-hotspots" : ""} ${showBeijingCurtain ? "has-beijing-curtain" : ""} ${transitioning ? "is-transitioning" : ""} ${ringing ? "is-ringing-bell" : ""} ${finaleStarted ? "is-final-reader-address" : ""}`}>
      <div className="orientation-gate" role="status" aria-live="polite">
        <span className="orientation-phone" aria-hidden="true">▯</span>
        <strong>请将手机横过来</strong>
        <p>《满大人》的场景与物件交互需要横屏显示。</p>
      </div>
      <div className="scene-image" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      {stage === "office" && <div className={`office-doze-image ${officeDozing ? "is-visible" : ""}`} aria-hidden="true" />}
      <div className="scene-vignette" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />
      {stage === "camilloffDeparture" && <div className="departure-motion-layer" aria-hidden="true"><span>车轮声渐远</span></div>}

      <header className="topbar">
        <div className="navigation-actions">
          <button className="wordmark" onClick={reset} aria-label="回到游戏封面">《满大人》<span>· 交互叙事</span></button>
          {stageHistory.length > 0 && !ringing && camilloffDeparturePhase !== "leaving" && <button className="back-button" onClick={goBack}>← 返回上一页</button>}
        </div>
        <div className="top-actions">
          <button className={`sound-button ${sound.enabled ? "is-on" : ""}`} onClick={sound.toggle} aria-label={sound.enabled ? "关闭音乐和音效" : "打开音乐和音效"} title={sound.enabled ? "关闭音乐和音效" : "打开音乐和音效"}>
            <span aria-hidden="true">{sound.enabled ? "♪" : "♪̸"}</span><b>{sound.enabled ? "声音：开" : "开启声音"}</b>
          </button>
          <button className="icon-button" onClick={() => setInfoOpen(true)} aria-label="作品说明" title="作品说明">i</button>
        </div>
      </header>

      {stage !== "intro" && (
        <div className="progress-track" aria-label={`故事进度 ${Math.round(progress)}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      {currentHotspots.length > 0 && !(stage === "mission" && missionWaking) && (
        <HotspotLayer items={currentHotspots} visited={currentVisited} active={selectedHotspot?.id} onSelect={inspectHotspot} />
      )}

      {stage === "office" && (
        <div className="office-document-hotspots" aria-label="桌上的公文">
          {officeDocuments.map((document, index) => (
            <button
              key={document.id}
              className={officeDocumentsRead.includes(document.id) ? "is-read" : ""}
              style={{ left: `${document.x}%`, top: `${document.y}%` }}
              type="button"
              onClick={() => inspectOfficeDocument(index)}
              aria-label={`展开公文：${document.title}`}
            >
              <span>{officeDocumentsRead.includes(document.id) ? "✓" : ["Ⅰ", "Ⅱ", "Ⅲ"][index]}</span>
            </button>
          ))}
        </div>
      )}

      {stage === "office" && officeDozing && (
        <div className="office-dream-layer" aria-label="特奥多罗的白日梦">
          {officeDreams.map((dream, index) => !officeDreamsPopped.includes(index) && (
            <button key={dream} className={`office-dream-bubble ${officeDreamsBursting.includes(index) ? "is-bursting" : ""}`} type="button" onClick={() => popOfficeDream(index)} aria-label={`白日梦 ${index + 1}`}>
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
            <button className="office-document-close" type="button" onClick={() => setActiveOfficeDocument(null)} aria-label="合上公文">×</button>
            <span>葡萄牙王国内政部</span>
            <h2 id="office-document-title">{openOfficeDocument.title}</h2>
            <small>{openOfficeDocument.number}</small>
            {openOfficeDocument.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <footer>谨呈部长阁下核阅<br /><b>里斯本中央书记处</b></footer>
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
              <BilingualQuote pt="A habitação de Camilloff ficava na Cidade Tártara, nos bairros militares e nobres. Há aqui uma tranquilidade austera." zh="卡米洛夫的府邸位于紫禁城的军人和贵族街区，有种庄重而安宁的氛围。" />
              <p>金钉高轮马车和官轿从宽阔的街道上掠过，富丽堂皇的店铺中陈列着明代瓷器、铜器、珐琅彩、象牙和丝绸。在紫禁城的高墙之后，帝宫明黄色的屋顶在树海间发亮，贵族弓手、佩戴孔雀翎的官员和飘在高空的巨大纸鸢共同维护着一个不可接近的世界。</p>
              <BilingualQuote compact pt="Aqui está o vasto palácio imperial, entre arvoredos misteriosos, com os seus telhados de um amarelo de ouro vivo!" zh="那就是辽阔的帝宫，掩映在神秘的树木之间，屋顶闪着鲜明的金黄色！" />
            </>
          ) : beijingDestination === "chinese" ? (
            <>
              <BilingualQuote pt="E lá fomos penetrando na Cidade Chinesa, pela porta monstruosa de Tchin-Men. Aqui habita a burguesia, o mercador, a populaça." zh="我们从巨大的前门进入老百姓的街坊，商人和平民都住在这里。" />
              <p>石板铺就的路面污秽而泥泞，饥饿的野狗在空地上哀叫，污水散发着刺鼻的气味，尘土让空气里昏黄一片。骆驼商队缓慢地挤过破旧的棚屋，经过一群群苦役和乞丐。越靠近天坛，贫困越像是一堵没有尽头的墙。</p>
              <BilingualQuote compact pt="Uma multidão rumorosa e espessa, onde domina o tom pardo e azulado dos trajes, circula sem cessar; a poeira envolve tudo de uma névoa amarelada; um fedor acre exala-se dos enxurros negros […]" zh="人群川流不息，大多穿着土黄色或蓝色的衣服，喧闹而拥挤……灰尘把一切都笼罩在一层黄雾中，黑色的污水沟散发出刺鼻的恶臭。" />
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
            <p className="lede">一柄摇铃，一条从里斯本通往北京的航线，<br />以及一笔永远无法还清的债。</p>
            <button className="primary-action bell-action" onClick={() => { sound.enable(); go("office"); }}>
              <span>进入故事世界</span>
            </button>
            <p className="edition-note">根据埃萨·德·凯罗斯的小说改编</p>
          </div>
        )}

        {stage === "office" && (
          <div className="scene-body office-scene">
            <BilingualQuote pt="A minha existência era bem equilibrada e suave. Toda a semana, de mangas de lustrina à carteira da minha repartição, ia lançando, numa formosa letra cursiva, sobre o papel «Tojal» do Estado, estas frases fáceis: […]" zh="我的生活平稳而安宁。每周，我都戴着黑亮的护袖伏在部门书桌前，用漂亮的花体字在公文纸上写下熟套的句子……" />
            <p>我只须毕恭毕敬、一笔一划地誊抄，便可安稳地领到每月两万雷斯的薪俸。</p>
            <div className="office-mobile-documents" aria-label="桌上的三份公文">
              {officeDocuments.map((document, index) => (
                <button key={document.id} className={officeDocumentsRead.includes(document.id) ? "is-read" : ""} type="button" onClick={() => inspectOfficeDocument(index)}>
                  <span>{officeDocumentsRead.includes(document.id) ? "✓" : ["Ⅰ", "Ⅱ", "Ⅲ"][index]}</span>{document.title}
                </button>
              ))}
            </div>
            <div className="office-actions">
              <div className="office-document-progress"><span>桌上的公文</span><b>{officeDocumentsRead.length} / {officeDocuments.length}</b><small>{officeDocumentsRead.length === officeDocuments.length ? "三份公文均已抄写完毕" : "点击纸页"}</small></div>
              <button className={`object-action ${officeDozed ? "is-read" : ""}`} onClick={toggleOfficeDoze}><span>{officeDozing ? "醒来" : "打瞌睡"}</span></button>
            </div>
            {officeComplete ? (
              <button className="primary-action" onClick={() => go("market")}>下班 <span>→</span></button>
            ) : null}
          </div>
        )}

        {stage === "market" && (
          <div className="scene-body market-scene">
            <BilingualQuote pt="Tinha tomado o hábito discreto de comprar na Feira da Ladra antigos volumes desirmanados, e à noite, no meu quarto, repastava-me dessas leituras curiosas." zh="我有这么一个不为人知的习惯：我会去旧货市场淘些孤本旧书，晚上回到房间后，拿它们当作精神食粮。" />
            <p>旧货市场的摊位沿着斜坡铺开。旧望远镜、失去圣骨的匣子、剥釉的圣像与停摆的怀表挤在一起。书摊上那些稀奇古怪的旧书，总比一顿晚餐更容易落入我的预算。</p>
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
                <BilingualQuote compact pt="O tipo venerando, o papel amarelado com picadas de traça, a grave encadernação freirática, a fitinha verde marcando a página — encantavam-me!" zh="古老庄严的字体、虫蛀且泛黄的纸张、修道院式的厚重装帧，还有夹在书中的绿色丝带——都令我着迷！" />
                <p>我数出几个铜币，然后把那本旧书夹在腋下，带回了孔塞桑巷一百零六号。</p>
                <button className="primary-action" onClick={() => go("room")}>回家 <span>→</span></button>
              </>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "room" && (
          <div className="scene-body room-scene-copy">
            <p>刚从旧货市场带回的书摊在桌上，正翻至绿色缎带所在的那一页。</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.room ?? []).map((item) => (
                <button key={item.id} className={roomFinds.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{roomFinds.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length} </p>
            <button className="primary-action room-book-action" onClick={() => go("book")}>仔细翻阅旧书 <span>→</span></button>
          </div>
        )}

        {stage === "book" && (
          <div className="scene-body book-scene">
            <article className="book-leaf featured-book-page">
              <span>《灵魂的裂缝》</span>
              <blockquote lang="pt">«No fundo da China existe um mandarim mais rico que todos os reis de que a fábula ou a história contam. Dele nada conheces, nem o nome, nem o semblante, nem a seda de que se veste. Para que tu herdes os seus cabedais infindáveis, basta que toques essa campainha, posta a teu lado, sobre um livro. Ele soltará apenas um suspiro, nesses confins da Mongólia. Será então um cadáver: e tu verás a teus pés mais ouro do que pode sonhar a ambição de um avaro. Tu, que me lês e és um homem mortal, tocarás tu a campainha?»</blockquote>
              <p>“在中国内陆有一位满大人，他比传说又或者历史中的所有国王都要富有。你对他一无所知：不知道他姓甚名何，长得什么模样，身上穿的又是怎样的绸缎。不过，你只须摇响放在你身旁书上的那只摇铃，便能继承他数不胜数的财产。他只会在遥远的蒙古边境发出一声叹息，然后就一命呜呼，而你的脚下会堆满黄金，多得连守财奴都不敢想象。读到这段文字的你，作为凡人的你——会摇响铃吗？”</p>
            </article>
            <button className="primary-action" onClick={() => { sound.tone(164.81, 0.8, 0.08, 0, "triangle"); go("bell"); }}>桌旁传来声音 <span>→</span></button>
          </div>
        )}

        {stage === "bell" && (
          <div className="scene-body bell-scene">
            <div className="devil-dialogue-card">
              <span>魔鬼</span>
              <blockquote className="source-inline bilingual-quote compact">
                <span lang="pt">“Vamos, Teodoro, meu amigo, estenda a mão, toque a campainha, seja um forte!”</span>
                <span className="quote-translation devil-final-line">“来吧，特奥多罗，我的朋友，伸手，摇铃，勇敢一些！”</span>
              </blockquote>
            </div>
            {refusals > 0 && refusals < 3 && !bellRung && (
              <div className="devil-reply">
                <span>魔鬼</span>
                <p>“{refusalLines[refusals - 1]}”</p>
              </div>
            )}
            {bellRung && !ringing ? (
              <div className="consequence locked-choice">
                <p>摇铃发出的金属余音不绝于耳，远方的那声叹息再也无法被撤回。</p>
                <button className="primary-action" onClick={() => go("tiDeath")}>铃声抵达远方 <span>→</span></button>
              </div>
            ) : (
              <div className="bell-choice">
                <button className={`bell-object ${ringing ? "is-ringing" : ""}`} onClick={ringBell} disabled={ringing} aria-label="摇铃">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/bell-v1.webp" alt="一柄精致的十九世纪欧洲黄铜手摇铃" />
                </button>
                <div className="choice-stack">
                  <button className="choice-button dangerous" onClick={ringBell} disabled={ringing}><span>摇铃</span></button>
                  <button className="choice-button" onClick={refuse} disabled={ringing}><span>拒绝</span></button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === "tiDeath" && (
          <div className="ti-death-scene" key={deathAnimationRun}>
            <div className="death-mist death-mist-back" aria-hidden="true" />
            <div className="death-character-stage" aria-label="狄鑫福在花园溪流旁的草岸上听见铃声后倒地身亡的剪纸动画">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ti-alive-cutout" src="/ti-chin-fu-alive-v3.webp" alt="肥胖、白胡子的狄鑫福身穿黄绸，怀抱纸鸢，站在溪流旁的草岸上" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ti-corpse-cutout" src="/ti-chin-fu-corpse-v3.webp" alt="狄鑫福仰面倒在溪边草地上，冰冷的双臂仍抱着纸鸢" />
              <div className="death-ground-shadow" aria-hidden="true" />
            </div>
            <div className="death-mist death-mist-front" aria-hidden="true" />
            <aside className={`death-caption ${deathAnimationDone ? "is-visible" : ""}`}>
              <blockquote lang="pt">“Agora jaz à beira de um arroio cantante, todo vestido de seda amarela, morto, de pança ao ar, sobre a relva verde; e nos braços frios tem o seu papagaio de papel, que parece tão morto como ele.”</blockquote>
              <p>“现在他身穿黄绸，死在潺潺溪水旁的绿草地上，仰面朝天，冰冷的双臂仍抱着他的纸鸢，而那纸鸢看起来也和他一样毫无生气。”</p>
              <div className="death-actions">
                <button onClick={replayTiDeath}>再看一次</button>
                <button className="primary-action" onClick={() => go("inheritance")}>一个月之后 <span>→</span></button>
              </div>
            </aside>
          </div>
        )}

        {stage === "refusalEnding" && (
          <div className="scene-body ending-body refusal-body">
            <div className="ending-mark">I</div>
            <blockquote className="ending-quote">“好极了，我亲爱的朋友。你保住了良心——也保住了贫困。但这只是今天，但愿你未来不会后悔。”</blockquote>
            <p className="original-note">魔鬼消失了。今晚，他的蛊惑没有对你奏效。<br />（以上为游戏原创台词，并非埃萨原文。）</p>
            <button className="primary-action" onClick={() => setFinaleStarted(true)}>合上旧书 <span>→</span></button>
          </div>
        )}

        {stage === "inheritance" && (
          <div className="scene-body inheritance-scene">
            {!inheritanceOpened ? (
              <>
                <BilingualQuote compact pt="Decorreu um mês." zh="一个月过去了。" />
                <p>八月的一个星期日早晨，我正穿着衬衫躺在床上打盹，熄灭的香烟还粘在唇边。这时门轻轻地响了，我迷迷糊糊地半睁开眼睛，看见一个秃顶的老先生在我的床前俯下身。</p>
                <div className="messenger-dialogue">
                  <span>西尔维斯特</span>
                  <BilingualQuote compact pt="O Sr. Teodoro?... O Sr. Teodoro do Ministério do Reino?" zh="您就是特奥多罗先生？……王国内政部的特奥多罗先生？" />
                  <p>他矮胖身型，白色的络腮胡摩擦着黑色呢外套的翻领，金丝眼镜在圆脸上微微发颤；双手捧着一只鼓胀的信封，上面打着黑蜡的封印。</p>
                </div>
                <div className="sealed-letter">
                  <button type="button" aria-label="拆开黑蜡封缄的信" onClick={() => { setInheritanceOpened(true); sound.tone(329.63, 0.9, 0.08); }}>
                    <span className="wax-seal" aria-hidden="true" />
                    <span className="sealed-letter-open">拆开</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <BilingualQuote pt="São cento e seis mil contos, senhor! […] da herança depositada do mandarim Ti Chin-Fu!" zh="一共十万六千孔托，先生！……是满大人狄鑫福留下的遗产！" />
                <p>西尔维斯特商号与澳门、香港的商行有往来，消息由南安普敦邮船送到。一个月前还是穷抄写员的我，如今成了这位陌生死者的唯一继承人。</p>
                <div className="money-number">106000 <small>孔托</small></div>
                <BilingualQuote compact pt="— Pobre Ti Chin-Fu!... — Morreu? — Estava no seu jardim, sossegado, armando, para o lançar ao ar, um papagaio de papel […]" zh="——可怜的狄鑫福！…… ——他死了？ ——他死前正安安静静地待在自己的花园里，扎着一只准备放飞的纸鸢……" />
                <p>此时，陌生的死者终于有了名字。</p>
                <button className="primary-action" onClick={() => go("luxury")}>搬入洛雷托宫殿 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "luxury" && (
          <div className="scene-body">
            <BilingualQuote pt="Então começou a minha vida de milionário." zh="于是，我的百万富翁生活开始了。" />
            <p>人世间的享乐我应有尽有，可那时不时便向我显现的不详身影使一切都变得索然无味。</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.luxury ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => { sound.tone(110, 2.4, 0.08); go("ghost"); }}>我无法忽视…… <span>→</span></button>
            ) : <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>}
          </div>
        )}

        {stage === "ghost" && (
          <div className="scene-body ghost-scene">
            <BilingualQuote pt="ou estirada no limiar da porta, ou atravessada sobre o leito de ouro — lá jazia a figura bojuda, de rabicho negro e túnica amarela, com o seu papagaio nos braços... Era o mandarim Ti Chin-Fu!" zh="那个身影不是躺在门槛上，就是歪倒在金床上——肥胖的身躯穿着黄袍，拖着一条黑辫子，怀里还抱着他的纸鸢……正是满大人狄鑫福！" />
            {avoidance ? (
              <div className="consequence">
                <p>{avoidance === "pleasure" ? "我试着用音乐、酒宴和彻夜的狂欢淹没愧疚，但宾客散去后，狄鑫福的尸体仍横陈在我的门口。" : avoidance === "church" ? "我出钱请神父做弥撒、修建教堂，但祷告并不能让狄鑫福离开。" : "我四处旅行，但无论我走到哪里，尸影都跟随着我。"}</p>
                <BilingualQuote compact pt="Partiria para Pequim; descobriria a família de Ti Chin-Fu..." zh="我要去北京，找到狄鑫福的家人……" />
                <button className="primary-action" onClick={() => go("map")}>前往中国 <span>→</span></button>
              </div>
            ) : (
              <>
                <BilingualQuote compact pt="Tinha eliminado a criatura, de longe, com uma campainha. […] eu assassinara um velho!" zh="我在远方摇响了一柄铃，这就杀了人（……）我谋杀了一个老人！" />
                <div className="choice-stack horizontal">
                  <button className="choice-button" onClick={() => chooseAvoidance("pleasure")}><span>沉湎享乐</span></button>
                  <button className="choice-button" onClick={() => chooseAvoidance("church")}><span>求助教会</span></button>
                  <button className="choice-button" onClick={() => chooseAvoidance("travel")}><span>远行排遣</span></button>
                </div>
              </>
            )}
          </div>
        )}

        {stage === "map" && (
          <div className="scene-body map-scene">
            <BilingualQuote pt="Anelei, suspirei por pisar a terra da China! […] pus a proa ao Oriente." zh="我无比渴望踏上中国的土地！（……）我将船头对准了东方。" />
            <p>一个夜晚，我动身前往马赛，在那里花重金包下“锡兰号”邮船，船头直指东方。</p>
            <div className="route" role="img" aria-label={`旅程进度：${routes[routeIndex][0]}；${routeTransports[Math.min(routeIndex, routeTransports.length - 1)].label}`}>
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
              <button className="primary-action" onClick={() => { setRouteIndex(routeIndex + 1); sound.tone(146.83 + routeIndex * 9, 1, 0.05); }}>继续旅程 <span>→</span></button>
            ) : (
              <button className="primary-action" onClick={() => go("beijing")}>进入北京 <span>→</span></button>
            )}
          </div>
        )}

        {stage === "beijing" && (
          <div className="scene-body beijing-arrival-scene">
            <BilingualQuote pt="Pequim está diante de mim! É uma vasta muralha, monumental e bárbara, de um negro baço, estendendo-se a perder de vista […]" zh="北京就在我眼前！那是一道辽阔、雄伟而粗犷的城墙，暗沉发黑，一直伸向视线尽头……" />
            <p>城门层叠的飞檐衬在血色紫红的落日上；北面，蒙古群山像悬在淡紫烟霭中。黑墙脚下挤着一片异国集市，摇曳的灯笼把暮色割成血红斑块，白色棚布像停在墙边的一群蝴蝶。</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.beijing ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {!hasInspectedAll ? (
              <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
            ) : (
              <>
                <BilingualQuote compact pt="Uma rica liteira esperava-me à Porta de Tung Tsen-Men, para eu atravessar Pequim até à residência militar de Camilloff." zh="一乘华贵的轿子正在东直门外等我，要载我穿过北京，前往卡米洛夫将军的府邸。" />
                <button className="primary-action" onClick={() => go("repose")}>坐进轿子，穿过东直门 <span>→</span></button>
              </>
            )}
          </div>
        )}

        {stage === "repose" && (
          <div className="scene-body beijing-tour-scene">
            {!beijingDestination && (
              <>
                <BilingualQuote pt="Senti-me triste; subi à liteira, cerrei as cortinas de seda escarlate todas bordadas a ouro; e cercado dos cossacos, eis-me entrando a velha Pequim..." zh="我感到一阵悲凉，于是坐进轿子，拉上绣满金线的红丝帘，在哥萨克骑兵的护送下进入了古老的北京城……" />
                <p>车轮、轿杠、马蹄和骆驼的声音在帘外徐徐而过。每到一处，我都可以命轿夫停下，拉开轿帘看看北京城的热闹奢华，又或者是穷困凄惨。</p>
                <div className="beijing-destination-grid">
                  {beijingDestinationKeys.map((key) => {
                    const destination = beijingDestinations[key];
                    return (
                    <button key={key} className={beijingVisited.includes(key) ? "is-visited" : ""} onClick={() => chooseBeijingDestination(key)}>
                      <span>{beijingVisited.includes(key) ? "再去" : "前往"}</span>
                      <strong>{destination.title}</strong>
                      {destination.original && <em>{destination.original}</em>}
                      <small>{destination.summary}</small>
                    </button>
                    );
                  })}
                </div>
                {allBeijingStopsVisited && <button className="primary-action" onClick={() => go("camilloffDeparture")}>前往卡米洛夫府邸 <span>→</span></button>}
              </>
            )}
          </div>
        )}

        {stage === "camilloffDeparture" && (
          <div className={`scene-body camilloff-departure ${camilloffDeparturePhase}`}>
            {camilloffDeparturePhase === "confession" ? (
              <div className="departure-confession">
                <div className="departure-time-label">卡米洛夫府邸</div>
                <BilingualQuote compact pt="— O meu prezado hóspede sabe o chinês? — perguntou-me de repente, fixando em mim a pupila sagaz. — Sei duas palavras importantes, General: «mandarim» e «chá»." zh="——“尊贵的客人，您会说中文吗？”卡米洛夫用他那聪慧的双眼盯着我，突然问道。——“将军，我会说两个重要的词：‘满大人’和‘茶’。”" />
                <p>回到卡米洛夫府邸，我把那柄摇铃、狄鑫福的死与此行的目的告诉了他。卡米洛夫没有多说，只问这笔补偿应当交到谁的手中。</p>
                <div className="departure-proposal">
                  <div className="speaker">卡米洛夫</div>
                  <BilingualQuote compact pt="Faça uma coisa. Procure a família de Ti Chin-Fu..." zh="请帮我做一件事，帮我寻找狄鑫福的家人……" />
                  <p>只有找到死者的家人，补偿才可能真正抵达被夺去财富的人。卡米洛夫答应亲自去佟亲王的衙门查问。</p>
                </div>
                <button className="primary-action" onClick={() => setCamilloffDeparturePhase("briefing")}>听他安排查访 <span>→</span></button>
              </div>
            ) : camilloffDeparturePhase === "gone" ? (
              <div className="departure-afterglow">
                <p className="departure-soundline">门扉合拢，马蹄与车轮声沿着石路渐渐远去。</p>
                <p>卡米洛夫将军正在府外四处奔走，帮我寻找狄鑫福的家人，而我留在府内，享受将军夫人的热情款待。</p>
                <button className="primary-action" onClick={() => go("camilloffIntercut")}>留在府邸等待消息 <span>→</span></button>
              </div>
            ) : (
              <>
                <BilingualQuote compact pt="Quando o general saiu com a sua escolta cossaca para o yamen do príncipe Tong, a informar-se da residência da família Ti Chin-Fu — […]" zh="将军带着哥萨克卫队前往佟亲王的衙门，打听狄鑫福一家的住处……" />
                <div className="departure-dialogue" aria-live="polite">
                  <div className="speaker">{camilloffDepartureLines[camilloffDepartureStep].speaker}</div>
                  <p>{camilloffDepartureLines[camilloffDepartureStep].text}</p>
                  <div className="departure-count">{String(camilloffDepartureStep + 1).padStart(2, "0")} / {String(camilloffDepartureLines.length).padStart(2, "0")}</div>
                </div>
                {camilloffDepartureStep < camilloffDepartureLines.length - 1 ? (
                  <button className="primary-action" onClick={advanceCamilloffDeparture}>继续听他说 <span>→</span></button>
                ) : (
                  <button className="primary-action" onClick={sendCamilloffOff}>送卡米洛夫到门前 <span>→</span></button>
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
            <BilingualQuote pt="[…] um sino tocava a matinas. […] rolaram-me das pálpebras duas lágrimas mudas." zh="晨祷的钟声响了起来（……）两滴无声的泪从我的眼中滚落。" />
            <p>两位遣使会神父清晨在路上发现了昏迷的我，用担架把我抬回了修道院。后来我才知道，萨托虽然负了伤，但总算是逃回了北京。</p>
            <BilingualQuote compact pt="O superior lazarista era o excelente padre Giulio. […] com a sua túnica roxa, o rabicho longo, a barba venerável, agitando devagar um enorme leque — […]" zh="遣使会的院长是善良的朱利奥神父（……）他身着紫袍，留着长辫和庄严的胡须，此时正缓缓扇动着一把大折扇（……）" />
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.mission ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            {hasInspectedAll ? (
              <button className="primary-action" onClick={() => go("letter")}>回到房间 <span>→</span></button>
            ) : (
              <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
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
            <p>“爪哇号”载着我离开香港，向欧洲返航。直到那天，我都以为狄鑫福已经平息了怨怼；但那天晚上十一点，我走进熄灯后的船舱，月光正穿过舷窗……</p>
            <BilingualQuote
              pt="Eram onze horas quando desci ao meu beliche. As luzes já estavam apagadas: mas a Lua que se erguia ao nível da água, redonda e branca, batia o vidro da cabina com um raio de claridade: e então, a essa meia-tinta pálida, lá vi, estirada sobre a maca, a figura pançuda, vestida de seda amarela, com o seu papagaio nos braços!"
              zh="十一点钟，我回到了自己的卧舱。灯火已经熄灭，浑圆苍白的月亮从水面升起，一道清光照在舷窗上。就在那片惨淡的半明半暗中，我看见吊床上横陈着那具肥胖的尸体，身穿黄绸，怀里抱着纸鸢！"
            />
            <BilingualQuote compact pt="Era ele, outra vez! E foi ele, perpetuamente!" zh="又是他！阴魂不散！" />
            <p>狄鑫福是在返程的船上突然重新出现的，在随后的旅程中，他再也不愿还我清净。</p>
            <div className="return-route-guide" id="return-route-guide">
              <span>点击沿途地名，查看狄鑫福如何一路相随。</span>
              <b>已查看 {returnStops.length} / {returnPlaces.length}</b>
            </div>
            <div className="return-stamps" aria-label="返航地点" aria-describedby="return-route-guide">
              {returnPlaces.map((place, index) => (
                <button key={place} className={returnStops.includes(place) ? "is-read" : place === nextReturnStop ? "is-next" : ""} style={{ animationDelay: `${index * 0.16}s` }} onClick={() => {
                  setReturnStops((stops) => stops.includes(place) ? stops : [...stops, place]);
                  sound.tone(110 + index * 14, 0.7, 0.11, 0, "triangle");
                }}>{place}</button>
              ))}
            </div>
            {returnStops.length >= returnPlaces.length ? (
              <>
                <BilingualQuote compact pt="Quando desembarquei em Lisboa, no Cais das Colunas, a sua figura bojuda enchia todo o arco da Rua Augusta; […]" zh="当我在里斯本的柱廊码头下船时，他肥胖的身躯填满了奥古斯塔街的整座拱门。" />
                <button className="primary-action" onClick={() => go("reckoning")}>回到洛雷托 <span>→</span></button>
              </>
            ) : null}
          </div>
        )}

        {stage === "reckoning" && (
          <div className="scene-body ghost-scene reckoning-scene">
            <BilingualQuote
              pt="Então, certo que não poderia jamais aplacar Ti Chin-Fu, toda essa noite no meu quarto ao Loreto, onde como outrora as velas inumeráveis das serpentinas davam aos damascos tons de sangue fresco, meditei sacudir de mim, como um adorno de pecado, esses milhões sobrenaturais."
              zh="于是，我确信自己再也无法平息狄鑫福的怨气了。那天晚上，我一直待在洛雷托的房间里，枝形烛台上无数的蜡烛一如往昔，把锦缎映成鲜血般的颜色。我反复思量，到底如何才能把这笔超自然的巨款像罪恶的饰物一样从身上甩掉。"
            />
            <p>我已经走过半个世界，却没有让狄鑫福的怨念离开我。如果财富是这具尸体扑向我的道路，那我只能把它截断。</p>
            <BilingualQuote compact pt="E assim me libertaria talvez daquela pança e daquele papagaio abominável!" zh="也许这样，我就能摆脱那副大肚子和那只可憎的纸鸢！" />
            <button className="primary-action" onClick={() => go("renounce")}>抛下财产 <span>→</span></button>
          </div>
        )}

        {stage === "renounce" && (
          <div className="scene-body">
            <BilingualQuote pt="Abandonei o palacete ao Loreto, a existência de nababo." zh="我抛下了洛雷托的豪宅，也抛下富豪的生活。" />
            <p>我重新租下马克斯太太家的旧房间，却再也回不到从前那种安静的贫穷。</p>
            {selectedHotspot && <SourceSlip item={selectedHotspot} />}
            <div className="hotspot-index">
              {(sceneHotspots.renounce ?? []).map((item) => (
                <button key={item.id} className={currentVisited.includes(item.id) ? "is-found" : ""} onClick={() => inspectHotspot(item)}>
                  <span>{currentVisited.includes(item.id) ? "✓" : "+"}</span>{item.label}
                </button>
              ))}
            </div>
            <div className="ledger-animation" aria-hidden="true"><span>洛雷托宫殿</span><i>十万六千孔托</i><b>{currentVisited.length >= 3 ? "仍属于我" : "零？"}</b></div>
            <div className="consequence">
              <BilingualQuote pt="todos aqueles que a minha opulência humilhara cobriram-me de ofensas, como se alastra de lixo uma estátua derrubada de príncipe decaído." zh="所有曾被我的财富压过一头的人，如今都把侮辱向我泼洒，仿佛是在往一尊被推倒的王子雕像上倒垃圾。" />
              <BilingualQuote compact pt="Então, indignado, um dia subitamente reentrei com estrondo no meu palacete e no meu luxo." zh="终于有一天，我怒不可遏，声势浩大地搬回豪宅，回到了奢侈的生活。" />
              {hasInspectedAll ? (
                <button className="primary-action" onClick={() => go("prison")}>推开洛雷托豪宅的大门 <span>→</span></button>
              ) : (
                <p className="discovery-count">已查看 {currentVisited.length} / {currentHotspots.length}</p>
              )}
            </div>
          </div>
        )}

        {stage === "prison" && (
          <div className="scene-body loreto-restored-body">
            <BilingualQuote
              pt="Logo, Lisboa, sem hesitar, se rojou aos meus pés. A Madame Marques chamou-me, chorando, «filho do seu coração». Os jornais deram-me os qualificativos que, de antiga tradição, pertencem à Divindade: fui o Omnipotente, fui o Omnisciente! A Aristocracia beijou-me os dedos como a um tirano: e o Clero incensou-me como a um ídolo."
              zh="里斯本毫不迟疑地匍匐在我脚下。马克斯太太哭着称我为‘她心爱的儿子’；报纸把按古老传统本该属于神明的称号送给我，叫我全能者，全知者；贵族像面对暴君般亲吻我的手指；教士像供奉偶像般向我献香。"
            />
            <p>洛雷托宫殿的长窗重新放出灯火，身穿黑绸制服的仆人又在其中穿行。我重新拥有了整个里斯本，却只在它的敬畏里感到厌倦。</p>
            <BilingualQuote compact pt="Desde então uma saciedade enervante mantém-me semanas inteiras num sofá, mudo e soturno, pensando na felicidade do não-ser..." zh="从那以后，一种叫人倦怠的满足感使我一连数周躺在沙发上，沉默阴郁，想着如果自己就此消失，该有多幸福……" />
            <button className="primary-action" onClick={() => go("devilReturn")}>独自走入夜色 <span>→</span></button>
          </div>
        )}

        {stage === "devilReturn" && (
          <div className="scene-body devil-street-body">
            <BilingualQuote
              pt="Uma noite, recolhendo só por uma rua deserta, vi diante de mim o Personagem vestido de preto com o guarda-chuva debaixo do braço, o mesmo que no meu quarto feliz da Travessa da Conceição me fizera, a um ti-li-tim de campainha, herdar tantos milhões detestáveis."
              zh="一天夜里，我独自走在一条荒无人烟的街上，忽然看见前方有个一身黑衣、腋下夹着雨伞的人——正是他，他曾在孔塞桑巷那间幸福的小屋里，让我随着摇铃的一声轻响继承了可憎的千万财富。"
            />
            <p>煤气灯的微光落在他的礼帽和黑色外套上。他仍然像第一次出现时那样庄重、平静，仿佛并没有对我做过任何可怕的事情。</p>
            <button className="primary-action" onClick={() => go("supplication")}>追上他 <span>→</span></button>
          </div>
        )}

        {stage === "testament" && (
          <>
            <div className="scene-body testament-body">
              <p className="ending-label">结局</p>
              <p>我回到洛雷托豪宅，痛苦地坐在办公桌前。魔鬼不肯撤销交易，狄鑫福的尸体也没有离我而去。</p>
              <p>我一日日消沉下去，感到自己时日无多，便把自己的经历写成了书，并且立好了遗嘱。</p>
              <div className="final-artifact-progress" aria-live="polite">
                <button type="button" className={finalArtifactsSeen.includes("testament") ? "is-read" : ""} onClick={openFinalTestament} aria-label="查看遗嘱">遗嘱</button>
                <button type="button" className={finalArtifactsSeen.includes("book") ? "is-read" : ""} onClick={openFinalBook} aria-label="查看《满大人》">《满大人》</button>
              </div>
              {finalArtifactsRead && <p className="ending-transition-note">合上最后一页。</p>}
            </div>

            <div className="ending-object-hotspots" aria-label="桌上的物件">
              <button className={finalArtifactsSeen.includes("testament") ? "is-read testament-hotspot" : "testament-hotspot"} onClick={openFinalTestament} aria-label="展开">
                <i>01</i><span>遗嘱</span>
              </button>
              <button className={finalArtifactsSeen.includes("book") ? "is-read final-book-hotspot" : "final-book-hotspot"} onClick={openFinalBook} aria-label="查看">
                <i>02</i><span>《满大人》</span>
              </button>
            </div>

            {testamentOpen && (
              <div className="artifact-overlay" role="dialog" aria-modal="true" aria-label="特奥多罗的遗嘱">
                <article className="will-sheet">
                  <button className="artifact-close" onClick={closeFinalTestament}>收起</button>
                  <p className="will-kicker">遗嘱</p>
                  <h2>特奥多罗的遗嘱</h2>
                  <p>我把我的百万家财遗赠给魔鬼，那笔钱本就该属于他。</p>
                </article>
              </div>
            )}

            {finalBookPhase > 0 && (
              <div className="artifact-overlay final-book-overlay" role="dialog" aria-modal="true" aria-label="《满大人》">
                <div className="final-book-dialog">
                  {finalBookPhase === 1 ? (
                    <>
                      <div className="final-book-cover" aria-label="《满大人》封面">
                        <small>特奥多罗著</small>
                        <span>《满大人》</span>
                      </div>
                      <button className="final-book-action" onClick={turnFinalBookCover}>翻开</button>
                    </>
                  ) : (
                    <>
                      <article className="final-book-page" aria-label="翻开的书">
                        <section className="final-book-leaf">
                          <p lang="pt"><em>Só sabe bem o pão que dia a dia ganham as nossas mãos: nunca mates o Mandarim!</em></p>
                        </section>
                        <section className="final-book-leaf">
                          <p>只有我们每日用双手挣来的面包才真正香甜：千万别杀害满大人！</p>
                        </section>
                      </article>
                      <button className="final-book-action" onClick={closeFinalBook}>合上</button>
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
              <img src="/bell-v1.webp" alt="" />
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
          <img src="/devil-standing-v1.webp" alt="" />
        </figure>
      )}

      {stage === "bell" && <DevilFigure />}

      {stage === "mission" && missionWaking && (
        <div
          className={`mission-awakening attempt-${missionWakeAttempt} phase-${missionWakePhase}`}
          role="dialog"
          aria-modal="true"
          aria-live="assertive"
          aria-label={`晨祷钟声响起，特奥多罗第${missionWakeAttempt}次艰难睁眼`}
        >
          <div className="mission-awakening-scene" aria-hidden="true" />
          <div className="mission-awakening-darkness" aria-hidden="true" />
        </div>
      )}

      <footer className="game-footer">
        <span>{stage === "intro" ? "一八八〇 / 二〇二六" : info.subtitle ? `${info.act} · ${info.subtitle}` : info.act}</span>
        <span>{sound.enabled ? "声音开启" : "静音模式"}</span>
      </footer>

      {infoOpen && (
        <div className="modal-backdrop">
          <section className="info-modal" role="dialog" aria-modal="true" aria-label="版本说明">
            <button className="modal-close" onClick={() => setInfoOpen(false)} aria-label="关闭">×</button>
            <div className="scene-kicker">版本说明</div>
            {ABOUT_COPY.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p className="credits">{CREATOR_COPY}</p>
            <div className="music-credits">
              <span>分幕配乐</span>
              {MUSIC_CREDITS.map((credit) => (
                <a key={credit.title} href={credit.href} target="_blank" rel="noreferrer">《{credit.title}》· {credit.creator} · {credit.license}</a>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
