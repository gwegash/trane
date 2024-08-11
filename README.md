# [Trane](https://lisp.trane.studio/?t=tracks/etude.janet)
![trane screenshot](https://lisp.trane.studio/tracks/screenshot.png)

A musical lisp thing.

This is still very much a WIP.

## [docs](docs/) / [examples](https://github.com/gwegash/tracks)

## Installing
You'll need a copy of [nvm](https://github.com/nvm-sh/nvm) and [emsdk](https://github.com/emscripten-core/emsdk)

```
nvm use
npm install
./scripts/build-jimage
```

## Running

```
npm run dev
```

### Current known issues/bugs

* The attack/release knobs sometimes freeze up on chrome.

## Acknowledgements
* Ian Henry and his wonderful book [Janet For Mortals](https://janet.guide). The js-janet interop is a modified version to the one running in https://toodle.studio
* Sam Aaron and his work on [Sonic Pi](https://sonic-pi.net/). Quite a few features of trane originate there.
* [Calvin Rose](https://bakpakin.com/) for creating the Janet Language
* Thanks also to all the contributors to [Janet](https://janet-lang.org)
