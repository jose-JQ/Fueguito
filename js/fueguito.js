const LINES = {
  load: [
    "Hola, Carito. Esta llamita se encendió pensando en ti.",
    "Para ti: un fueguito que no piensa apagarse.",
    "Ya estás aquí. Qué bonito se pone todo."
  ],
  move: [
    "Si te mueves, te sigo. Así de simple.",
    "Tus pasos por la pantalla me encienden despacito.",
    "Te miro con ojitos de brasa, sin prisa.",
    "No te vayas muy lejos: me gusta tenerte cerca.",
    "Cada movimiento tuyo es un poquito de aire para la llama.",
    "Donde tú vas, va este calorcito.",
    "Quédate un ratito más. Contigo no hace frío.",
    "Te sigo como quien no quiere perderse ni un gesto.",
    "Aunque sea un cursor, para mí eres tú.",
    "Mírame tú también, aunque sea un segundo."
  ],
  click: [
    "Ay… eso se sintió como un besito.",
    "Me hiciste cosquillas. Prometo no quemarte.",
    "Ese toque me llegó derechito al centro.",
    "Otra vez, si quieres. Me gusta cuando te acercas.",
    "Te devuelvo un abrazo calentito.",
    "Cuidado: si me tocas así, ardo más bonito.",
    "Gracias por acercarte. Se nota el cariño.",
    "Eso fue un te quiero disfrazado de clic.",
    "Suave… soy chiquito, pero te siento.",
    "¿Viste? Hasta las chispas se pusieron contentas."
  ],
  idle: [
    "Me quedo quietito contigo. No hace falta hablar.",
    "El silencio también puede ser cariñoso.",
    "Aquí sigo, ardiendo bajito.",
    "A veces querer es solo quedarse.",
    "No tengo prisa. Este es un buen lugar.",
    "Si el mundo apura, aquí el tiempo va más despacio.",
    "Respiro en brasas. Me basta con que estés.",
    "Shhh. Solo la llama y tú.",
    "Me gusta esta calma. Se parece a estar cerca."
  ],
  leave: [
    "¿Te vas? La ventana se quedó un poquito fría.",
    "Oye… no te alejes tanto.",
    "Si sales, deja la puerta entreabierta. Te espero.",
    "Agacho los ojitos cuando no te veo.",
    "Vuelve cuando quieras. La llama sigue aquí.",
    "Se hizo más oscuro de pronto."
  ],
  return: [
    "Volviste. Se me encendió todo otra vez.",
    "Ahí estás. Ya puedo seguir mirándote.",
    "Qué alivio. El frío dura poco si regresas.",
    "Te extrañé, aunque solo fueran unos segundos.",
    "Hola de nuevo. Ya estaba haciendo puchero."
  ],
  musicOn: [
    "Esta canción también es para ti.",
    "Súbele un poquito… suena a nosotros.",
    "Música bajita y una llama. Casi un abrazo.",
    "Escúchala con calma. Va con el fueguito."
  ],
  musicOff: [
    "Silencio, pero sigo aquí, calentito.",
    "Apagué la música, no el cariño.",
    "Así también está bonito: solo la llama."
  ],
  video: [
    "Hay un recuerdito guardado aquí, solo para ti.",
    "Míralo despacito. Esto también es nuestro.",
    "Un pedacito de nosotros, por si quieres verlo."
  ],
  videoEnd: [
    "Se acabó el video, pero yo me quedo contigo.",
    "Listo. Volvemos a la llamita, que es más de quedarse.",
    "Gracias por mirarlo. El fueguito sigue encendido."
  ]
};

const MOMENTS = {
  load: "recién encendido",
  move: "siguiéndote",
  click: "cosquillitas",
  idle: "en calma",
  leave: "te espera",
  return: "volviste",
  musicOn: "nuestra canción",
  musicOff: "en silencio",
  video: "un recuerdito",
  videoEnd: "otra vez juntos"
};

const phraseEl = document.getElementById("phrase");
const momentEl = document.getElementById("moment");
const buddy = document.getElementById("buddy");
const eyes = document.querySelectorAll(".eye");
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");
const musicLabel = document.getElementById("music-label");
const playBtn = document.getElementById("play-btn");
const theater = document.getElementById("theater");
const theaterNote = document.getElementById("theater-note");
const closeVideoBtn = document.getElementById("close-video");
const video = document.getElementById("main-video");
const whisper = document.getElementById("whisper");
const embers = document.getElementById("embers");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

let current = phraseEl.textContent;
let recent = [current];
let sayToken = 0;
let lockUntil = 0;
let outside = false;
let seenPointer = false;
let resumeMusic = false;
let lastMoveLine = 0;
let travel = 0;
let lastPoint = null;
const startedAt = Date.now();

if (coarsePointer) {
  whisper.textContent = "Tócalo o quédate un ratito.";
}

function pick(kind) {
  const list = LINES[kind];
  const unused = list.filter((line) => line !== current && !recent.includes(line));
  const pool = unused.length ? unused : list.filter((line) => line !== current);
  const source = pool.length ? pool : list;
  return source[Math.floor(Math.random() * source.length)];
}

function say(kind, { force = false, immediate = false } = {}) {
  const now = Date.now();
  if (!force && !immediate && now < lockUntil) return false;

  const line = pick(kind);

  current = line;
  recent.push(line);
  if (recent.length > 8) recent.shift();
  lockUntil = now + (force || immediate ? 900 : 2600);

  const token = ++sayToken;
  const paint = () => {
    if (token !== sayToken) return;
    phraseEl.textContent = line;
    momentEl.textContent = MOMENTS[kind];
    phraseEl.classList.remove("is-out");
    momentEl.classList.remove("is-out");
  };

  if (immediate || reduceMotion) {
    paint();
    return true;
  }

  phraseEl.classList.add("is-out");
  momentEl.classList.add("is-out");
  window.setTimeout(paint, 280);
  return true;
}

