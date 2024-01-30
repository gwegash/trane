import {Effect} from "./effect"
import {Knob} from "./knob"

class Gain extends Effect {

    friendlyName = "gain"

    params = [
        {name: "gain", path: "gainNode.gain", min: 0.001, max: 10.0, logScale: true},
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.gainNode = context.createGain()
        this.inputNode = this.webAudioNodes.gainNode
        this.outputNode = this.webAudioNodes.gainNode
        //this.webAudioNodes.gainNode.gain.setValueAtTime(1.0, context.currentTime);

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }

}

export {Gain}
