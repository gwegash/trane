import InitializeWasm from "wasm-runtime"
import type { Module } from "wasm-runtime"
import { initAudio, newInstrumentMappings } from "./audio"
import {
  initCodeEditor,
  saveCurrentScript,
  scheduleCompilation,
} from "./editor"
import { init as initLoopManager, codeReload } from "./loop_manager"
import { OutputChannel } from "./errors"
import { editor } from "./editor"
import { background } from "./dark_theme"
import { tutor, continueTutorial } from "./tutor"
import "./css/main.css"

let bpm
let janetRuntime
let compiledImage //the image that is compiling, but not yet ready been pushed to the running loops, TODO MAYBE set this to null/undefined if the compilation hasn't succeeded?
let outputChannel: OutputChannel
let instrumentElement: HTMLElement

function addAboutSection() {}

async function main(runtime: Module) {
  janetRuntime = runtime

  instrumentElement = document.createElement("div")
  instrumentElement.className = "instruments"
  instrumentElement.style.background = background
  instrumentElement.style.color = "white"

  //initialize code UI
  const codeElement = document.createElement("div")
  codeElement.className = "code"
  codeElement.id = "code"
  document.body.appendChild(codeElement)
  document.body.appendChild(instrumentElement)

  const infoElement = document.createElement("a")
  infoElement.href = "/about.html"
  infoElement.innerText = "i"
  infoElement.className = "info"

  document.body.appendChild(infoElement)

  await initCodeEditor(codeElement, onChange, onCodeReload)
  window.editor = editor
  onChange()
  continueTutorial()

  const outputChannelElement = document.createElement("pre")
  outputChannelElement.className = "output-channel"
  codeElement.appendChild(outputChannelElement)
  outputChannel.target = outputChannelElement

}

function onChange() {
  outputChannel.clearErrors()
  const result = runtime.trane_compile(editor.state.doc.toString())
  if (!result.isError) {
    compiledImage = result.image
  } else {
    compiledImage = undefined
  }
}

async function onCodeReload() {
  scheduleCompilation(0, onChange) //TODO this is a bit wasteful. In reality we need to check if there have been any edits to the buffer since the last compilation and schedule one if so.
  console.log("got code reload message")
  if (compiledImage) {
    saveCurrentScript()
    const startResult = janetRuntime.trane_start(compiledImage)
    const { environment, lloop_names, instrument_mappings } = startResult
    if (startResult.bpm && startResult.bpm > 0 && bpm === undefined) {
      bpm = startResult.bpm
    } else if (bpm === undefined) {
      //fallback to 120bpm
      bpm = 120
    }

    await initAudio() //no-op if already initialised
    initLoopManager() //also no-op if already initialised
    await newInstrumentMappings(instrument_mappings)
    codeReload(environment, lloop_names)
    continueTutorial()
  } else {
    console.log("tried to reload without an image")
  }
}

document.addEventListener("DOMContentLoaded", (_) => {
  outputChannel = new OutputChannel()
  const opts = {
    print: (x: string) => {
      outputChannel.print(x, false)
    },
    printErr: (x: string) => {
      outputChannel.print(x, true)
    },
  }

  switch (window.location.pathname) {
    case "/":
      InitializeWasm(opts).then((runtime: Module) => {
        window.runtime = runtime
        const introElement = document.getElementById("intro")
        introElement?.addEventListener("click", () => {
          introElement.classList.add("intro-clicked")
          main(runtime)
        })
      })
      break
  }
})

export { bpm, instrumentElement, janetRuntime }

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}
