import { Effect } from "./effect" //  Gets WeAssembly bytcode from file
import octaveUpWasm from "../src/cpp/octave_up.wasm"

class OctaveUp extends Effect {
  static friendlyName = "octave_up"

  params = [
  ]

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    const octaveUpNode = new AudioWorkletNode(
      this.audioContext,
      "octave-up-processor",
    )

    octaveUpNode.port.postMessage({ wasm: octaveUpWasm.buffer }) //load the wasm in the worker

    this.webAudioNodes.octaveUpNode = octaveUpNode

    this.inputNode = this.webAudioNodes.octaveUpNode
    this.outputNode = this.webAudioNodes.octaveUpNode

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }

  async setup() {
    //this.updateParamIfChanged(0, cutoff)
    return this
  }
}

export { OctaveUp }
