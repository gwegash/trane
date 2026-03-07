import { isNil } from "./instruments"
import { Effect } from "./effect"
import { CrossfaderNode } from "./crossfader"

function createTriangleOscillator(audioContext, phase){
  const numComponents = 2048
  const real = new Float32Array(numComponents)
  const imag = new Float32Array(numComponents)

  real[0] = 0
  imag[0] = 0


  for (let i = 1; i < numComponents; i++){
    const piFactor = 2 / (i * Math.PI);
    if(i&1){
      imag[i] = 2 * (piFactor * piFactor) *(((i - 1) >> 1) & 1 ? -1 : 1)*Math.cos(phase*i)
      real[i] = -2 * (piFactor * piFactor) * (((i - 1) >> 1) & 1 ? -1 : 1)*Math.sin(phase*i)
    }
    else{
      imag[i] = 0
      real[i] = 0
    }
  }

  const wave = audioContext.createPeriodicWave(real, imag, {disableNormalization: false})
  const osc = audioContext.createOscillator()
  osc.setPeriodicWave(wave)
  osc.start()
  return osc
}

function createSawtoothOscillator(audioContext, phase){
  const numComponents = 2048
  const real = new Float32Array(numComponents)
  const imag = new Float32Array(numComponents)

  real[0] = 0
  imag[0] = 0

  for (let i = 1; i < numComponents; i++){
    imag[i] = ((i%2 == 0) ? -1 / i : 1/i)*Math.cos(phase*i)
    real[i] = ((i%2 == 0) ? -1 / i : 1/i)*Math.sin(phase*i)
  }

  const wave = audioContext.createPeriodicWave(real, imag, {disableNormalization: false})
  const osc = audioContext.createOscillator()
  osc.setPeriodicWave(wave)
  osc.start()
  return osc
}

class Octaver extends Effect {
  static friendlyName = "octaver"

  params = [{ name: "wet-dry", path: "crossfaderNode.panner.pan", min: -1, max: 1 }]

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    this.webAudioNodes.inputGain = context.createGain()

    this.webAudioNodes.delayL = context.createDelay()
    this.webAudioNodes.delayR = context.createDelay()

    this.webAudioNodes.lfoL = createSawtoothOscillator(context, 0)

    this.webAudioNodes.lfoR = createSawtoothOscillator(context, Math.PI)

    this.webAudioNodes.delayCrossfader = new CrossfaderNode(context)
    this.webAudioNodes.lfoCrossfader = createTriangleOscillator(context, Math.PI/2)

    //now we wire
    this.webAudioNodes.delayL.connect(this.webAudioNodes.delayCrossfader.getLeft())
    this.webAudioNodes.delayR.connect(this.webAudioNodes.delayCrossfader.getRight())

    this.webAudioNodes.lfoCrossfader.connect(this.webAudioNodes.delayCrossfader.panner.pan)

    this.webAudioNodes.lfoL.connect(this.webAudioNodes.delayL.delayTime)
    this.webAudioNodes.lfoR.connect(this.webAudioNodes.delayR.delayTime)


    this.inputNode = this.webAudioNodes.inputGain

    this.createWetDry()

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.resolveParams()
    this.setupKnobs()
  }

  async setup({...rest}) {
    this.updateParamIfChanged(0, rest["wet-dry"])
  }
}

export { ConvolutionReverb }
