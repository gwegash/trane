import {Effect} from "./effect"
import {Knob} from "./knob"

class Constant extends Effect {

    static friendlyName = "constant"

    params = [
        {name: "constant", path: "constantSource.offset", min: 0.001, max: 12000.0, logScale: true},
    ]

    setup(){ //TODO programmable, customizable min/max
    }

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.webAudioNodes.constantSource = context.createConstantSource()
        this.webAudioNodes.constantSource.start()

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.outputNode = this.webAudioNodes.constantSource
        this.outputNode = this.webAudioNodes.constantSource

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }

}

export {Constant}
