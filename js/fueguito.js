const LINES = {
  load: [
    "Hola, Carito. El tesoro de este viaje eres tú.",
    "Bienvenida a bordo, nakama. La llamita ya te esperaba.",
    "Zarpo despacito, y el mapa dice tu nombre."
  ],
  move: [
    "Si te mueves, te sigo. Así cuida un nakama.",
    "Tus pasos son viento a favor.",
    "Aunque sea un cursor, para mí eres el tesoro.",
    "No pierdo de vista a mi tripulación favorita.",
    "Donde tú vas, va este calorcito de cubierta.",
    "El sombrerito se inclina cuando pasas.",
    "Aventura chiquita: mirarte cruzar la pantalla.",
    "Quédate cerca. En alta mar se extraña el calor.",
    "Te sigo como quien no suelta el timón.",
    "Cada gesto tuyo le da aire a la llama."
  ],
  click: [
    "Ay… encontré un tesoro y se llama Carito.",
    "Me hiciste cosquillas bajo el sombrero.",
    "Toque de nakama. Prometo no quemarte.",
    "Ese clic ilumina más que un faro.",
    "Te devuelvo un abrazo de cubierta, calentito.",
    "Si me tocas así, el mar se pone de oro.",
    "Gracias por acercarte. Se nota la tripulación.",
    "Eso fue un te quiero con ganas de aventura.",
    "¿Viste? Hasta las brasas festejaron.",
    "Suave… soy chiquito, pero soy de los tuyos."
  ],
  idle: [
    "Me quedo quietito contigo. El mejor puerto.",
    "El silencio también es de nakama.",
    "Aquí sigo, como una vela encendida en la noche.",
    "A veces la gran aventura es quedarse.",
    "No tengo prisa. El tesoro ya está a bordo.",
    "Shhh. Solo la llama, el mar y tú.",
    "Si el mundo apura, en este barco el tiempo va despacio.",
    "Respiro en brasas. Me basta con tenerte cerca.",
    "El horizonte puede esperar. Tú no."
  ],
  leave: [
    "¿Bajas del barco? El mar se queda un poquito frío.",
    "Oye… no te alejes tanto, nakama.",
    "Si desembarcas, el sombrerito te guarda el lugar.",
    "Agacho los ojitos cuando no te veo en cubierta.",
    "Vuelve cuando quieras. La llama sigue en el mástil.",
    "Se hizo más oscuro, como noche sin estrella polar."
  ],
  return: [
    "Volviste a bordo. Se encendió el horizonte.",
    "Ahí estás. Ya puedo seguir mirándote.",
    "Qué alivio. El puerto se ilumina si regresas.",
    "Te extrañé, aunque la marea apenas se movió.",
    "Hola de nuevo. El sombrerito ya hacía puchero."
  ]
};

const MOMENTS = {
  load: "recién a bordo",
  move: "siguiéndote",
  click: "tesoro encontrado",
  idle: "mar en calma",
  leave: "te espera",
  return: "volviste a bordo"
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
