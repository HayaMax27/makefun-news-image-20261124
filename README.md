# news-image-20261124: one image of Tuesday 24 November 2026

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/HayaMax27/makefun-news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/HayaMax27/makefun-news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

Built for the [make.fun bounty "Sum up 24 November's world news in one image"](https://make.fun/bounty/news-image-20261124).

## The image

A newspaper front-page poster of Tuesday 24 November 2026, drawn in code
by `main.ts` — 38 stories that happened, or were first reported, on that
day, across 9 regions and 20 fields. Round 4 rebuild: every lead story now
has its own drawn picture, a status badge, and a named source, because the
round-3 entry (text only, 30 stories) scored 438,214 — rank 10,304 of
14,561 — while the top entries all draw their stories.

- **Masthead** — giant date, three top stories, 8 region chips with story
  counts, a UTC timeline strip (00:30 bus crash to 21:00 Dow 50,000) and an
  IN NUMBERS strip (9 killed in Ukraine, 10 of 12 Huawei counts, Dow
  50,000, $41bn Sanofi, 5,258 England heat deaths, 13 UAE bus dead).
- **13 leads, each with a drawn picture** — Shanghai party chief Chen
  Jining under investigation; Huawei guilty on 10 of 12 counts; Russian
  attacks kill 9 across Ukraine; Russian jets spark a Korea air raid
  alert; the Solomons let their China pact lapse; Senegal regain the AFCON
  title; the Dow closes back above 50,000; Sanofi buys Insmed for $41bn;
  Israel kills the Hamas security chief; Baghdad orders a Kurdish oil
  takeover; a Ras Al Khaimah bus crash kills 13; a record 5,258 heat
  deaths in England; Ariane 6 lofts 36 Amazon satellites.
- **Also on Tuesday** — 25 more one-line stories, by region, each with a
  source and a status mark (C confirmed, O official, R reported, CL one
  side's claim).
- **Where it happened** — a world map with pins 1–13 for the lead stories.
- **Date check** — news from other days, deliberately left out: Huang
  resigns as Nvidia CEO (13 Nov), the ICJ Myanmar genocide ruling (19
  Nov), the US blacklisting Megaspeed (23 Nov), COP31 ending without a
  deal (22 Nov), the DR Congo Ebola outbreak (Sep 2026), and the
  Solomons–Australia treaty signing (not yet — Wednesday).

## The program

`main.ts` (Node 22, standard library only) draws the whole image itself —
own 5×7 bitmap font, own PNG encoder, no network, no copied artwork — and
writes it to the output directory (`/output`, or `$MAKEFUN_OUTPUT_DIR`
when set):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The output is a PNG, 1024x1024, well within the gate's 1 MiB and
1024x1024 limits. Two runs write byte-identical bytes.
