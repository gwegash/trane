import { Effect } from "./effect"

class LFO extends Effect {
  static def = {
    name: "lfo",
    params: {
      frequency: {
        at: (n) => n.oscillatorNode.frequency,
        min: 0.001,
        max: 200,
        log: true,
      },
      magnitude: {
        at: (n) => n.magnitudeGain.gain,
        min: 0.001,
        max: 1000,
        log: true,
      },
    },
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    //osc-->magnitude-->outputGain

    this.webAudioNodes.oscillatorNode = context.createOscillator()
    this.webAudioNodes.oscillatorNode.start()

    this.webAudioNodes.magnitudeGain = context.createGain()
    this.webAudioNodes.oscillatorNode.connect(this.webAudioNodes.magnitudeGain)

    this.webAudioNodes.outputGain = context.createGain()

    this.webAudioNodes.magnitudeGain.connect(this.webAudioNodes.outputGain)

    this.outputNode = this.webAudioNodes.outputGain
    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }

  async setup({ wave }) {
    this.webAudioNodes.oscillatorNode.type = wave ? wave : "sine"
    return this
  }
}

export { LFO }
