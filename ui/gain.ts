import {Effect} from "./effect"
import {Knob} from "./knob"

class Gain extends Effect {

    friendlyName = "gain"

    params = [
        {name: "gain", path: "gainNode.gain"}, 
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.gainNode = context.createGain()
        this.inputNode = this.webAudioNodes.gainNode
        this.outputNode = this.webAudioNodes.gainNode
        this.webAudioNodes.gainNode.gain.setValueAtTime(1.0, context.currentTime);

        const gainKnob = new Knob(this.audioContext, this.el, this.webAudioNodes.gainNode.gain, "gain", 0, 10)
        this.resolveParams()  //always call me after settings up your webAudioNodes!
    }

}

export {Gain}
