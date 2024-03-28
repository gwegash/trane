import {Effect} from "./effect"
import {bpm} from "./index"

class LoopInstrument extends Effect {
    friendlyName = "looper"
    
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        const inputGainNode = context.createGain()
        const outputGainNode = context.createGain() //TODO use webAudioNodes?? it's quite a shit thing
        this.inputNode = inputGainNode
        this.outputNode = outputGainNode
    }

    async setup(loopTime){
        const delayTime_beats = parseFloat(loopTime)
        const loopTime_s = (delayTime_beats/bpm)*60

        await this.audioContext.audioWorklet.addModule("loop_worker.js")
        const loopNode = new AudioWorkletNode(
          this.audioContext,
          "loop-processor",
          {processorOptions: {loopTime_s}}
        )
        this.webAudioNodes.loopNode = loopNode
        this.inputNode.connect(loopNode)
        loopNode.connect(this.outputNode)
    }
}

export {LoopInstrument}
