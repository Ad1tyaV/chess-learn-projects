# Chess Room

A phone-friendly, buildless chess practice site with four separate pages:

- **Practice**: overview and saved exercise counts.
- **Board memory**: place pieces or recall arrangements with one, two, or three targets. Level 3 includes background pieces. Prompts, feedback, palette, and actions stay with the board on phones.
- **Openings**: White repertoire (Italian Game, Ruy Lopez, Queen’s Gambit, London System) and Black repertoire (Sicilian, Caro-Kann, French, King’s Indian), with guided playback and rehearsal of your chosen side. Opponent replies are automatic; Black practice flips the board.
- **Tactics**: three interactive starter puzzles, hints, and explanations.

Progress is stored in the current browser’s local storage. It does not sync across devices. Position memory uses arrangements rather than legal game positions. Opening and tactics exercises use curated moves, not a general chess engine.

## Preview locally

Run `node server.cjs`, then visit http://localhost:4173. No dependencies or build required.

## GitHub Pages

1. Push these files to the `master` or `main` branch of `Ad1tyaV/chess-learn-projects`.
2. In GitHub, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Open **Actions → Deploy Chess Room to GitHub Pages** and run the workflow if the push happened before Pages was configured.
4. After deployment succeeds, visit https://ad1tyav.github.io/chess-learn-projects/.

Use your phone browser’s **Add to Home Screen** action for convenient access. The site requires a connection; offline support is not included.

All links and assets are relative, so the site supports GitHub Pages repository subpaths. The workflow uploads only the website files.

## Extend the exercises

Edit `openings` and `puzzles` in `app.js` to add curated lines or tactics. Square names use algebraic coordinates; uppercase piece letters are White and lowercase letters are Black. `board-practice.js` and `openings-practice.js` contain their respective practice flows.
