import {Effect} from "./effect"
import {Knob} from "./knob"
import {resolvePath} from "./utils"

class LFO extends Effect {

    static friendlyName = "lfo"
    params = [
        {name: "frequency", path: "oscillatorNode.frequency", min: 0.001, max: 200, logScale: true}, 
        {name: "magnitude", path: "magnitudeGain.gain", min: 0.001, max: 1000, logScale: true}, 
    ]

    setup(oscillator_type){
        this.webAudioNodes.oscillatorNode.type = oscillator_type
    }

    constructor(context: AudioContext, parentEl : Element, name : string){
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

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }
}

export {LFO}
