import { Effect } from "./effect"

class Oscillator extends Effect {
  static def = {
    name: "oscillator",
    params: {
      frequency: {
        at: (n) => n.oscillatorNode.frequency,
        min: 10,
        max: 24000,
        log: true,
      },
    },
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.oscillatorNode = context.createOscillator()
    this.webAudioNodes.oscillatorNode.start()
    this.inputNode = this.webAudioNodes.oscillatorNode
    this.outputNode = this.webAudioNodes.oscillatorNode

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

export { Oscillator }
