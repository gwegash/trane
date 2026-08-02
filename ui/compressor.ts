import { Effect } from "./effect"

class Compressor extends Effect {
  static def = {
    name: "compressor",
    params: {
      threshold: { at: (n) => n.compressor.threshold, min: -100, max: 0 },
      knee: { at: (n) => n.compressor.knee, min: 0, max: 40 },
      ratio: { at: (n) => n.compressor.ratio, min: 1, max: 20 },
      attack: { at: (n) => n.compressor.attack, min: 0, max: 1 },
      release: { at: (n) => n.compressor.release, min: 0, max: 1 },
    },
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.compressor = context.createDynamicsCompressor()
    this.inputNode = this.webAudioNodes.compressor
    this.outputNode = this.webAudioNodes.compressor

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }
}

export { Compressor }
