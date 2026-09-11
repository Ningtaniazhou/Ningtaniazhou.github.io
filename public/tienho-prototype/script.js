const scene = document.querySelector("#scene");
const storyText = document.querySelector("#storyText");
const instruction = document.querySelector("#instruction");
const eyebrow = document.querySelector("#eyebrow");
const startButton = document.querySelector("#startButton");
const rumorText = document.querySelector("#rumorText");
const rumorFill = document.querySelector("#rumorFill");
const coinSource = document.querySelector("#coinSource");
const widowTarget = document.querySelector("#widowTarget");
const riceTarget = document.querySelector("#riceTarget");
const lanterns = [...document.querySelectorAll(".lantern")];
const moneyBag = document.querySelector("#moneyBag");
const soundToggle = document.querySelector("#soundToggle");
const phaseDots = [...document.querySelectorAll(".phase-dots span")];
const petals = document.querySelector("#petals");
const crowdSignal = document.querySelector("#crowdSignal");
const identityPanel = document.querySelector("#identityPanel");
const evidenceCards = [...document.querySelectorAll(".evidence-card")];
const causalChain = document.querySelector("#causalChain");
const intentText = document.querySelector("#intentText");
const perceptionText = document.querySelector("#perceptionText");
const outcomeText = document.querySelector("#outcomeText");
const translationLine = document.querySelector("#translationLine");
const motiveStrip = document.querySelector("#motiveStrip");
const pressureFill = document.querySelector("#pressureFill");
const pressureValue = document.querySelector("#pressureValue");
const identityContinue = document.querySelector("#identityContinue");
const escapeStage = document.querySelector("#escapeStage");
const escapeBag = document.querySelector("#escapeBag");
const distanceFill = document.querySelector("#distanceFill");
const distanceValue = document.querySelector("#distanceValue");
const goldFill = document.querySelector("#goldFill");
const goldValue = document.querySelector("#goldValue");
const crowdFill = document.querySelector("#crowdFill");
const crowdValue = document.querySelector("#crowdValue");
const escapeInstruction = document.querySelector("#escapeInstruction");
const escapeCoins = document.querySelector("#escapeCoins");
const wallGate = document.querySelector("#wallGate");
const cutBagButton = document.querySelector("#cutBagButton");
const wildernessStage = document.querySelector("#wildernessStage");
const wildernessHeading = document.querySelector("#wildernessHeading");
const wildernessNarration = document.querySelector("#wildernessNarration");
const wildernessAction = document.querySelector("#wildernessAction");
const wildernessActionLabel = document.querySelector("#wildernessActionLabel");
const bodySignals = [...document.querySelectorAll("#bodySignals span")];
const blackout = document.querySelector("#blackout");
const missionEntry = document.querySelector("#missionEntry");
const previewParams = new URLSearchParams(window.location.search);
const embeddedInMainStory = previewParams.get("embedded") === "1";

let phase = "intro";
let lanternCount = 0;
let soundOn = true;
let audioContext;
let scorePlayers;
let activeScorePlayer = 0;
let currentScore = "";
let currentScoreVolume = 0;
let scoreFadeFrame = 0;
let scoreUnlocked = false;
let drag = null;
let gripStart = 0;
let gripFrame = 0;
let timers = [];
let identityChoice = "";
let escapeFrame = 0;
let escapeLastTime = 0;
let escapeDistance = 0;
let escapeGold = 100;
let escapeCrowd = 36;
let escapeHeld = false;
let lastCoinAt = 0;
let wildernessStep = 0;
let wakeRound = 0;
let wakeHoldStart = 0;
let wakeFrame = 0;
let wakePointerDown = false;

const evidenceOutcomes = {
  letter: {
    intent: "我受官府委托而来",
    perception: "无人能读的外国字与红印",
    outcome: "来历不明的外国文书",
    quote: "信在人群中传了一圈，没人读得懂，有人指着红印摇头。",
    pressure: 84,
  },
  cross: {
    intent: "我的信仰约束着我的行为",
    perception: "一个陌生的金属刑具",
    outcome: "陌生的异邦法器",
    quote: "十字架举起，人群先退了一步，随后有人弯腰捡起石块。",
    pressure: 88,
  },
  gold: {
    intent: "我确实有能力帮助你们",
    perception: "传闻中的财宝就在眼前",
    outcome: "传闻中的黄金",
    quote: "金币一露出来，人群安静了，随即扑向金币。",
    pressure: 100,
  },
  sato: {
    intent: "我们只是来帮助穷人",
    perception: "萨托说：他要把财物给全村",
    outcome: "要分给全村的财物",
    quote: "萨托说我们是来帮助穷人的，村民却已经开始搬动我们的行李。",
    pressure: 96,
  },
};

