# terminal

An interactive terminal-style website. Vanilla HTML, CSS, and JavaScript — no build step, no dependencies.

## Features

- macOS-style window chrome with traffic-light buttons
- Interactive prompt with command history (Up/Down) and tab-completion
- Virtual filesystem with `ls`, `cd`, `cat`, `pwd`
- Built-in pages: `about`, `projects`, `skills`, `contact`
- Themes: `default`, `amber`, `matrix`, `light` (persisted in localStorage)
- Fun extras: `sudo`, ASCII banner, `Ctrl+L` to clear, `Ctrl+C` to cancel

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy on GitHub Pages

1. Push to the `main` branch.
2. In the repo on GitHub, go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch`, **Branch** to `main` and folder to `/ (root)`.
4. Save. Your site will be live at `https://<user>.github.io/terminal/`.

## Commands

Type `help` once it's running for the full list.
# terminal
