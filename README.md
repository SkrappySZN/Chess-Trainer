# Chess Trainer

A single-file chess trainer. It pulls your recent chess.com games, runs a chess
engine over every move you played, and turns the ones you got wrong into drills.

**Live:** https://skrappyszn.github.io/Chess-Trainer/

- **Train** — positions from your own games where you missed something, resurfaced
  on a spaced-repetition schedule: get one right and it moves out to a longer
  interval, miss it and it comes back soon
- **Play** — bots that make plausible mistakes, including **your past self** — every
  year you played enough rated games becomes an opponent that samples that year's
  own distribution of mistakes
- **Openings** — a guided, playable repertoire (Italian as White, 1...e5 as Black)
  with the reason behind every move, drills to make it stick, and a report on which
  openings you actually play and how far you get before leaving them
- **Progress** — accuracy by tactical motif, and error rate over time
- **Games** — every analysed game with a full breakdown

Everything runs in the browser. No server, no account, nothing uploaded —
your data stays in your own browser's local storage.

Open it, type your chess.com username, and it does the rest.