const scoreCues = {
  dream: { src: "/audio/apparitions-ball.mp3", volume: .16 },
  danger: { src: "/audio/pursuit.mp3", volume: .18 },
  wilderness: { src: "/audio/i-swear-i-saw-it.ogg", volume: .13 },
  monastery: { src: "/audio/contemplation.mp3", volume: .2 },
};

const phaseScores = {
  coin: scoreCues.dream,
  rice: scoreCues.dream,
  lantern: scoreCues.dream,
  bridge: scoreCues.danger,
  reality: scoreCues.danger,
  identity: scoreCues.danger,
  escape: scoreCues.danger,
  wilderness: scoreCues.wilderness,
  mission: scoreCues.monastery,
};

function later(fn, delay) {
  const timer = window.setTimeout(fn, delay);
  timers.push(timer);
  return timer;
}

function setPhase(next) {
  phase = next;
  document.querySelector("#narrativeCard").scrollTop = 0;
  scene.classList.remove("phase-coin", "phase-rice", "phase-lantern", "dreaming", "bridge", "reality", "identity", "escape", "wilderness", "mission", "collapsed", "blinking", "is-gripping", "is-running");
  if (["coin", "rice", "lantern"].includes(next)) scene.classList.add("dreaming", `phase-${next}`);
  if (["bridge", "reality", "identity", "escape", "wilderness", "mission"].includes(next)) scene.classList.add(next);
  playScoreForPhase(next);
}

function setDot(index) {
  phaseDots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function setRumor(text, percent) {
  rumorText.animate([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }], { duration: 460, easing: "ease-out" });
  rumorText.textContent = text;
  rumorFill.style.width = `${percent}%`;
}

