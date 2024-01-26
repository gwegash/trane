import InitializeWasm from "wasm-runtime"
import type {Module} from "wasm-runtime"
import {initAudio, newInstrumentMappings} from "./audio"
import {initCodeEditor, saveCurrentScript} from "./editor"
import {init as initLoopManager, codeReload} from "./loop_manager"
import {OutputChannel} from "./errors"
import {editor} from "./editor"
import {background} from "./dark_theme"
import "./css/main.css"

const bpm = 140
let janetRuntime
let compiledImage //the image that is compiling, but not yet ready been pushed to the running loops, TODO MAYBE set this to null/undefined if the compilation hasn't succeeded? 
let outputChannel : OutputChannel

function addAboutSection(){

}

async function main(runtime: Module){
    console.log("wasup")
    janetRuntime = runtime

    const instrumentElement = document.createElement("div")
    initAudio(bpm, instrumentElement)
    initLoopManager()
    instrumentElement.className = "instruments"
    instrumentElement.style.background = background
    instrumentElement.style.color = 'white'

    //initialize code UI
    const codeElement = document.createElement("div")
    codeElement.className = "code"
    document.body.appendChild(codeElement)
    document.body.appendChild(instrumentElement)

    await initCodeEditor(codeElement, onChange)
    window.editor = editor
    onChange()

    const outputChannelElement = document.createElement("pre")
    outputChannelElement.className = "output-channel"
    codeElement.appendChild(outputChannelElement)
    outputChannel.target = outputChannelElement
}

function onChange(){
    outputChannel.clearErrors()
    const result = runtime.trane_compile(editor.state.doc.toString())
    if (!result.isError){
        compiledImage = result.image
    }
}

async function onCodeReload(){
    console.log("got code reload message")
    if(compiledImage){
	saveCurrentScript()
        const { environment, lloop_names, instrument_mappings } = janetRuntime.trane_start(compiledImage)
        await newInstrumentMappings(instrument_mappings)
        codeReload(environment, lloop_names)
    }
    else{
        console.log("tried to reload without an image")
    }
}

document.addEventListener("keydown", (e: KeyboardEvent) => {
    if(e.key == "Enter" && (e.altKey || e.metaKey || e.shiftKey)){
        onCodeReload()
	e.preventDefault()
    }
})

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
            introElement?.addEventListener(
                "click",
                () => {
                    introElement.classList.add("intro-clicked")
                    main(runtime)
                }
            )
        })
        break
    }
})

export {bpm, janetRuntime}

if(DEV){
    new EventSource("/esbuild").addEventListener("change", () => location.reload())
}
