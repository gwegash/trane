import {Effect} from "./effect"
import {loadSample} from "./utils"

class ConvolutionReverb extends Effect {
    
    static friendlyName = "reverb"

    impulseBuffer: AudioBuffer
    impulseURL: string
    
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.convolver = context.createConvolver()
        this.inputNode = this.webAudioNodes.convolver
        this.outputNode = this.webAudioNodes.convolver
    }

    async setup({impulse}){
      if(this.impulseURL != impulse){
          const arraybuffer = await loadSample(impulse);
          this.impulseBuffer = await this.audioContext.decodeAudioData(arraybuffer)
          this.webAudioNodes.convolver.buffer = this.impulseBuffer
          this.impulseURL = impulse
      }
      return this
    }
    
}

export {ConvolutionReverb}
