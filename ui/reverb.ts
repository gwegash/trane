import {Effect} from "./effect"
import {loadSample} from "./utils"

class ConvolutionReverb extends Effect {
    
    static friendlyName = "reverb"

    impulse: AudioBuffer
    impulseURL: string
    
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.convolver = context.createConvolver()
        this.inputNode = this.webAudioNodes.convolver
        this.outputNode = this.webAudioNodes.convolver
    }

    async setup(impulseURL){
      if(this.impulseURL != impulseURL){
          const arraybuffer = await loadSample(impulseURL);
          this.impulse = await this.audioContext.decodeAudioData(arraybuffer)
          this.webAudioNodes.convolver.buffer = this.impulse
          this.impulseURL = impulseURL
      }
    }
    
}

export {ConvolutionReverb}
