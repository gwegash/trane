import { Effect } from "./effect"

class Gain extends Effect {
  static def = {
    name: "gain",
    params: {
      gain: { at: (n) => n.gainNode.gain, min: 0.001, max: 10.0, log: true },
    },
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.gainNode = context.createGain()
    this.inputNode = this.webAudioNodes.gainNode
    this.outputNode = this.webAudioNodes.gainNode
    //this.webAudioNodes.gainNode.gain.setValueAtTime(1.0, context.currentTime);

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }
}

export { Gain }
