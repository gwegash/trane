import {Effect} from "./effect"
import {Knob} from "./knob"
import {resolvePath} from "./utils"

class Biquad extends Effect {

    static friendlyName = "biquad"

    params = [
        {name: "frequency", path: "biquadNode.frequency", min: 10, max: 24000, logScale: true}, 
        {name: "detune", path: "biquadNode.detune", min: -1200, max: 1200},
        {name: "Q", path: "biquadNode.Q", min: 0.0001, max: 1000, logScale: true},
        {name: "gain", path: "biquadNode.gain", min: -40, max: 40},
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.biquadNode = context.createBiquadFilter()
        this.inputNode = this.webAudioNodes.biquadNode
        this.outputNode = this.webAudioNodes.biquadNode

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }

    async setup({filter_type, frequency, detune, Q, gain}){
        this.webAudioNodes.biquadNode.type = filter_type ? filter_type : "lowpass"
        this.updateParamIfChanged(0, frequency)
        this.updateParamIfChanged(1, detune)
        this.updateParamIfChanged(2, Q)
        this.updateParamIfChanged(3, gain)

        return this
    }
}

export {Biquad}
