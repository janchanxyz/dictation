# Dictation

Mobile- and iPad-friendly dictation practice app. Paste a newline-separated list of words or sentences, then play them with **Microsoft Edge TTS** and configurable wait gaps.

Deployed as a Cloudflare Worker named `dictation` (static assets + `/api` TTS proxy).

## How to use

1. Open the live Worker URL.
2. Paste or type one item per line into the text area.
3. Set **Word gap** (default 10s) and **Sentence gap** (default 30s).
4. Adjust **Pronunciation speed** (0.5×–1.5×; default 1×).
5. Optionally tap **Randomize order** to shuffle the list.
6. Pick an Edge TTS voice (defaults to **en-GB-SoniaNeural**).
7. Tap **Start**. On iOS Safari, Start also unlocks audio.
8. Tap the **▶** button on any line to replay that item immediately.

### Word vs sentence delay

After each spoken line, the app waits:

- **Sentence gap** if the line contains whitespace, or ends with `. ? ! 。 ！ ？`
- **Word gap** otherwise (single token)

Settings, voice, and the last pasted list are saved in `localStorage`.

## API

- `GET /api/voices` — Edge TTS voice list
- `POST /api/tts` — `{ "text": "...", "voice": "zh-HK-HiuMaanNeural" }` → `audio/mpeg`
- `GET /api/health` — health check

## Develop

```bash
cd /workspace/dictation
npm install
npx wrangler dev
```

## Deploy

```bash
cd /workspace/dictation
npm install
npx wrangler deploy
```

Worker name is set in `wrangler.jsonc` as `dictation`.

## Key files

- `src/index.ts` — Worker router (`/api/*` + static assets)
- `src/lib/tts.ts` — Edge TTS via Workers WebSocket upgrade
- `src/lib/sec-ms-gec.ts` — Sec-MS-GEC v2 token
- `public/` — SPA (HTML/CSS/JS)
