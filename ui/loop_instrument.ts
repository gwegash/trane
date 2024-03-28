import {Effect} from "./effect"
import {bpm} from "./index"

class LoopInstrument extends Effect {
    friendlyName = "looper"

    params = [
        {name: "latency", path: "loopNode.latency", isWorklet: true}, //min max are correct on the processor
    ]
    
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.inputGainNode = context.createGain()
        this.webAudioNodes.outputGainNode = context.createGain() //TODO use webAudioNodes?? it's quite a shit thing
        this.inputNode = this.webAudioNodes.inputGainNode
        this.outputNode = this.webAudioNodes.outputGainNode

        const loopNode = new AudioWorkletNode(
          this.audioContext,
          "loop-processor",
          {processorOptions: {loopTime_s: 1}} //start with a decent thing
        )
        this.webAudioNodes.loopNode = loopNode
        this.inputNode.connect(loopNode)
        loopNode.connect(this.outputNode)

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()

    }

    async setup(loopTime){
        const delayTime_beats = parseFloat(loopTime)
        const loopTime_s = (delayTime_beats/bpm)*60
        this.webAudioNodes.loopNode.port.postMessage({loopTime_s})
    }
}

export {LoopInstrument}
