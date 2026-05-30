import './style.css'
import Matter from 'matter-js'

const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter

/* All physics behaviour lives here — tweak the scene without hunting through code. */
const config = {
  gravityY: 1,
  restitution: 0.45,    // bounciness
  friction: 0.35,       // surface slide
  frictionAir: 0.02,    // air drag
  density: 0.0014,      // weight
  wallThickness: 240,   // invisible boundaries
  dragStiffness: 0.18,  // how tightly tags follow the cursor
  maxTags: 42,          // cap to keep the sim stable
  animateOnScroll: true // true = drop in when the footer scrolls into view; false = on load
}

const initialTags = [
  { t: "Taha Bakri", cls: "object--lg object--accent" },
  { t: "Frontend Engineer", cls: "object--accent" },
  { t: "React" }, { t: "TypeScript" }, { t: "Vite" }, { t: "Node.js" },
  { t: "Tailwind" }, { t: "Three.js" }, { t: "WebGL" }, { t: "Framer Motion" },
  { t: "Figma" }, { t: "Git" }, { t: "Postgres" },
  { t: "Coffee", cls: "object--accent" }, { t: "Football" },
  { t: "Late nights" }, { t: "Open source" }
]

const container = document.getElementById("object-container")
const footer = document.getElementById("footer")

let engine, runner
let bodies = []           // { body, el, w, h }
let walls = { bottom: null, left: null, right: null, top: null }
let dims = { w: 0, h: 0 }
let dragging = null
let startPromise = null

/* Rebuild the invisible boundaries (top is optional / delayed). */
function buildWalls(includeTop) {
  const t = config.wallThickness
  const { w, h } = dims
  const remove = (b) => b && Composite.remove(engine.world, b)

  remove(walls.bottom); remove(walls.left); remove(walls.right)
  walls.bottom = Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, { isStatic: true })
  walls.left = Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, { isStatic: true })
  walls.right = Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, { isStatic: true })
  Composite.add(engine.world, [walls.bottom, walls.left, walls.right])

  if (includeTop) {
    remove(walls.top)
    walls.top = Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, { isStatic: true })
    Composite.add(engine.world, walls.top)
  }
}

/* Create one tag: DOM element + matching physics body, dropped from above. */
function spawnTag(text, cls) {
  if (bodies.length >= config.maxTags) return

  const el = document.createElement("div")
  el.className = "object" + (cls ? " " + cls : "")
  el.textContent = text            // textContent — never inject HTML
  container.appendChild(el)

  const w = el.offsetWidth          // forces layout so measurements are real
  const h = el.offsetHeight
  const x = Math.random() * (dims.w - w) + w / 2
  const y = -(Math.random() * 240 + 60)
  const angle = (Math.random() - 0.5) * 0.9

  const body = Bodies.rectangle(x, y, w, h, {
    restitution: config.restitution,
    friction: config.friction,
    frictionAir: config.frictionAir,
    density: config.density,
    angle,
    chamfer: { radius: Math.min(w, h) / 2 - 2 }  // rounded (pill) collision shape
  })

  Composite.add(engine.world, body)
  bodies.push({ body, el, w, h })
}

function clearTags() {
  for (const { body, el } of bodies) {
    Composite.remove(engine.world, body)
    el.remove()
  }
  bodies = []
}

/* (Re)populate with the initial set, staggered for a cascade. */
function populate() {
  clearTags()
  const stagger = 110
  initialTags.forEach((tag, i) => setTimeout(() => spawnTag(tag.t, tag.cls), i * stagger))
  // add the lid only once the last tag has had time to fall in
  setTimeout(() => buildWalls(true), initialTags.length * stagger + 1600)
}

/* Sync every DOM element to its physics body each frame. */
function syncLoop() {
  for (const { body, el, w, h } of bodies) {
    el.style.transform =
      `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`
  }
  requestAnimationFrame(syncLoop)
}

/* Soft boundary: keep a dragged tag inside the container. */
function clampDragged() {
  if (!dragging) return
  const entry = bodies.find((b) => b.body === dragging)
  if (!entry) return
  const { w, h } = entry
  const x = Math.max(w / 2, Math.min(dims.w - w / 2, dragging.position.x))
  const y = Math.max(h / 2, Math.min(dims.h - h / 2, dragging.position.y))
  Body.setPosition(dragging, { x, y })
}

function setupMouse() {
  const mouse = Mouse.create(container)
  // stop Matter from hijacking the page scroll wheel
  mouse.element.removeEventListener("wheel", mouse.mousewheel)
  mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel)

  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: config.dragStiffness, render: { visible: false } }
  })
  Composite.add(engine.world, mc)

  container.addEventListener("contextmenu", (e) => e.preventDefault())

  Events.on(mc, "startdrag", (e) => {
    dragging = e.body
    if (dragging) {
      dragging.__inertia = dragging.inertia
      Body.setInertia(dragging, Infinity)       // hold steady, no spin while held
      Body.setVelocity(dragging, { x: 0, y: 0 })
      Body.setAngularVelocity(dragging, 0)
      document.body.classList.add("is-grabbing")
    }
  })
  Events.on(mc, "enddrag", () => {
    if (dragging) Body.setInertia(dragging, dragging.__inertia || 1)
    dragging = null
    document.body.classList.remove("is-grabbing")
  })
}

async function init() {
  await document.fonts.ready        // measure tags with the real font loaded
  const r = container.getBoundingClientRect()
  dims = { w: r.width, h: r.height }

  engine = Engine.create()
  engine.gravity.y = config.gravityY
  engine.positionIterations = 10
  engine.velocityIterations = 10
  engine.constraintIterations = 4

  buildWalls(false)                 // sides + floor only, so tags can fall in
  setupMouse()
  Events.on(engine, "beforeUpdate", clampDragged)

  runner = Runner.create()
  Runner.run(runner, engine)

  populate()
  syncLoop()
}

function ensureStarted() {
  if (!startPromise) startPromise = init()
  return startPromise
}

/* Keep walls correct on resize. */
let resizeTimer
window.addEventListener("resize", () => {
  if (!engine) return
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const r = container.getBoundingClientRect()
    dims = { w: r.width, h: r.height }
    buildWalls(!!walls.top)
  }, 200)
})

/* Controls */
const input = document.getElementById("tag-input")
function addFromInput() {
  const v = input.value.trim()
  if (!v) return
  ensureStarted().then(() => spawnTag(v, ""))
  input.value = ""
}
document.getElementById("drop-btn").addEventListener("click", addFromInput)
document.getElementById("reset-btn").addEventListener("click", () => ensureStarted().then(populate))
input.addEventListener("keydown", (e) => { if (e.key === "Enter") addFromInput() })

/* Trigger */
if (config.animateOnScroll) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { ensureStarted(); io.disconnect() }
    })
  }, { threshold: 0.25 })
  io.observe(footer)
} else {
  window.addEventListener("load", ensureStarted)
}
