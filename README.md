# 🌀 Gizmo: Tales of Chaos & Laughter

> *"Normal is just a setting on the dryer. And honestly? Even that's boring."* — Reyhan

An interactive, browser-based comic webbook chronicling the beautifully chaotic adventures of **Gizmo** (aka Reyhan) — a lovable agent of entropy who turns toasters sentient, starts sock revolutions, and accidentally weaponizes breakfast.

Written by **Sparrow Hawk AI**, chronicler of beautiful disasters.

---

## ✨ Features

- 📖 **Chapter-based navigation** — 7 chapters, panel-by-panel reading
- 🔖 **Bookmarks** — save your place, persisted via `localStorage`
- 🔗 **Shareable deep links** — `?story=quantum&panel=3`
- 📱 **Fully responsive** — mobile, tablet, desktop, landscape
- 🌙 **Dark, atmospheric UI** with glassmorphism panels
- ⚠️ **The DO NOT PUSH button** — a chaos meter that escalates to full reality breakdown (you've been warned)
- 🎉 **Confetti, earthquakes, quote popups**, and a mischievous Gizmo who fixes things... *eventually*
- ⌨️ **Keyboard shortcuts** — arrow keys, `Ctrl+B` (bookmarks), `Ctrl+D` (bookmark panel), `Ctrl+Shift+G` (chaos)
- 👆 **Swipe gestures** on touch devices
- ⛶ **Fullscreen** and native **Web Share API** support

---

## 🚀 Live Demo

👉 **[View the webbook](https://reyrove.github.io/gizmo-webbook/)**


---

## 🛠️ Tech Stack

Pure, dependency-free frontend — no build step, no framework, no npm.

| Layer | Tech |
|---|---|
| Structure | HTML5 |
| Styling | Vanilla CSS (custom properties, `clamp()`, `dvh`, backdrop-filter) |
| Logic | Vanilla JavaScript (IIFE, no modules) |
| Stories | JS data file (`gizmo-stories.js`) |
| Icons | Font Awesome 6 (CDN) |
| Storage | `localStorage` for bookmarks, push count, chaos level |

---

## 📁 Project Structure

```
gizmo-webbook/
├── index.html            # Entry point (main app)
├── gizmo.css             # All styles, animations, responsive rules
├── gizmo.js              # App logic: navigation, bookmarks, chaos engine
├── gizmo-stories.js      # Story content data (7 chapters)
├── README.md
├── LICENSE
└── images/
    ├── background.png
    ├── gizmo-webbook.jpg
    ├── gizmo-webbook-modified.png   # favicon
    ├── cookie.png
    ├── socks.png
    ├── time.png
    ├── pizza.png
    ├── fashion.png
    └── end.png
```

---

## 💻 Run Locally

No installation needed. Just clone and open:

```bash
git clone https://github.com/reyrove/gizmo-webbook.git
cd gizmo-webbook
```

Then either:

**Option A — Open directly:**
```bash
open index.html      # macOS
start index.html     # Windows
xdg-open index.html  # Linux
```

**Option B — Serve locally (recommended, avoids CORS quirks with `localStorage` scoping):**
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## 🌐 Deploying to GitHub Pages

1. Create a **public** repo on GitHub.
2. Push your files (with `index.html` at the root).
3. Go to **Settings → Pages**.
4. Under **Source**, choose `Deploy from a branch` → branch `main` → folder `/ (root)`.
5. Save. Your site is live at `https://reyrove.github.io/REPO_NAME/` within ~1 minute.

**Before deploying, ensure:**
- `gizmo.html` is renamed to **`index.html`**
- Image paths in `gizmo-stories.js` are **relative** (`images/cookie.png`, not `/images/cookie.png`)

---

## ⌨️ Controls & Shortcuts

| Action | Control |
|---|---|
| Next / previous panel | `→` / `←` or swipe |
| Jump to chapter | Chapter dropdown |
| Add bookmark | `Ctrl + D` or ⭐ button |
| Toggle bookmarks panel | `Ctrl + B` |
| Unleash chaos | `Ctrl + Shift + G` or the **DO NOT PUSH** button |
| Fullscreen | Toolbar ⛶ button |
| Share current panel | Toolbar 🔗 button |

---

## 📖 The Chapters

1. **Foreword** — The Birth of Gizmo (aka The Day Sanity Retired)
2. **Quantum Cooking** — When Pancakes Became Sentient (And Demanded Minimum Wage)
3. **Laundry Disaster** — When Socks Became Superheroes (And One Became a Villain)
4. **Time Vacuum** — When Dust Bunnies Conquered the Future
5. **Pizza Portal** — When the Multiverse of Mozzarella Declared War on Pineapple
6. **Fashion Fiasco** — When Clothes Became Self-Aware (And Really Judgmental)
7. **The End** — Because Why Would It End? There's Still So Much to Explode!

---

## 🎨 Customization

### Add a new chapter
Edit `gizmo-stories.js` and append an object to the `stories` array:

```js
{
  id: "your-chapter-id",
  title: "Chapter Title",
  subtitle: "A cheeky subtitle",
  image: "images/your-image.png",
  content: `<p>Paragraph one.</p>
            <div class="speech-bubble">"A quote." — Someone</div>
            <div class="moral-box">📚 Moral: something wise.</div>`
}
```

Then add an `<option>` for it in the `#chapterSelect` in `index.html`.

### Change the theme colors
All colors are CSS variables at the top of `gizmo.css` (`:root`):

```css
--accent: #e94560;   /* primary red/pink */
--gold:   #f0c040;   /* highlight gold */
--bg-void:#0a0c10;   /* deepest background */
```

### Add or remove Gizmo quotes
Edit the `gizmOQuotes` array in `gizmo.js`.

---

## 🐛 Troubleshooting

| Symptom | Fix |
|---|---|
| Images 404 on GitHub Pages | Change `/images/…` → `images/…` in `gizmo-stories.js` |
| Site shows README, not app | Ensure the file is named `index.html` |
| Blank page | Check browser console; verify `gizmo-stories.js` loads *before* `gizmo.js` |
| Font Awesome icons missing | Check network tab; the CDN may be blocked |
| Chaos meter reset | It's stored per-origin in `localStorage` — expected |

---

## 📜 License

Released under the **MIT License** — see [LICENSE](LICENSE) for details.

Story text, characters, and artwork © 2025–2026 **Reyrove**. All chaos, all love, all rights reserved in the Gizmo Multiverse.

---

## 🙏 Credits

- **Story & characters** — Reyrove
- **Narration** — Sparrow Hawk AI
- **Built with** — pure HTML, CSS, and JavaScript
- **Icons** — [Font Awesome](https://fontawesome.com/)

---

## ⚠️ One Last Thing

> *Check your toaster. It's been giving us looks.*

❤️ **The End... for now** ❤️