function setupPetals() {
  petals.innerHTML = "";
  for (let i = 0; i < 24; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${24 + Math.random() * 72}%`;
    petal.style.setProperty("--duration", `${5 + Math.random() * 5}s`);
    petal.style.setProperty("--delay", `${Math.random() * -8}s`);
    petal.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    petals.append(petal);
  }
}

function addCrowd(count) {
  const start = crowdSignal.children.length;
  for (let i = 0; i < count; i += 1) {
    const figure = document.createElement("i");
    figure.className = "crowd-figure";
    figure.style.left = `${(start + i) * 18 + Math.random() * 12}px`;
    figure.style.top = `${50 + Math.random() * 70}px`;
    figure.style.animationDelay = `${i * 80}ms`;
    crowdSignal.append(figure);
  }
}

function getAudioContext() {
  if (!soundOn) return null;
  const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext ||= new BrowserAudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function ensureScorePlayers() {
  if (!scorePlayers) {
    scorePlayers = [new Audio(), new Audio()];
    scorePlayers.forEach((player) => {
      player.loop = true;
      player.preload = "auto";
      player.volume = 0;
    });
  }
  return scorePlayers;
}

function cancelScoreFade() {
  if (scoreFadeFrame) cancelAnimationFrame(scoreFadeFrame);
  scoreFadeFrame = 0;
}

function crossfadeScore(incoming, outgoing, target, duration = 1400) {
  cancelScoreFade();
  const started = performance.now();
  const outgoingStart = outgoing?.volume || 0;
  const step = (now) => {
    const ratio = Math.min(1, (now - started) / duration);
    incoming.volume = target * ratio;
    if (outgoing) outgoing.volume = outgoingStart * (1 - ratio);
    if (ratio < 1) {
      scoreFadeFrame = requestAnimationFrame(step);
    } else {
      scoreFadeFrame = 0;
      if (outgoing) {
        outgoing.pause();
        outgoing.currentTime = 0;
      }
    }
  };
  scoreFadeFrame = requestAnimationFrame(step);
}

function playScoreForPhase(next, resume = false) {
  const cue = phaseScores[next];
  if (!cue) return;
  const players = ensureScorePlayers();
  currentScoreVolume = cue.volume;

  if (currentScore === cue.src) {
    const active = players[activeScorePlayer];
    if (soundOn && scoreUnlocked && (resume || active.paused)) {
      active.volume = Math.min(active.volume, cue.volume);
      void active.play().then(() => crossfadeScore(active, null, cue.volume, 500)).catch(() => undefined);
    }
    return;
  }

  const outgoing = players[activeScorePlayer];
  const nextIndex = activeScorePlayer === 0 ? 1 : 0;
  const incoming = players[nextIndex];
  incoming.pause();
  incoming.src = cue.src;
  incoming.currentTime = 0;
  incoming.volume = 0;
  incoming.load();
  currentScore = cue.src;
  activeScorePlayer = nextIndex;

  if (!soundOn || !scoreUnlocked) {
    outgoing.pause();
    outgoing.volume = 0;
    return;
  }
  void incoming.play().then(() => crossfadeScore(incoming, outgoing, cue.volume)).catch(() => undefined);
}

function unlockScore() {
  scoreUnlocked = true;
  playScoreForPhase(phase, true);
}

function pauseScore() {
  cancelScoreFade();
  ensureScorePlayers().forEach((player) => {
    player.pause();
    player.volume = 0;
  });
}

function silenceScore(duration = 1800) {
  if (!scorePlayers) return;
  cancelScoreFade();
  const active = scorePlayers[activeScorePlayer];
  const started = performance.now();
  const startVolume = active.volume;
  const step = (now) => {
    const ratio = Math.min(1, (now - started) / duration);
    active.volume = startVolume * (1 - ratio);
    if (ratio < 1) scoreFadeFrame = requestAnimationFrame(step);
    else {
      scoreFadeFrame = 0;
      active.pause();
    }
  };
  scoreFadeFrame = requestAnimationFrame(step);
}

function noiseBuffer(ctx, duration) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frameCount; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * .35 + white * .65;
    data[i] = last;
  }
  return buffer;
}

function filteredNoise({ duration = .15, frequency = 1200, type = "bandpass", q = .8, volume = .04, when = 0 }) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = ctx.currentTime + when;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = noiseBuffer(ctx, duration);
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + Math.min(.018, duration * .18));
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
}

function resonantTap({ frequency = 420, duration = .14, volume = .05, when = 0, wave = "triangle" }) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = ctx.currentTime + when;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency * (.98 + Math.random() * .04), start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function playCoinClink(count = 2, volume = 1) {
  for (let i = 0; i < count; i += 1) {
    const when = i * (.045 + Math.random() * .025);
    resonantTap({ frequency: 1760 + Math.random() * 240, duration: .16, volume: .025 * volume, when });
    resonantTap({ frequency: 2470 + Math.random() * 330, duration: .11, volume: .014 * volume, when: when + .006 });
    filteredNoise({ duration: .025, frequency: 3100, type: "highpass", volume: .012 * volume, when });
  }
}

function playWoodClack(intensity = 1, when = 0) {
  resonantTap({ frequency: 210, duration: .085, volume: .055 * intensity, when, wave: "triangle" });
  filteredNoise({ duration: .055, frequency: 760, q: 1.4, volume: .05 * intensity, when });
}

function playPaperRustle(intensity = 1, duration = .28) {
  filteredNoise({ duration, frequency: 1650, type: "bandpass", q: .45, volume: .045 * intensity });
  filteredNoise({ duration: duration * .72, frequency: 3800, type: "highpass", q: .3, volume: .012 * intensity, when: .045 });
}

function playRicePour() {
  filteredNoise({ duration: .48, frequency: 2850, type: "bandpass", q: .35, volume: .065 });
  for (let i = 0; i < 7; i += 1) {
    resonantTap({ frequency: 720 + Math.random() * 420, duration: .035, volume: .008, when: .05 + i * .045 });
  }
  playWoodClack(.45, .34);
}

function playLanternLight(level = 1) {
  playPaperRustle(.42, .17);
  playWoodClack(.35 + level * .05, .08);
}

function playLeatherCreak(intensity = 1) {
  filteredNoise({ duration: .23, frequency: 430, type: "bandpass", q: 1.15, volume: .045 * intensity });
  filteredNoise({ duration: .13, frequency: 980, type: "bandpass", q: 2.1, volume: .018 * intensity, when: .055 });
}

function playHandDrum(intensity = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(88, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(58, ctx.currentTime + .18);
  gain.gain.setValueAtTime(.12 * intensity, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .42);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + .44);
  filteredNoise({ duration: .09, frequency: 520, type: "lowpass", q: .7, volume: .075 * intensity });
  scene.classList.remove("beat");
  void scene.offsetWidth;
  scene.classList.add("beat");
  later(() => scene.classList.remove("beat"), 180);
}

function playCordSnap() {
  filteredNoise({ duration: .12, frequency: 1350, type: "bandpass", q: .7, volume: .095 });
  playWoodClack(.9, .025);
  filteredNoise({ duration: .2, frequency: 3400, type: "highpass", q: .4, volume: .025, when: .045 });
}

function playMudStep(strength = 1) {
  filteredNoise({ duration: .2, frequency: 240, type: "lowpass", q: .6, volume: .07 * strength });
  resonantTap({ frequency: 92, duration: .16, volume: .032 * strength, wave: "sine" });
}

function playBreath(strength = 1) {
  filteredNoise({ duration: .52, frequency: 760, type: "bandpass", q: .5, volume: .035 * strength });
}

function playHeartbeat(strength = 1) {
  resonantTap({ frequency: 61, duration: .24, volume: .075 * strength, wave: "sine" });
  resonantTap({ frequency: 54, duration: .18, volume: .045 * strength, when: .14, wave: "sine" });
}

function beginDream() {
  getAudioContext();
  scoreUnlocked = true;
  resonantTap({ frequency: 1280, duration: .13, volume: .018 });
  resonantTap({ frequency: 920, duration: .18, volume: .012, when: .035 });
  setPhase("coin");
  setDot(0);
  eyebrow.textContent = "天河村";
  storyText.textContent = "狄鑫福的遗孀站在晨光里。她没有开口，只是把一只空碗捧向我。";
  instruction.textContent = "把金币放进她的碗里。";
  startButton.hidden = true;
  setRumor("一位远道而来的陌生人", 12);
  addCrowd(3);
}

function completeCoin() {
  if (phase !== "coin") return;
  coinSource.style.opacity = "0";
  playCoinClink(2, .9);
  setRumor("慷慨的陌生人", 38);
  addCrowd(4);
  storyText.textContent = "金币落入碗底，她笑了笑，人群让出路来让粮车通过。";
  instruction.textContent = "点击车上的粮袋，开始分发米粮。";
  setPhase("rice");
  setDot(1);
}

function completeRice() {
  if (phase !== "rice") return;
  playRicePour();
  riceTarget.classList.add("is-complete");
  setRumor("富有的陌生人", 67);
  addCrowd(5);
  storyText.textContent = "队伍向前移动。每只装满的碗后面又多出了几张脸。";
  instruction.textContent = "点亮三盏灯笼。";
  setPhase("lantern");
  setDot(2);
}

function lightLantern(button) {
  if (phase !== "lantern" || button.classList.contains("is-lit")) return;
  button.classList.add("is-lit");
  lanternCount += 1;
  playLanternLight(lanternCount);
  instruction.textContent = `灯笼 ${lanternCount} / 3`;
  addCrowd(2);
  if (lanternCount === 3) {
    scene.classList.add("celebrating");
    setRumor("带着财物的外国人", 100);
    storyText.textContent = "最后一盏灯亮起。欢呼声从近处传来。";
    instruction.textContent = "鼓点从人群深处传来……";
    later(beginBridge, 850);
  }
}

function beginBridge() {
  setPhase("bridge");
  setDot(3);
  document.querySelector("#narrativeCard").classList.add("is-quiet");
  const beats = [0, 560, 1080, 1540, 1940, 2290];
  beats.forEach((delay, index) => later(() => playHandDrum(0.78 + index * .1), delay));
  later(() => scene.classList.add("wake-1"), 520);
  later(() => scene.classList.add("wake-2"), 1080);
  later(() => scene.classList.add("wake-3"), 1640);
  later(() => scene.classList.add("wake-final"), 2200);
  later(beginReality, 2920);
}

function beginReality() {
  setPhase("reality");
  eyebrow.textContent = "客栈";
  storyText.textContent = "鼓声没有停，变成了撞门声，门外有很多人在叫喊。我一出门，就有人抓住了我的钱袋。";
  instruction.textContent = "抓住钱袋。";
  setRumor("带着财物的外国人", 100);
  document.querySelector("#narrativeCard").classList.remove("is-quiet");
}

function startGrip(event) {
  if (phase !== "reality") return;
  event.preventDefault();
  getAudioContext();
  playLeatherCreak(.9);
  scene.classList.add("is-gripping");
  moneyBag.classList.add("is-held");
  if (event.pointerId !== undefined) moneyBag.setPointerCapture?.(event.pointerId);
  gripStart = performance.now();
  const tick = (now) => {
    const progress = Math.min(100, ((now - gripStart) / 1250) * 100);
    moneyBag.style.setProperty("--hold", progress.toFixed(1));
    if (progress >= 100) finishGrip();
    else gripFrame = requestAnimationFrame(tick);
  };
  gripFrame = requestAnimationFrame(tick);
}

function cancelGrip() {
  if (phase !== "reality") return;
  cancelAnimationFrame(gripFrame);
  scene.classList.remove("is-gripping");
  moneyBag.classList.remove("is-held");
  moneyBag.style.setProperty("--hold", 0);
  instruction.textContent = "那只手没有松开。抓紧钱袋。";
}

function finishGrip() {
  cancelAnimationFrame(gripFrame);
  playHandDrum(1.45);
  setPhase("identity");
  scene.classList.add("wake-final");
  moneyBag.classList.remove("is-held");
  moneyBag.style.setProperty("--hold", 100);
  document.querySelector("#narrativeCard").style.opacity = "0";
  identityPanel.hidden = false;
  setDot(4);
  setRumor("带着财物的外国人", 100);
}

function chooseEvidence(card) {
  if (phase !== "identity" || identityChoice) return;
  identityChoice = card.dataset.evidence;
  const result = evidenceOutcomes[identityChoice];
  evidenceCards.forEach((item) => {
    item.disabled = true;
    item.classList.toggle("is-chosen", item === card);
  });
  intentText.textContent = result.intent;
  perceptionText.textContent = result.perception;
  outcomeText.textContent = result.outcome;
  translationLine.textContent = result.quote;
  causalChain.hidden = false;
  translationLine.hidden = false;
  motiveStrip.hidden = false;
  pressureFill.style.width = `${result.pressure}%`;
  pressureValue.textContent = `${result.pressure}%`;
  setRumor(result.outcome, result.pressure);
  if (identityChoice === "letter") playPaperRustle(1.05, .36);
  if (identityChoice === "cross") playCoinClink(1, .42);
  if (identityChoice === "gold") playCoinClink(3, 1.05);
  if (identityChoice === "sato") playWoodClack(.72);
  later(() => playHandDrum(result.pressure === 100 ? 1.25 : .92), 150);
  later(() => {
    identityContinue.hidden = false;
    identityContinue.focus();
  }, 700);
}

function beginEscape() {
  if (!identityChoice) return;
  playWoodClack(.8);
  identityPanel.hidden = true;
  escapeStage.hidden = false;
  setPhase("escape");
  setDot(5);
  escapeDistance = 0;
  escapeGold = 100;
  escapeCrowd = evidenceOutcomes[identityChoice].pressure * .46;
  escapeHeld = false;
  escapeLastTime = 0;
  lastCoinAt = 0;
  escapeBag.disabled = false;
  wallGate.hidden = true;
  escapeInstruction.textContent = "";
  updateEscapeHud();
}

function updateEscapeHud() {
  const distance = Math.min(100, escapeDistance);
  const gold = Math.max(0, escapeGold);
  const crowd = Math.max(0, Math.min(100, escapeCrowd));
  distanceFill.style.width = `${distance}%`;
  distanceValue.textContent = `${Math.round(distance)}%`;
  goldFill.style.width = `${gold}%`;
  goldValue.textContent = `${Math.round(gold)}%`;
  crowdFill.style.width = `${crowd}%`;
  crowdValue.textContent = `${Math.round(crowd)}%`;
  scene.style.setProperty("--crowd-opacity", Math.max(.16, crowd / 100).toFixed(2));
  scene.style.setProperty("--road-shift", `${-(distance * .07).toFixed(2)}%`);
}

function scatterCoin(burst = false) {
  const count = burst ? 22 : 1;
  for (let i = 0; i < count; i += 1) {
    const coin = document.createElement("i");
    coin.className = "escape-coin";
    coin.style.setProperty("--spread", `${Math.random() * 190}px`);
    coin.style.setProperty("--drop", `${-35 + Math.random() * 135}px`);
    coin.style.right = `${12 + Math.random() * 18}%`;
    escapeCoins.append(coin);
    later(() => coin.remove(), 950);
  }
  if (burst) playCoinClink(5, .85);
  else if (Math.random() < .32) playCoinClink(1, .22);
}

function runEscape(now) {
  if (phase !== "escape" || !escapeStage.classList.contains("is-active")) return;
  if (!escapeLastTime) escapeLastTime = now;
  const delta = Math.min(.05, (now - escapeLastTime) / 1000);
  escapeLastTime = now;

  if (escapeHeld) {
    escapeDistance += 4.2 * delta;
    escapeCrowd += 6.5 * delta;
    scene.style.setProperty("--stride", ".84s");
  } else {
    escapeDistance += 13.5 * delta;
    escapeGold -= 17 * delta;
    escapeCrowd -= 10.5 * delta;
    scene.style.setProperty("--stride", ".42s");
    if (now - lastCoinAt > 170 && escapeGold > 0) {
      scatterCoin();
      lastCoinAt = now;
    }
  }

  escapeGold = Math.max(0, escapeGold);
  escapeCrowd = Math.max(8, Math.min(98, escapeCrowd));
  escapeInstruction.textContent = "";
  updateEscapeHud();

  if (escapeDistance >= 72) {
    reachWall();
    return;
  }
  escapeFrame = requestAnimationFrame(runEscape);
}

function setEscapeHeld(held) {
  if (phase !== "escape" || !wallGate.hidden) return;
  const changed = held !== escapeHeld;
  escapeHeld = held;
  if (changed && held) playLeatherCreak(.72);
  if (changed && !held && escapeStage.classList.contains("is-active")) playCoinClink(1, .2);
  escapeBag.classList.toggle("is-held", held);
  if (!escapeStage.classList.contains("is-active")) {
    escapeStage.classList.add("is-active");
    scene.classList.add("is-running");
    escapeLastTime = 0;
    escapeFrame = requestAnimationFrame(runEscape);
  }
}

function reachWall() {
  cancelAnimationFrame(escapeFrame);
  escapeDistance = 100;
  updateEscapeHud();
  escapeHeld = false;
  escapeBag.classList.remove("is-held");
  escapeBag.disabled = true;
  scene.classList.remove("is-running");
  wallGate.hidden = false;
  playWoodClack(1.25);
  later(() => playHandDrum(.72), 80);
}

function cutBag() {
  if (phase !== "escape") return;
  playCordSnap();
  escapeGold = 0;
  updateEscapeHud();
  scatterCoin(true);
  cutBagButton.disabled = true;
  cutBagButton.querySelector("span").textContent = "皮绳断开";
  later(finishEscape, 750);
}

function finishEscape() {
  escapeStage.hidden = true;
  beginWilderness();
}

const wildernessMoments = [
  {
    action: "向前走",
    heading: "马匹已经跑远，空马镫在风里甩动。",
    narration: "潮湿的衣服冻在皮肤上，钱袋被留在了客栈，马也跑远了。",
  },
  {
    action: "站稳",
    heading: "泥水没过鞋底，我每走一步，都要把脚从泥地里拔出来。",
    narration: "身后的喊声已经听不见了，但荒野并没有因此变得安全。",
  },
  {
    action: "抬起脚",
    heading: "受伤的左耳在流血，一直淌到肩上。",
    narration: "远处有一点白光，它没有靠近，也没有消失。",
  },
  {
    action: "呼吸",
    heading: "寒气把呼吸留在眼前，路已经从脚下消失。",
    narration: "我已经思考不了要往哪里走，只能努力保持身体平衡。",
  },
  {
    action: "保持清醒",
    heading: "我努力地保持清醒。",
    narration: "每一次呼吸都比上一次更沉重。",
  },
];

function beginWilderness() {
  setPhase("wilderness");
  wildernessStage.hidden = false;
  wildernessStep = 0;
  wakeRound = 0;
  wakePointerDown = false;
  wildernessAction.disabled = false;
  wildernessAction.style.setProperty("--wake-hold", 0);
  blackout.setAttribute("aria-hidden", "true");
  missionEntry.hidden = true;
  bodySignals.forEach((signal) => signal.classList.remove("visible"));
  renderWildernessMoment();
  setDot(6);
  playBreath(.75);
}

function renderWildernessMoment() {
  const moment = wildernessMoments[wildernessStep];
  wildernessHeading.textContent = moment.heading;
  wildernessNarration.textContent = moment.narration;
  wildernessActionLabel.textContent = moment.action;
}

function pulseConsciousness() {
  scene.classList.remove("blinking");
  void scene.offsetWidth;
  scene.classList.add("blinking");
  later(() => {
    if (!scene.classList.contains("collapsed")) scene.classList.remove("blinking");
  }, 900);
}

function advanceWilderness() {
  if (phase !== "wilderness" || wildernessStep >= 4) return;
  wildernessAction.disabled = true;
  playMudStep(Math.max(.45, 1 - wildernessStep * .16));
  bodySignals[wildernessStep]?.classList.add("visible");
  pulseConsciousness();
  later(() => {
    wildernessStep += 1;
    renderWildernessMoment();
  }, 390);
  later(() => {
    wildernessAction.disabled = false;
    if (wildernessStep === 3) playBreath(.7);
    if (wildernessStep === 4) playHeartbeat(.8);
  }, 920);
}

function beginWakeHold(event) {
  if (phase !== "wilderness" || wildernessStep !== 4 || wakePointerDown) return;
  event.preventDefault();
  wakePointerDown = true;
  wakeHoldStart = performance.now();
  wildernessAction.classList.add("is-holding");
  if (event.pointerId !== undefined) wildernessAction.setPointerCapture?.(event.pointerId);
  wakeFrame = requestAnimationFrame(updateWakeHold);
}

function updateWakeHold(now) {
  if (!wakePointerDown || phase !== "wilderness") return;
  const targets = [1050, 1450, 2050];
  const elapsed = now - wakeHoldStart;
  const target = targets[wakeRound];
  let progress = (elapsed / target) * 100;

  if (wakeRound === 2) {
    progress = Math.min(82, progress);
    if (elapsed >= target * .9) {
      wildernessAction.style.setProperty("--wake-hold", 82);
      collapseInWilderness();
      return;
    }
  }

  wildernessAction.style.setProperty("--wake-hold", Math.max(0, Math.min(100, progress)).toFixed(1));
  if (progress >= 100) {
    wakeRound += 1;
    playHeartbeat(Math.max(.35, .72 - wakeRound * .13));
    pulseConsciousness();
    const nextAction = wakeRound === 1 ? "呼吸" : "不要睡去";
    later(() => {
      wildernessActionLabel.textContent = nextAction;
    }, 390);
    wildernessAction.style.setProperty("--wake-hold", 0);
    wakeHoldStart = now + 620;
  }
  wakeFrame = requestAnimationFrame(updateWakeHold);
}

function cancelWakeHold() {
  if (!wakePointerDown || phase !== "wilderness") return;
  wakePointerDown = false;
  cancelAnimationFrame(wakeFrame);
  wildernessAction.classList.remove("is-holding");
  wildernessAction.style.setProperty("--wake-hold", 0);
  wildernessActionLabel.textContent = wakeRound === 0 ? "保持清醒" : wakeRound === 1 ? "呼吸" : "不要睡去";
  playBreath(.38);
}

function collapseInWilderness() {
  wakePointerDown = false;
  cancelAnimationFrame(wakeFrame);
  wildernessAction.classList.remove("is-holding");
  wildernessActionLabel.textContent = "……";
  wildernessAction.disabled = true;
  playHeartbeat(.28);
  silenceScore(1800);
  later(() => {
    playMudStep(.7);
    scene.classList.remove("blinking");
    scene.classList.add("collapsed");
    blackout.setAttribute("aria-hidden", "false");
  }, 360);
  later(wakeInMonastery, 2450);
}

function wakeInMonastery() {
  if (phase !== "wilderness" || !scene.classList.contains("collapsed")) return;
  playWoodClack(.22);
  if (embeddedInMainStory) {
    window.parent.postMessage({ type: "tienho:complete" }, window.location.origin);
    return;
  }
  wildernessStage.hidden = true;
  missionEntry.hidden = false;
  setPhase("mission");
  setDot(6);
  // 迁移进主线时，将上面的独立预览替换为现有状态跳转：go("mission")。
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  cancelAnimationFrame(gripFrame);
  cancelAnimationFrame(escapeFrame);
  cancelAnimationFrame(wakeFrame);
  pauseScore();
  currentScore = "";
  currentScoreVolume = 0;
  activeScorePlayer = 0;
  phase = "intro";
  lanternCount = 0;
  identityChoice = "";
  escapeHeld = false;
  wildernessStep = 0;
  wakeRound = 0;
  wakePointerDown = false;
  scene.className = "scene";
  scene.style.removeProperty("--crowd-opacity");
  scene.style.removeProperty("--road-shift");
  scene.style.removeProperty("--stride");
  scene.querySelectorAll(".lantern").forEach((lantern) => lantern.classList.remove("is-lit"));
  document.querySelector("#narrativeCard").className = "narrative-card";
  document.querySelector("#narrativeCard").style.opacity = "";
  eyebrow.textContent = "客栈";
  storyText.textContent = "茶还温着。萨托说起明天的计划：找到狄鑫福的遗孀，把钱和米送过去。";
  instruction.textContent = "困意渐渐袭来。";
  startButton.hidden = false;
  coinSource.style.opacity = "";
  riceTarget.classList.remove("is-complete");
  wildernessStage.hidden = true;
  blackout.setAttribute("aria-hidden", "true");
  missionEntry.hidden = true;
  identityPanel.hidden = true;
  causalChain.hidden = true;
  translationLine.hidden = true;
  motiveStrip.hidden = true;
  identityContinue.hidden = true;
  evidenceCards.forEach((card) => {
    card.disabled = false;
    card.classList.remove("is-chosen");
  });
  pressureFill.style.width = "68%";
  pressureValue.textContent = "68%";
  escapeStage.hidden = true;
  escapeStage.classList.remove("is-active");
  escapeCoins.innerHTML = "";
  wallGate.hidden = true;
  cutBagButton.disabled = false;
  cutBagButton.querySelector("span").textContent = "割断钱袋";
  wildernessAction.disabled = false;
  wildernessAction.classList.remove("is-holding");
  wildernessAction.style.setProperty("--wake-hold", 0);
  crowdSignal.innerHTML = "";
  moneyBag.style.setProperty("--hold", 0);
  setRumor("一位远道而来的陌生人", 12);
  setDot(0);
  setupPetals();
}

function coinPointerDown(event) {
  if (phase !== "coin") return;
  event.preventDefault();
  const rect = coinSource.getBoundingClientRect();
  drag = { id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
  coinSource.setPointerCapture(event.pointerId);
  coinSource.classList.add("is-dragging");
}

function coinPointerMove(event) {
  if (!drag || event.pointerId !== drag.id) return;
  const layerRect = coinSource.offsetParent.getBoundingClientRect();
  coinSource.style.left = `${event.clientX - layerRect.left - drag.x}px`;
  coinSource.style.top = `${event.clientY - layerRect.top - drag.y}px`;
}

function coinPointerUp(event) {
  if (!drag || event.pointerId !== drag.id) return;
  const target = widowTarget.getBoundingClientRect();
  const inside = event.clientX >= target.left && event.clientX <= target.right && event.clientY >= target.top && event.clientY <= target.bottom;
  drag = null;
  coinSource.classList.remove("is-dragging");
  coinSource.style.left = "";
  coinSource.style.top = "";
  if (inside) completeCoin();
}

function cancelCoinDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  drag = null;
  coinSource.classList.remove("is-dragging");
  coinSource.style.left = "";
  coinSource.style.top = "";
}

startButton.addEventListener("click", beginDream);
coinSource.addEventListener("pointerdown", coinPointerDown);
coinSource.addEventListener("pointermove", coinPointerMove);
coinSource.addEventListener("pointerup", coinPointerUp);
coinSource.addEventListener("pointercancel", cancelCoinDrag);
coinSource.addEventListener("click", () => {
  if (phase === "coin") instruction.textContent = "点击寡妇的碗，或把金币拖进碗里。";
});
widowTarget.addEventListener("click", completeCoin);
riceTarget.addEventListener("click", completeRice);
lanterns.forEach((lantern) => lantern.addEventListener("click", () => lightLantern(lantern)));
evidenceCards.forEach((card) => card.addEventListener("click", () => chooseEvidence(card)));
identityContinue.addEventListener("click", beginEscape);
moneyBag.addEventListener("pointerdown", startGrip);
moneyBag.addEventListener("pointerup", cancelGrip);
moneyBag.addEventListener("pointercancel", cancelGrip);
moneyBag.addEventListener("pointerleave", (event) => {
  if (event.buttons === 0) cancelGrip();
});
moneyBag.addEventListener("keydown", (event) => {
  if (["Enter", " "].includes(event.key) && !event.repeat) startGrip(event);
});
moneyBag.addEventListener("keyup", (event) => {
  if (["Enter", " "].includes(event.key)) cancelGrip();
});

escapeBag.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  escapeBag.setPointerCapture?.(event.pointerId);
  setEscapeHeld(true);
});
escapeBag.addEventListener("pointerup", () => setEscapeHeld(false));
escapeBag.addEventListener("pointercancel", () => setEscapeHeld(false));
escapeBag.addEventListener("keydown", (event) => {
  if (["Enter", " "].includes(event.key) && !event.repeat) {
    event.preventDefault();
    setEscapeHeld(true);
  }
});
escapeBag.addEventListener("keyup", (event) => {
  if (["Enter", " "].includes(event.key)) setEscapeHeld(false);
});
cutBagButton.addEventListener("click", cutBag);

wildernessAction.addEventListener("click", advanceWilderness);
wildernessAction.addEventListener("pointerdown", beginWakeHold);
wildernessAction.addEventListener("pointerup", cancelWakeHold);
wildernessAction.addEventListener("pointercancel", cancelWakeHold);
wildernessAction.addEventListener("keydown", (event) => {
  if (["Enter", " "].includes(event.key) && wildernessStep === 4 && !event.repeat) beginWakeHold(event);
});
wildernessAction.addEventListener("keyup", (event) => {
  if (["Enter", " "].includes(event.key)) cancelWakeHold();
});

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = `声音：${soundOn ? "开" : "关"}`;
  soundToggle.setAttribute("aria-pressed", String(!soundOn));
  if (soundOn) {
    getAudioContext();
    unlockScore();
    playWoodClack(.35);
  } else {
    pauseScore();
  }
});

setupPetals();

const previewStage = previewParams.get("stage");
if (previewStage === "identity") {
  startButton.hidden = true;
  scene.className = "scene wake-final identity";
  document.querySelector("#narrativeCard").style.opacity = "0";
  identityPanel.hidden = false;
  setDot(4);
  setRumor("带着财物的外国人", 100);
  phase = "identity";
} else if (previewStage === "escape") {
  startButton.hidden = true;
  scene.className = "scene wake-final escape";
  document.querySelector("#narrativeCard").style.opacity = "0";
  identityChoice = "sato";
  escapeStage.hidden = false;
  phase = "escape";
  setDot(5);
  updateEscapeHud();
} else if (previewStage === "wilderness") {
  startButton.hidden = true;
  document.querySelector("#narrativeCard").style.opacity = "0";
  beginWilderness();
  if (previewParams.has("autoplay")) {
    [0, 1100, 2200, 3300].forEach((delay) => later(advanceWilderness, delay));
    later(() => beginWakeHold({ preventDefault() {} }), 4500);
  }
} else if (previewStage === "mission") {
  startButton.hidden = true;
  document.querySelector("#narrativeCard").style.opacity = "0";
  missionEntry.hidden = false;
  setPhase("mission");
  setDot(6);
}
