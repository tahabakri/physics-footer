# physics-footer

> Drop **real physics** onto any set of HTML elements. A small, dependency-light component
> that turns ordinary DOM nodes into draggable, throwable, colliding bodies — grab them,
> fling them, watch them pile up. Fork it, swap the tags for your own, tune one config
> object. The live demo *is* the documentation.

**[▶ Live demo](https://tahabakri.github.io/physics-footer/)** · **Vanilla JS** + **[Matter.js](https://brm.io/matter-js/)**, bundled with **Vite**. MIT — free to fork and reuse.

> Best experienced with a cursor — scroll to the footer, then grab a tag and throw it.

<!-- To add a preview here, record a short screen capture of the live demo (a GIF shows the
     tags falling + a drag), drop it in docs/, and uncomment: ![physics-footer](docs/preview.gif) -->

---

## Features

- **Real rigid-body physics on plain HTML** — gravity, friction, bounce, and collisions via Matter.js. No `<canvas>`; your elements stay in the DOM.
- **Grab & fling** — drag any element; release to throw it with natural momentum.
- **Add elements live** — type a word and drop it into the pile; reset to start over.
- **Scroll-triggered** — the cascade fires when the section scrolls into view (or on load — one flag).
- **Responsive & touch-friendly** — rebuilds its boundaries on resize; works on mobile.
- **Lean** — one runtime dependency (Matter.js). No framework.

## How it works

The section runs a headless Matter.js world while the **DOM stays the renderer**:

1. **Body ↔ element pairing.** Each tag is a real `<div>` *and* a matching rounded
   rectangle (`chamfer`) rigid body. The element is measured first (`offsetWidth/Height`)
   so the physics body matches the rendered pill exactly.
2. **Sync every frame.** A `requestAnimationFrame` loop copies each body's position and
   angle onto its element via a CSS `transform` — so what you see *is* the simulation.
3. **Invisible walls.** Static bodies form the floor and sides immediately; a "lid" is
   added a beat later, after the cascade has fallen in, so nothing escapes.
4. **Drag that feels right.** A `MouseConstraint` grabs a tag; while held, its inertia is
   frozen (no wild spinning) and restored on release for a natural throw.
5. **Start on scroll.** An `IntersectionObserver` boots the engine only when the section is
   visible, so the page stays idle until you reach it.

## Configure it

Every knob lives in one `config` object at the top of [`src/main.js`](src/main.js) — edit
the values, there's no API to learn. Defaults:

| Option | Default | What it does |
|---|---|---|
| `gravityY` | `1` | Downward gravity strength. `0` = float; higher = faster, heavier fall. |
| `restitution` | `0.45` | Bounciness on impact (`0` = no bounce, `1` = very bouncy). |
| `friction` | `0.35` | Surface friction as bodies slide and settle against each other. |
| `frictionAir` | `0.02` | Air drag — higher values slow bodies down mid-flight. |
| `density` | `0.0014` | Mass per unit area; affects how heavy a tag feels when thrown. |
| `wallThickness` | `240` | Thickness (px) of the invisible floor / side / lid walls. |
| `dragStiffness` | `0.18` | How tightly a grabbed tag tracks the cursor (`0`–`1`). |
| `maxTags` | `42` | Hard cap on the number of bodies, to keep the simulation stable. |
| `animateOnScroll` | `true` | `true` = drop in when the section scrolls into view; `false` = on page load. |

To change which elements fall in, edit the `initialTags` array just below `config` — each
entry is `{ t: "label" }`, with an optional `cls` (e.g. `object--accent`, `object--lg`).

## Tech stack

| | |
|---|---|
| Physics | [Matter.js](https://brm.io/matter-js/) |
| App | Vanilla JS (ES modules), DOM-driven rendering |
| Build | [Vite](https://vitejs.dev/) |
| Type | Fraunces + Space Mono (Google Fonts) |
| Deploy | GitHub Pages via GitHub Actions |

## Run locally

```bash
git clone https://github.com/tahabakri/physics-footer.git
cd physics-footer
npm install
npm run dev        # http://localhost:5173
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

## License

[MIT](LICENSE) © Taha Bakri
