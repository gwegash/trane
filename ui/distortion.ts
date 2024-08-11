import {Effect} from "./effect"

const DEG = Math.PI / 180;

function makeDistortionCurve(k = 50) {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  curve.forEach((_, i) => {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * DEG) / (Math.PI + k * Math.abs(x));
  });
  return curve;
}


class Distortion extends Effect {
    
    static friendlyName = "distortion"
    distortionCurve: Float32Array
    
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.waveshaper = context.createWaveShaper()
        this.inputNode = this.webAudioNodes.waveshaper
        this.outputNode = this.webAudioNodes.waveshaper
    }

    async setup({amount}){
	    let parsedAmount = parseFloat(amount)
        if(!parsedAmount){
            parsedAmount = 10
        }

        this.distortionCurve = makeDistortionCurve(parsedAmount)
        this.webAudioNodes.waveshaper.curve = this.distortionCurve
    }
}

export {Distortion}
