import { Effect } from "./effect" //  Gets WeAssembly bytcode from file
import filterWasm from "../src/cpp/ladder_filter.wasm"

class LadderFilter extends Effect {
  static friendlyName = "ladder_filter"

  params = [
    {
      name: "cutoff",
      path: "filterNode.cutoff",
      isWorklet: true,
      min: 40,
      max: 12000,
      logScale: true,
    },
    { name: "Q", path: "filterNode.Q", isWorklet: true },
  ]

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    const filterNode = new AudioWorkletNode(
      this.audioContext,
      "filter-processor",
    )

    filterNode.port.postMessage({ wasm: filterWasm.buffer }) //load the wasm in the worker

    this.webAudioNodes.filterNode = filterNode

    this.inputNode = this.webAudioNodes.filterNode
    this.outputNode = this.webAudioNodes.filterNode

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }

  async setup({ cutoff, Q }) {
    this.updateParamIfChanged(0, cutoff)
    this.updateParamIfChanged(1, Q)
    return this
  }
}

export { LadderFilter }
