# news-image-20261124: one image of Tuesday 24 November 2026

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/HayaMax27/makefun-news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/HayaMax27/makefun-news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

Built for the [make.fun bounty "Sum up 24 November's world news in one image"](https://make.fun/bounty/news-image-20261124).

## The image

A newspaper front-page poster of Tuesday 24 November 2026, drawn in code
by `main.ts` — thirty stories verified as first reported on that day,
across seven regions:

- **Leads** — Shanghai party chief Chen Jining falls in the purge; Huang
  is back and stocks soar (Nvidia +31.5%, Taiex +9.0%, Nikkei +3.9%);
  Huawei is found guilty of trade-secrets theft.
- **Europe** — Russia hits Zaporizhzhia; Ukraine hits Russian ships at
  sea; Poland cries foul over airspace; NATO vows to defend space;
  Zelensky urges four-way talks; the chess crown opens with a draw.
- **Asia-Pacific** — China sentences a spy to death; Indonesia picks two
  to replace its VP; Malaysia to send thousands back to Myanmar; the
  first train reaches Nepal; Russian jets enter Korea's air zone; the ICJ
  finds Myanmar guilty of genocide.
- **Middle East** — four tankers hit by mines in Hormuz; the IRGC says it
  hit a ship; Israel kills the Hamas security chief; Gaza meningitis
  surges; Houthis 60 km from Aden; the Riyadh tower is hit; Iraq takes
  Kurd oilfields.
- **The Americas** — US confidence jumps to 103.3; the US blacklists
  Megaspeed; the Pentagon rebukes Canada; a US drone helps nab El Chapo
  Isidro; 25 held hostage in Cartagena.
- **Markets and sport** — Sanofi buys Insmed for $41B; Senegal gets its
  AFCON crown back; the Beaver Supermoon peaks.

## The program

`main.ts` (Node 22, standard library only) draws the whole image itself —
no network, no copied artwork — and writes it to the output directory
(`/output`, or `$MAKEFUN_OUTPUT_DIR` when set):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The output is a PNG, 1024x1024, well within the gate's 1 MiB and
1024x1024 limits. Two runs write byte-identical bytes.
