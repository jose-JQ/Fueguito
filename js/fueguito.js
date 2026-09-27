const LINES = {
  load: [
    "Hola, Carito. Te amo, y esta llamita también.",
    "Qué bonito que llegaste. Hoy quiero cuidarte despacito.",
    "Para ti, con todo el cariño que me cabe en el pecho.",
    "Si el día pesa, aquí hay un abrazo calentito.",
    "Eres capaz de lo bonito que te propones, mi amor."
  ],
  move: [
    "Si te mueves, te sigo. Así de enamorado estoy.",
    "Te miro con ojitos suaves. No tengas prisa.",
    "Cada pasito tuyo me da ganas de decirte te amo.",
    "Quédate cerca. Contigo el mundo se siente más amable.",
    "Eres luz, aunque sea a través de una pantalla.",
    "Ánimo, Carito. Vas muy bien, aunque no lo notes.",
    "Donde tú vas, va este cariño.",
    "No tienes que poder con todo. Yo estoy aquí.",
    "Un nakama de verdad no te suelta. Yo tampoco.",
    "Sueña en grande. Yo creo en ti."
  ],
  click: [
    "Te amo. Así, sencillito, porque es verdad.",
    "Ese toque me llegó al corazón.",
    "Ay… cosquillas. Prometo no quemarte.",
    "Gracias por acercarte. Se siente como un beso.",
    "Eres valiente hasta cuando estás cansada.",
    "Tómate un respiro. Mereces ternura.",
    "Si hoy dudaste, yo no dudo de ti.",
    "Un abrazo calentito, de los que abrigan de verdad.",
    "No te rindas, mi amor. Yo sigo aquí contigo.",
    "Eres mi tesoro más suave."
  ],
  idle: [
    "Me quedo quietito contigo. No hace falta hablar.",
    "El silencio también puede decir te amo.",
    "Respira. Estás haciendo suficiente.",
    "Aquí sigo, ardiendo bajito, por si me necesitas.",
    "Eres mi calma favorita.",
    "Ánimo, despacio. Los sueños también caminan.",
    "La libertad también es descansar, Carito.",
    "Shhh. Solo la llama y tú.",
    "Te quiero en los ratos quietos, que son los más honestos."
  ],
  leave: [
    "¿Te vas? Te amo igual desde aquí.",
    "Si sales, deja la puerta abierta. Te espero con cariño.",
    "Oye… vuelve cuando quieras. No hay prisa.",
    "Agacho los ojitos, pero el amor se queda.",
    "Cuídate un poquito, ¿sí?",
    "La noche se pone más fría si no estás."
  ],
  return: [
    "Volviste. Se me ilumina todo, Carito.",
    "Ahí estás. Ya puedo decirte te amo otra vez.",
    "Qué alivio. Te extrañé en esos segundos.",
    "Hola, mi amor. El sombrerito ya hacía puchero.",
    "Qué bonito regreso. Sigue, que yo te acompaño."
  ]
};

const DAILY = [
  "Eres mi tesoro.",
  "Eres mi sol.",
  "Eres mi nakama.",
  "Eres valiente.",
  "Eres mi calma.",
  "Eres mi sueño bonito.",
  "Eres luz, Carito.",
  "Eres mi lugar seguro.",
  "Eres ternura que no se apaga.",
  "Eres libre, y yo te quiero así.",
  "Eres mi razón para no rendirme.",
  "Eres el abrazo que el mar no puede dar."
];

const MOMENTS = {
  load: "te estaba esperando",
  move: "te miro",
  click: "te amo",
  idle: "en calma",
  leave: "te espero",
  return: "volviste"
};

const phraseEl = document.getElementById("phrase");
const momentEl = document.getElementById("moment");
const buddy = document.getElementById("buddy");
const eyes = document.querySelectorAll(".eye");
const whisper = document.getElementById("whisper");
const dayBtn = document.getElementById("day-btn");
const dayModal = document.getElementById("day-modal");
const dayLine = document.getElementById("day-line");
const dayClose = document.getElementById("day-close");

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

function dailyLine() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  return DAILY[(now.getFullYear() + day) % DAILY.length];
}

function openDaily() {
  dayLine.textContent = dailyLine();
  dayModal.hidden = false;
  dayClose.focus();
}

function closeDaily() {
  if (dayModal.hidden) return;
  dayModal.hidden = true;
  dayBtn.focus();
}

dayBtn.addEventListener("click", openDaily);
dayClose.addEventListener("click", closeDaily);
dayModal.addEventListener("click", (event) => {
  if (event.target === dayModal) closeDaily();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDaily();
});

say("load", { immediate: true });
blinkSoon();
armIdle();
trackEyes(window.innerWidth / 2, window.innerHeight * 0.22);
