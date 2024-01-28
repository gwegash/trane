import {EditorView, basicSetup} from "codemirror"
import {keymap} from "@codemirror/view"
import {janet} from "codemirror-lang-janet"
import { vim } from "@replit/codemirror-vim"
import { emacs } from "@replit/codemirror-emacs"
import { Prec } from "@codemirror/state";

import {basicDark} from "./dark_theme"

import localforage from "localforage"

let editor

const defaultCode = `# Hello
# Trane is a music playground 
# It's written in Janet, a lisp-like language

# To execute the code below, press Alt+Enter. (⌥+Enter on Mac)

(chain 
  (sample :hello-sample "samples/Cmin 7th 3.wav" 36)
  #(biquad :hello-filter "lowpass")
  :out
)

(live_loop :player
  (play (pick [12 24 36]) :hello-sample :dur 64)
  #(target :hello-filter :frequency (rand 50 10000) 10)
  (sleep 6)
)
# All those samples playing at once might cause some clipping. Try to adjust the level with the gain knob on the right.
# try uncommenting both the lines above.

# Have a look at the about page for more info: https://lisp.trane.studio/about.html
`

async function loadTrackURL(){
  const urlParams = new URLSearchParams(window.location.search);
  const trackURL = urlParams.get('t')
  let trackString

  if(trackURL){
    trackString = await fetch(trackURL)
  }
  return trackString?.text()
}

async function initCodeEditor(el, onCodeChange, onCodeReload){

    const savedScript = await loadSavedScript()
    const keybindings = await loadKeybindings()

    const trackFromURL = await loadTrackURL()

    let keybindingsExtention 
    if(keybindings === "vim"){
      keybindingsExtention = vim
    }
    else if(keybindings === "emacs"){
      keybindingsExtention = emacs
    }

    const extensions = [
        basicSetup,
        janet(),
        EditorView.updateListener.of(function(viewUpdate: ViewUpdate) {
            if (viewUpdate.docChanged) {
                onCodeChange()
            }
        }),

        Prec.highest(
            keymap.of([
              { key: "Alt-Enter", run: onCodeReload }
            ])
          ),
        EditorView.theme({
          "&": {minHeight: "10rem", flexBasis: "10rem", flexGrow: "1"},
          ".cm-scroller": {overflow: "auto"},
        }),
        basicDark
    ]

    keybindingsExtention ? extensions.push(keybindingsExtention()) : null



    editor = new EditorView({
        doc: trackFromURL || savedScript || defaultCode,
        extensions,
        parent: el,
    })

    el.ondragenter = dragenter
    el.ondragover = dragover
    el.ondrop = dropFile
}


async function saveCurrentScript(){
    const value = await localforage.setItem("saved_script", editor.state.doc.toString())
}

async function loadSavedScript() : Promise<string | null>{
    return await localforage.getItem("saved_script")
}

async function loadKeybindings() : Promise<string | null>{
    return await localStorage.getItem("keybindings")
}

async function saveKeybindings(keybindings){
    return await localStorage.setItem("keybindings", keybindings)
}

async function dropFile(e) {
    e.stopPropagation()
    e.preventDefault()

    const dt = e.dataTransfer
    const files = dt.files

    if(files.length == 1){
        try {
            const value = await localforage.setItem(files[0].name, files[0].arrayBuffer())
            
            const cursor = editor.state.selection.main.head;
            const transaction = editor.state.update({
              changes: {
                from: cursor,
                insert: `"local://${files[0].name}"`,
              },
              // the next 2 lines will set the appropriate cursor position after inserting the new text.
              selection: { anchor: cursor + 1 },
              scrollIntoView: true,
            });

            if (transaction) {
             editor.dispatch(transaction);
            }

            // This code runs once the value has been loaded
            // from the offline store.
        } catch (err) {
            // This code runs if there were any errors.
            console.log(err)
        }
    }
    else{
        console.error("more than one file dropped into the sample bay")
    }
}


function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

export {initCodeEditor, editor, saveCurrentScript}
