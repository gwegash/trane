import { Effect } from "./effect"

class Biquad extends Effect {
  static def = {
    name: "biquad",
    params: {
      frequency: {
        at: (n) => n.biquadNode.frequency,
        min: 10,
        max: 24000,
        log: true,
      },
      detune: { at: (n) => n.biquadNode.detune, min: -1200, max: 1200 },
      Q: { at: (n) => n.biquadNode.Q, min: 0.0001, max: 1000, log: true },
      gain: { at: (n) => n.biquadNode.gain, min: -40, max: 40 },
    },
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.biquadNode = context.createBiquadFilter()
    this.inputNode = this.webAudioNodes.biquadNode
    this.outputNode = this.webAudioNodes.biquadNode

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }

  async setup({ filter_type }) {
    this.webAudioNodes.biquadNode.type = filter_type ? filter_type : "lowpass"
    return this
  }
}

export { Biquad }
