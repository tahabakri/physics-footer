# Physics Footer

> A portfolio landing page where the footer is a playground. Scroll down and your skill
> tags **fall in, pile up, and stay grabbable** — fling them around, or drop your own.
> A real-time 2D rigid-body simulation driving plain DOM elements.

**[▶ Try the live demo](https://tahabakri.github.io/physics-footer/)** · Built with **Matter.js** + vanilla JS, bundled with **Vite**.

> Best experienced with a cursor — scroll to the footer, then grab a tag and throw it.

<!-- To add a preview here, record a short screen capture of the live demo (a GIF shows the
     tags falling + a drag), drop it in docs/, and uncomment: ![Physics Footer](docs/preview.gif) -->

---

## Features

- **Real rigid-body physics** — tags are pill-shaped bodies with gravity, friction, bounce, and collisions (Matter.js).
- **Grab & fling** — drag any tag; release to throw it with natural momentum.
- **Add your own** — type a word and drop it into the pile live.
- **Scroll-triggered cascade** — the tags drop in when the footer scrolls into view.
- **Responsive & touch-friendly** — rebuilds its boundaries on resize; works on mobile.
- **Lean** — one runtime dependency (Matter.js). No framework.

## How it works

The footer runs a headless Matter.js world while the **DOM stays the renderer**:

1. **Body ↔ element pairing.** Each skill tag is a real `<div>` *and* a matching rounded
   rectangle (`chamfer`) rigid body. The element is measured first (`offsetWidth/Height`)
   so the physics body matches the rendered pill exactly.
2. **Sync every frame.** A `requestAnimationFrame` loop copies each body's position and
   angle onto its element via a CSS `transform` — so what you see *is* the simulation.
3. **Invisible walls.** Static bodies form the floor and sides immediately; a "lid" is
   added a beat later, after the cascade has fallen in, so nothing escapes.
4. **Drag that feels right.** A `MouseConstraint` grabs a tag; while held, its inertia is
   frozen (no wild spinning) and restored on release for a natural throw.
5. **Start on scroll.** An `IntersectionObserver` boots the engine only when the footer is
   visible, so the page stays idle until you reach it.

All tunables (gravity, bounciness, drag stiffness, tag cap…) live in one `config` object
at the top of [`src/main.js`](src/main.js).

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
