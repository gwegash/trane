import {Effect} from "./effect"

class ConvolutionReverb extends Effect {
    
    impulse: AudioBuffer
    impulseURL: string
    friendlyName = "reverb"
    
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.convolver = context.createConvolver()
        this.inputNode = this.webAudioNodes.convolver
        this.outputNode = this.webAudioNodes.convolver
    }

    async setup(impulseURL){
      if(this.impulseURL != impulseURL){
          const response = await fetch(impulseURL); //TODO write a generalised version of this that takes local:// into account
          const arraybuffer = await response.arrayBuffer();
          this.impulse = await this.audioContext.decodeAudioData(arraybuffer)
          this.webAudioNodes.convolver.buffer = this.impulse
          this.impulseURL = impulseURL
      }
    }
    
}

export {ConvolutionReverb}
