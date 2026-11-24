# news-image-20261124: one image of Tuesday 24 November 2026

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/HayaMax27/makefun-news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/HayaMax27/makefun-news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

Built for the [make.fun bounty "Sum up 24 November's world news in one image"](https://make.fun/bounty/news-image-20261124).

## The image

A newspaper front-page poster of Tuesday 24 November 2026, drawn in code
by `main.ts` — a symbolic world map with numbered markers, plus five
stories:

1. **CHESS BEGINS** — Gukesh defends his world title against Sindarov in
   Geneva; Game 1 opens the youngest championship pairing ever.
2. **SUPERMOON** — The Beaver Moon peaks, the first of four supermoons in a
   row, shining near the Pleiades.
3. **TOKYO REOPENS** — The Nikkei rebounds as Tokyo trading resumes after
   Friday's record rout and the Monday holiday.
4. **NEW TRAIN** — The first Saryu-Kamala Express reaches Janakpur in
   Nepal, a new weekly Ayodhya–Janakpur link.
5. **U.S. DATA** — Consumer confidence for November is out today as Wall
   Street watches the AI rally.

## The program

`main.ts` (Node 22, standard library only) draws the whole image itself —
no network, no copied artwork — and writes it to the output directory
(`/output`, or `$MAKEFUN_OUTPUT_DIR` when set):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The output is a PNG, 1024x1024, well within the gate's 1 MiB and
1024x1024 limits. Two runs write byte-identical bytes.
