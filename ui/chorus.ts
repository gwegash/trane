import {Effect} from "./effect"
import {bpm} from "./index"

class Chorus extends Effect {
    
    //TODO we need to unify these names with the DSL, will allow for easier feature development	
    static friendlyName = "chorus"

    params = [
        {name: "rate", path: "lfo.frequency", min: 0.1, max: 10},
        {name: "amount", path: "lfoGain.gain", min: 0.001, max: 0.01},
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.splitGain = context.createGain()
        this.webAudioNodes.delay = context.createDelay()
        this.webAudioNodes.lfo = context.createOscillator()
        this.webAudioNodes.lfo.start()
        this.webAudioNodes.lfoGain = context.createGain()
        this.webAudioNodes.mixGain = context.createGain()

	this.webAudioNodes.splitGain.connect(this.webAudioNodes.delay)

	this.webAudioNodes.delay.delayTime.value = 0.014
	this.webAudioNodes.lfo.frequency.value = 0.2
	this.webAudioNodes.lfoGain.gain.value = 0.004
	this.webAudioNodes.lfo.connect(this.webAudioNodes.lfoGain)
	this.webAudioNodes.lfoGain.connect(this.webAudioNodes.delay.delayTime)

	//mix the result
	this.webAudioNodes.mixGain.gain.value = 0.5
	this.webAudioNodes.delay.connect(this.webAudioNodes.mixGain)
	this.webAudioNodes.splitGain.connect(this.webAudioNodes.mixGain)


        this.inputNode = this.webAudioNodes.splitGain
        this.outputNode = this.webAudioNodes.mixGain

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }

    async setup(){
    }
}

export {Chorus}
