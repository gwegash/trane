import {Effect} from "./effect"

class Output extends Effect { //TODO this isn't really an effect. 

    static friendlyName = "out"

    params = [
        {name: "gain", path: "gainNode.gain", min: 0.001, max: 1.0, logScale: true},
    ]

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
	this.webAudioNodes.gainNode = this.audioContext.createGain()
	this.webAudioNodes.gainNode.connect(context.destination)
	this.webAudioNodes.gainNode.gain.setValueAtTime(0.75, context.currentTime)

        this.inputNode = this.webAudioNodes.gainNode
        this.outputNode = undefined //should error if someone tries to wire this to something :)

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.resolveParams()  //always call me after settings up your webAudioNodes!
        this.setupKnobs()
    }
}

export {Output}
