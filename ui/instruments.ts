import {base0B as atomColor} from "./dark_theme"
import {resolvePath} from "./utils"
import {Knob} from "./knob"

interface Voice {
  signal: AudioNode
  envelopeGain : GainNode
}

function isVoice(audioNode : AudioNode | Voice){
    return ("signal" in audioNode && "envelopeGain" in audioNode)
}

interface Param {
    name : string
    path : string // string representation of a WebAudioNode parameter. Take a look at the WebAudioNodes interface below. Each of those Nodes has several params. Used to map names to WebAudio paths in the janet code
    min: number
    max: number
    logScale: boolean
}

interface WebAudioNodes {
  biquadNode? : BiquadFilterNode
  voices? : Map<number, Voice>
  gainNode? : GainNode
  attackNode? : ConstantSourceNode
  releaseNode? : ConstantSourceNode
  bufferSources? : Array<BufferSource>
  convolver? : ConvolverNode
  delay? : DelayNode
  waveshaper? : WaveShaperNode
  compressor? : DynamicsCompressorNode
  pannerNode? : StereoPannerNode
	mediaStreamNode?: MediaStreamAudioSourceNode
}

class GraphNode {
    audioContext: AudioContext
    webAudioNodes : WebAudioNodes = {}
    outputNode: AudioNode
    name : string
    el : Element
    knobsEl : Element
    params : Array<Param>
    resolvedParams : Array<AudioParam>
    friendlyName : string //name given in the language
  
    constructor(context : AudioContext, parentEl : Element, name : string){
        this.audioContext = context
        this.name = name

        this.el = document.createElement("div")
        this.el.className = "instrument"
        parentEl.appendChild(this.el)

        const nameEl = document.createElement("p")
        nameEl.className = "instrument-name"
        nameEl.style.color = atomColor
        nameEl.innerText = this.name
        this.el.appendChild(nameEl)
    }

    async setup(){
        return this
    }

    setupKnobs(){ //TODO knob deletion
        this.params.forEach(param => {
            const splitPath = param.path.split(".")
            const resolvedParam = resolvePath(this.webAudioNodes, splitPath)
            new Knob(this.audioContext, this.knobsEl, resolvedParam, param.name, param.min, param.max, param.logScale)
        })
    }

    /*
     * Resolves this effects parameters, puts a reference to each audio param inside of resolvedParams in the order they appear in params for fast lookup at play time.
     */
    resolveParams(){
        this.resolvedParams = []

        this.params.forEach(param => {
            const splitPath = param.path.split(".")
            const resolvedParam = resolvePath(this.webAudioNodes, splitPath)
            this.resolvedParams.push(resolvedParam)
        })
    }

    //eslint-disable-next-line
    change(paramIndex : number, type : number, to : number, startTime : number, dur : number){
        if(type < 0 ){
            this.resolvedParams[paramIndex].setTargetAtTime(to, startTime, -type)
        }
        else if(type === 0){
            this.resolvedParams[paramIndex].linearRampToValueAtTime(to, startTime)
        }
        else if(type === 1){
            this.resolvedParams[paramIndex].exponentialRampToValueAtTime(to, startTime)
        }
        else if(type === 2){
            this.resolvedParams[paramIndex].setValueAtTime(to, startTime)
        }
    }

    disconnect(){
        Object.values(this.webAudioNodes).forEach(node => {
            node.disconnect()
        })
        this.el.remove()
    }

    _generate_params(){ //gyah, get rid of this somewhere
    console.log(
    `:${this.friendlyName} @{
        ${this.params?.map((param, i) => ':' + param.name + ' ' + i).join('\n')}
        }
    `
    )
    }
}

class Instrument extends GraphNode{
  
    //eslint-disable-next-line
    play(note, startTime, dur){
    }

    disconnect(){
        Object.values(this.webAudioNodes).forEach(node => {
            if(!node.disconnect){
                node.forEach(n => {
                    if(isVoice(n)){
                        n.signal.stop()
                        n.signal.disconnect()
                        n.envelopeGain.disconnect()
                    }
                })
            }
            else{
                node.disconnect()
            }
        })
        this.el.remove()
    }
}

export {GraphNode, Instrument, WebAudioNodes, Param}
