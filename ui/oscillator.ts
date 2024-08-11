import {Effect} from "./effect"
import {Knob} from "./knob"
import {resolvePath} from "./utils"

class Oscillator extends Effect {

    static friendlyName = "oscillator"

    params = [
        {name: "frequency", path: "oscillatorNode.frequency", min: 10, max: 24000, logScale: true}, 
    ]

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

    async setup({wave, frequency}){
        this.webAudioNodes.oscillatorNode.type = wave ? wave : "sine"
        this.updateParamIfChanged(0, frequency)
    }

}

export {Oscillator}
