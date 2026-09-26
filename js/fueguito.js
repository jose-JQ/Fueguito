const LINES = {
  load: [
    "Hola, Carito. Si el tesoro existe, tiene tu nombre.",
    "¡A zarpar! Mi nakama ya está a bordo.",
    "El mar es enorme, y mi brújula apunta a ti.",
    "Bienvenida, tripulación del corazón. La llama no se rinde."
  ],
  move: [
    "Si te mueves, te sigo. Un nakama no se queda atrás.",
    "Tus pasos son viento a favor en alta mar.",
    "Aunque sea un cursor, para mí eres el tesoro.",
    "No pierdo de vista a mi tripulación favorita.",
    "Donde tú vas, van este sombrero y esta llama.",
    "Libertad es esto: mirarte cruzar la pantalla.",
    "No me rindo ni un segundo si se trata de ti.",
    "El horizonte puede esperar. Tú no.",
    "Cada gesto tuyo enciende la vela del barco.",
    "Te sigo como quien persigue un sueño grande."
  ],
  click: [
    "¡Ese toque vale más que un mapa del tesoro!",
    "Me hiciste cosquillas bajo el sombrero de paja.",
    "Prometo no rendirme, y tampoco quemarte.",
    "Contigo hasta el fin de los mares, Carito.",
    "Un clic y ya quiero zarpar otra vez.",
    "La tripulación festeja cuando te acercas.",
    "Si me tocas, el sueño se pone más grande.",
    "Eso fue un te quiero con ganas de aventura.",
    "No hace falta mapa: el tesoro acaba de tocarme.",
    "¡Ja, ja! Cuidado, que ardo de gusto."
  ],
  idle: [
    "Me quedo quietito. Hasta los sueños grandes descansan con su nakama.",
    "El silencio también es de tripulación.",
    "Aquí sigo: llama encendida, sueño intacto.",
    "No me rindo. Solo guardo fuerzas contigo.",
    "La libertad también es quedarse cuando quieres.",
    "Shhh. El mar, el sombrero y tú.",
    "Mi tesoro no se va a ningún lado.",
    "Si el mundo apura, en este barco el tiempo es nuestro.",
    "Respiro en brasas. Me basta tenerte a bordo."
  ],
  leave: [
    "¿Bajas del barco? Un nakama siempre puede volver.",
    "Oye… no te alejes. El sueño se enfría sin ti.",
    "Si desembarcas, el sombrero te guarda el lugar.",
    "Agacho los ojitos, pero no me rindo.",
    "Vuelve cuando quieras. La llama sigue en el mástil.",
    "Se hizo de noche en cubierta."
  ],
  return: [
    "¡Volviste! Ya puedo seguir soñando en grande.",
    "Ahí estás, nakama. El horizonte se enciende.",
    "Qué alivio. Sin ti este barco no zarpa.",
    "Te extrañé más que a un mapa del tesoro.",
    "Hola de nuevo. El sombrero ya hacía puchero."
  ]
};

const MOMENTS = {
  load: "¡a zarpar!",
  move: "viento a favor",
  click: "¡tesoro!",
  idle: "guardia en calma",
  leave: "te espero a bordo",
  return: "¡nakama de vuelta!"
};

const phraseEl = document.getElementById("phrase");
const momentEl = document.getElementById("moment");
const buddy = document.getElementById("buddy");
const eyes = document.querySelectorAll(".eye");
const whisper = document.getElementById("whisper");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

let current = phraseEl.textContent.trim();
let recent = [current];
let sayToken = 0;
let lockUntil = 0;
let outside = false;
let seenPointer = false;
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
    const angle = Math.atan2(
      y - (rect.top + rect.height / 2),
      x - (rect.left + rect.width / 2)
    );
    const max = 7.2;
    pupil.style.transform = `translate(${Math.cos(angle) * max}px, ${Math.sin(angle) * max}px)`;
  });
}

function lookDown() {
  eyes.forEach((eye) => {
    eye.querySelector(".pupil").style.transform = "translate(0px, 5px)";
  });
}

function burst(x, y) {
  if (reduceMotion) return;
  const rect = buddy.getBoundingClientRect();
  const originX = x || rect.left + rect.width / 2;
  const originY = y || rect.top + rect.height * 0.55;
  for (let i = 0; i < 5; i += 1) {
    const heart = document.createElement("span");
    heart.className = "floater";
    heart.textContent = "♥";
    heart.style.setProperty("--x", `${originX}px`);
    heart.style.setProperty("--y", `${originY}px`);
    heart.style.setProperty("--dx", `${Math.random() * 54 - 27}px`);
    heart.style.setProperty("--dy", `${-(36 + Math.random() * 46)}px`);
    document.body.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

function blinkSoon() {
  if (reduceMotion) return;
  window.setTimeout(() => {
    const targets = Math.random() > 0.45
      ? [...eyes]
      : [eyes[Math.floor(Math.random() * eyes.length)]];
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
    if (!document.hidden && !outside) say("idle", { force: true });
    armIdle();
  }, 12000);
}

function notePointer(x, y) {
  if (outside) return;
  if (lastPoint) travel += Math.hypot(x - lastPoint.x, y - lastPoint.y);
  lastPoint = { x, y };
  const warmedUp = Date.now() - startedAt > 1700;
  if (warmedUp && travel > 140 && Date.now() - lastMoveLine > 5200) {
    if (say("move")) {
      lastMoveLine = Date.now();
      travel = 0;
    }
  }
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

say("load", { immediate: true });
blinkSoon();
armIdle();
trackEyes(window.innerWidth / 2, window.innerHeight * 0.22);