function trackEyes(x, y) {
  eyes.forEach((eye) => {
    const pupil = eye.querySelector(".pupil");
    const rect = eye.getBoundingClientRect();
    const angle = Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2));
    const max = 6.4;
    pupil.style.transform = `translate(${Math.cos(angle) * max}px, ${Math.sin(angle) * max}px)`;
  });
}

function lookDown() {
  eyes.forEach((eye) => {
    eye.querySelector(".pupil").style.transform = "translate(0px, 4px)";
  });
}

function spawnEmbers() {
  if (reduceMotion) return;
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const ember = document.createElement("span");
    ember.className = "ember";
    const size = 2 + Math.random() * 3.2;
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.animationDuration = `${8 + Math.random() * 9}s`;
    ember.style.animationDelay = `${-Math.random() * 14}s`;
    ember.style.setProperty("--drift", `${Math.random() * 70 - 35}px`);
    ember.style.opacity = String(0.35 + Math.random() * 0.55);
    embers.appendChild(ember);
  }
}

function burst(x, y) {
  if (reduceMotion) return;
  const rect = buddy.getBoundingClientRect();
  const originX = x || rect.left + rect.width / 2;
  const originY = y || rect.top + rect.height / 2;
  for (let i = 0; i < 6; i += 1) {
    const heart = document.createElement("span");
    heart.className = "floater";
    heart.textContent = "♥";
    heart.style.setProperty("--x", `${originX}px`);
    heart.style.setProperty("--y", `${originY}px`);
    heart.style.setProperty("--dx", `${Math.random() * 54 - 27}px`);
    heart.style.setProperty("--dy", `${-(32 + Math.random() * 48)}px`);
    document.body.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

function blinkSoon() {
  if (reduceMotion) return;
  window.setTimeout(() => {
    const targets = Math.random() > 0.45 ? [...eyes] : [eyes[Math.floor(Math.random() * eyes.length)]];
    targets.forEach((eye) => eye.classList.add("blink"));
    window.setTimeout(() => {
      targets.forEach((eye) => eye.classList.remove("blink"));
    }, 190);
    blinkSoon();
  }, 2400 + Math.random() * 2600);
}

let idleTimer = 0;
function armIdle() {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    if (!document.hidden && theater.hidden && !outside) {
      say("idle", { force: true });
    }
    armIdle();
  }, 12000);
}

function notePointer(x, y) {
  if (outside) return;
  if (lastPoint) {
    travel += Math.hypot(x - lastPoint.x, y - lastPoint.y);
  }
  lastPoint = { x, y };
  const warmedUp = Date.now() - startedAt > 1700;
  if (warmedUp && travel > 140 && Date.now() - lastMoveLine > 5200) {
    if (say("move")) {
      lastMoveLine = Date.now();
      travel = 0;
    }
  }
}

function updateMusicButton(playing) {
  musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
  musicLabel.textContent = playing ? "pausar canción" : "poner canción";
}

function openTheater() {
  resumeMusic = !music.paused;
  music.pause();
  updateMusicButton(false);
  const line = pick("video");
  current = line;
  recent.push(line);
  if (recent.length > 8) recent.shift();
  theaterNote.textContent = line;
  momentEl.textContent = MOMENTS.video;
  phraseEl.textContent = line;
  theater.hidden = false;
  video.currentTime = 0;
  video.play().catch(() => {});
}

function closeTheater() {
  if (theater.hidden) return;
  video.pause();
  theater.hidden = true;
  if (resumeMusic) {
    music.play().then(() => updateMusicButton(true)).catch(() => updateMusicButton(false));
  }
  say("videoEnd", { force: true });
}

document.addEventListener("mousemove", (event) => {
  seenPointer = true;
  if (outside) return;
  trackEyes(event.clientX, event.clientY);
  notePointer(event.clientX, event.clientY);
  armIdle();
});

document.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (!touch) return;
  seenPointer = true;
  trackEyes(touch.clientX, touch.clientY);
  armIdle();
}, { passive: true });

document.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (!touch) return;
  trackEyes(touch.clientX, touch.clientY);
  notePointer(touch.clientX, touch.clientY);
  armIdle();
}, { passive: true });

document.documentElement.addEventListener("mouseleave", () => {
  if (!seenPointer || outside) return;
  outside = true;
  document.body.classList.add("is-away");
  lookDown();
  say("leave", { force: true });
});

document.documentElement.addEventListener("mouseenter", () => {
  if (!outside) return;
  outside = false;
  document.body.classList.remove("is-away");
  say("return", { force: true });
  armIdle();
});

buddy.addEventListener("click", (event) => {
  say("click", { force: true });
  buddy.classList.remove("boop");
  void buddy.offsetWidth;
  buddy.classList.add("boop");
  burst(event.clientX, event.clientY);
  armIdle();
});

musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => {
      updateMusicButton(true);
      say("musicOn", { force: true });
    }).catch(() => updateMusicButton(false));
  } else {
    music.pause();
    updateMusicButton(false);
    say("musicOff", { force: true });
  }
  armIdle();
});

playBtn.addEventListener("click", () => {
  openTheater();
  armIdle();
});

closeVideoBtn.addEventListener("click", closeTheater);

video.addEventListener("ended", closeTheater);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTheater();
});

say("load", { immediate: true });
spawnEmbers();
blinkSoon();
armIdle();
trackEyes(window.innerWidth / 2, window.innerHeight * 0.25);
music.volume = 0.55;
music.play().then(() => updateMusicButton(true)).catch(() => updateMusicButton(false));
