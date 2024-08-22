import {Effect} from "./effect"
import {loadSample} from "./utils"

class ConvolutionReverb extends Effect {

    static friendlyName = "reverb"

    params = [
        {name: "wet-dry", path: "wetDryPanner.pan", min: -1, max: 1},
    ]

    impulseBuffer: AudioBuffer
    impulseURL: string

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.gainNode = context.createGain()
        this.webAudioNodes.convolver = context.createConvolver()
        this.webAudioNodes.gainNode.connect(this.webAudioNodes.convolver)

        this.inputNode = this.webAudioNodes.gainNode
        this.outputNode = this.webAudioNodes.convolver

        this.createWetDry()

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()
        this.setupKnobs()
    }

    async setup({impulse}){
        //Ty Greg Hopkins CC Attribution-any: https://oramics.github.io/sampled/IR/EMT140-Plate/
        const impulseURL = impulse === "nil" ? "impulses/emt_140_medium_3.wav" : impulse

        if(this.impulseURL != impulseURL){
            const arraybuffer = await loadSample(impulseURL);
            this.impulseBuffer = await this.audioContext.decodeAudioData(arraybuffer)
            this.webAudioNodes.convolver.buffer = this.impulseBuffer
            this.impulseURL = impulseURL
        }
        return this
    }

}

export {ConvolutionReverb}
