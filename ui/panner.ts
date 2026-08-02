import { Effect } from "./effect"

class Panner extends Effect {
  static def = {
    name: "panner",
    params: { pan: { at: (n) => n.pannerNode.pan, min: -1, max: 1 } },
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.pannerNode = context.createStereoPanner()
    this.inputNode = this.webAudioNodes.pannerNode
    this.outputNode = this.webAudioNodes.pannerNode

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }
}

export { Panner }
