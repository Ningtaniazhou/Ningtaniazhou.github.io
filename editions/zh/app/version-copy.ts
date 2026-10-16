import { asset } from "./asset-path";
export const ABOUT_COPY = [
  "本交互叙事游戏根据埃萨·德·凯罗斯一八八〇年的小说《满大人》改编。它保留埃萨原作的故事主线，在此基础上，如果三次拒绝魔鬼的摇铃提议则触发特别结局，特别结局为原创内容，与原作无关。本作中涉及的中国是埃萨作为十九世纪的欧洲人对于东方的想象，并非历史中国的现实复原。",
  "游戏中的“满大人”和“狄鑫福”两个译名使用周汉军译本《满大人》中的译法；除这两个译名外，游戏内的原作引文均由游戏制作者翻译。",
] as const;

export const CREATOR_COPY = "制作者：周宁　　使用模型：chatgpt sol 5.6";

export const MUSIC_CREDITS = [
  { src: asset("/audio/unsolved-investigation-v1.ogg"), title: "Unsolved Investigation", creator: "isaiah658", license: "CC0", href: "https://opengameart.org/content/unsolved-investigation" },
  { src: asset("/audio/apparitions-ball.mp3"), title: "Apparitions Ball", creator: "Bobjt", license: "CC0", href: "https://opengameart.org/content/apparitions-ball" },
  { src: asset("/audio/i-swear-i-saw-it.ogg"), title: "I Swear I Saw It", creator: "yd", license: "CC0", href: "https://opengameart.org/content/i-swear-i-saw-it-background-track" },
  { src: asset("/audio/the-journey-begins.ogg"), title: "The Journey Begins", creator: "Igor Gundarev", license: "CC0", href: "https://opengameart.org/content/the-journey-begins" },
  { src: asset("/audio/pursuit.mp3"), title: "Pursuit", creator: "Sudocolon", license: "CC0", href: "https://opengameart.org/content/pursuit" },
  { src: asset("/audio/asianoriental1.ogg"), title: "Asianoriental1", creator: "Tozan", license: "CC0", href: "https://opengameart.org/content/asianoriental1" },
  { src: asset("/audio/church-bell-real-v1.mp3"), title: "Old Church Bell", creator: "dsp9000", license: "CC0", href: "https://freesound.org/people/dsp9000/sounds/76405/" },
] as const;
