# Browser tests

End-to-end tests that drive the real app: Janet compiles to WASM, the audio graph is
built, live loops schedule notes. They catch the failures the Janet unit tests can't --
a JS exception in the audio layer, or a track that no longer compiles.

## Setup

```
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Running

The tests need the app served, and the example tracks present in `dist/tracks`
(they come from https://github.com/gwegash/tracks).

```
npm run dev          # in the repo root, serves dist/ on :8000
```

then, from this directory:

```
pytest                          # all tracks, headless
pytest --headed                 # watch it happen
pytest --play-seconds 15        # let each track run longer
pytest --base-url http://localhost:3000
pytest --browser firefox        # chromium (default), firefox, webkit
pytest -k acid                  # one track
```

If you changed anything under `src/*.janet` or `src/driver.cpp`, run
`npm run build-jimage` first -- `npm run dev` only rebundles the TypeScript, and the
Janet image is embedded into the WASM at emcc time.

## What they assert

- the track served (a 404 would otherwise land in the editor as HTML, because
  `loadTrackURL` in editor.ts does not check `response.ok`)
- the editor content matches the track file, so a silent fallback to the default
  script fails rather than passing
- Alt+Enter actually evaluates, and instruments get instantiated
- after a few seconds of playback: no `.janet-err` in the output channel, no
  `pageerror` or `console.error`, and no 4xx/5xx from our own server

`console.warn` is deliberately not treated as failure -- `loop_manager` warns about
negative sleep times and `wire.ts` warns about unconnectable nodes in normal use.

Only same-origin responses are checked. Some tracks pull impulses and samples from
third-party hosts, and a flaky CDN is not a regression in trane. `/favicon.ico` is
ignored too: the app doesn't ship one and only headed Chrome asks for it, so without
that exemption the suite would pass or fail depending on `--headed`.

Playback is muted when headless and audible when `--headed`, on the assumption that
if you are watching it you want to hear it.
