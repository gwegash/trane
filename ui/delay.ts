import {Effect} from "./effect"
import {bpm} from "./index"

class Delay extends Effect {
    
    friendlyName = "Dlay"

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.delay = context.createDelay()

        this.webAudioNodes.gainNode = context.createGain() //feedback gain
        this.webAudioNodes.gainNode.connect(this.webAudioNodes.delay)
        this.webAudioNodes.gainNode.gain.value = 0.5
        this.webAudioNodes.delay.connect(this.webAudioNodes.gainNode)

        this.inputNode = this.webAudioNodes.delay
        this.outputNode = this.webAudioNodes.delay
    }

    async setup(delayTime, feedback = 0.5){
        const delayTime_s = parseFloat(delayTime)
        this.webAudioNodes.delay.delayTime.value = (delayTime_s/60.0)*bpm
        this.webAudioNodes.gainNode.gain.value = feedback
    }
}

export {Delay}
