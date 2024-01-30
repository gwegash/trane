import {Effect} from "./effect"
import {bpm} from "./index"

class Delay extends Effect {
    
    //TODO we need to unify these names with the DSL, will allow for easier feature development	
    friendlyName = "Dlay"
    params = [
        {name: "feedback", path: "gainNode.gain", min: 0, max: 1},
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.delay = context.createDelay()

        this.webAudioNodes.gainNode = context.createGain() //feedback gain
        this.webAudioNodes.gainNode.connect(this.webAudioNodes.delay)
        this.webAudioNodes.gainNode.gain.value = 0.5
        this.webAudioNodes.delay.connect(this.webAudioNodes.gainNode)

        this.inputNode = this.webAudioNodes.delay
        this.outputNode = this.webAudioNodes.delay

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }

    async setup(delayTime){
        const delayTime_s = parseFloat(delayTime)
        this.webAudioNodes.delay.delayTime.value = (delayTime_s/60.0)*bpm
    }
}

export {Delay}
