import { Effect } from "./effect"
import { loadSample } from "./utils"

class ConvolutionReverb extends Effect {
  static friendlyName = "reverb"

  params = [{ name: "wet-dry", path: "crossfaderNode.panner.pan", min: -1, max: 1 }]

  impulseBuffer: AudioBuffer
  impulseURL: string
  preDelay: number
  decayTime: number

  async regenerateImpulse(){
    const minVal = 1/(2^16)
    const totalLength = this.decayTime + this.preDelay

    const expFactor = Math.log(minVal) / this.decayTime
    const myArrayBuffer = this.audioContext.createBuffer(
      2,
      this.audioContext.sampleRate * totalLength,
      this.audioContext.sampleRate,
    )
    for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
      // This gives us the actual array that contains the data
      const nowBuffering = myArrayBuffer.getChannelData(channel);
      for (let i = 0; i < myArrayBuffer.length; i++) {
        if(i / this.audioContext.sampleRate > this.preDelay){
          nowBuffering[i] = Math.exp(expFactor*(i/this.audioContext.sampleRate - this.preDelay))*(Math.random() * 2 - 1)
        }
      }
    }

    this.webAudioNodes.convolver.buffer = myArrayBuffer
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.gainNode = context.createGain()
    this.webAudioNodes.convolver = context.createConvolver()
    this.webAudioNodes.gainNode.connect(this.webAudioNodes.convolver)

    this.preDelay = 0.01
    this.decayTime = 1.0

    this.regenerateImpulse()

    this.inputNode = this.webAudioNodes.gainNode
    this.outputNode = this.webAudioNodes.convolver

    this.createWetDry()

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams()
    this.setupKnobs()
  }

  async setup({impulse, ...rest}) {
    this.updateParamIfChanged(0, rest["wet-dry"])
    if(impulse){
      if (this.impulseURL != impulse) {
        const arraybuffer = await loadSample(impulse)
        this.impulseBuffer = await this.audioContext.decodeAudioData(arraybuffer)
        this.webAudioNodes.convolver.buffer = this.impulseBuffer
        this.impulseURL = impulse
      }
    }
    else{
      const decayTime = rest["decay-time"]
      const preDelay = rest["predelay"]
      let needsUpdate = false
      if(decayTime){
        const parsedDecayTime = parseFloat(decayTime)
        if(this.decayTime !== parsedDecayTime){
	        this.decayTime = parsedDecayTime 
          needsUpdate = true
        }
      }
      if(preDelay){
        const parsedPreDelay = parseFloat(preDelay)
        if(this.preDelay !== parsedPreDelay){
	        this.preDelay = parsedPreDelay 
          needsUpdate = true
        }
      }

      if(needsUpdate){
        await this.regenerateImpulse()
      }
    }

    return this
  }
}

export { ConvolutionReverb }
