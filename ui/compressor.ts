import {Effect} from "./effect"

class Compressor extends Effect {

    static friendlyName = "compressor"
    params = [
        {name: "threshold", path: "compressor.threshold", min: -100, max: 0},
        {name: "knee", path: "compressor.knee", min: 0, max: 40},
        {name: "ratio", path: "compressor.ratio", min: 1, max: 20},
        {name: "attack", path: "compressor.attack", min: 0, max: 1 },
        {name: "release", path: "compressor.release",min: 0, max: 1 },
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.compressor = context.createDynamicsCompressor()
        this.inputNode = this.webAudioNodes.compressor
        this.outputNode = this.webAudioNodes.compressor

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }

}

export {Compressor}
