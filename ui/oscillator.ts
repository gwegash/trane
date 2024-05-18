import {Effect} from "./effect"
import {Knob} from "./knob"
import {resolvePath} from "./utils"

class Oscillator extends Effect {

    friendlyName = "oscillator"

    params = [
        {name: "frequency", path: "oscillatorNode.frequency", min: 10, max: 24000, logScale: true}, 
    ]

    setup(oscillator_type){
        this.webAudioNodes.oscillatorNode.type = oscillator_type
    }

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.oscillatorNode = context.createOscillator()
        this.webAudioNodes.oscillatorNode.start()
        this.inputNode = this.webAudioNodes.oscillatorNode
        this.outputNode = this.webAudioNodes.oscillatorNode

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }
}

export {Oscillator}
