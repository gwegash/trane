import {Effect} from "./effect"
import {Knob} from "./knob"
import {loadSample} from "./utils"


class Scope extends Effect {

    buffer : AudioBuffer
    canvas : Element
    ctx //TODO this is overloaded with audiocontext, rename!
    height = 65
    width = 150
    fftSize = 2048

    friendlyName = "scope"

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)

        this.webAudioNodes.analyserNode = context.createAnalyser()
        this.webAudioNodes.analyserNode.fftSize = this.fftSize
        this.buffer = new Uint8Array(this.webAudioNodes.analyserNode.frequencyBinCount)

        this.inputNode = this.webAudioNodes.analyserNode
        this.outputNode = this.webAudioNodes.analyserNode

        this.setupUI()
    }

    async setup(){
      return this
    }

    setupUI(){

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.canvas = document.createElement("canvas")

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style.width = this.width
        this.canvas.style.height = this.height
        this.knobsEl.appendChild(this.canvas)

        this.ctx = this.canvas.getContext("2d")
        this.ctx.strokeStyle = "white"
        this.draw()

    }

    draw(){
        this.ctx.clearRect(0, 0, this.width, this.height)

        this.ctx.font = "5px pixeled"

        this.ctx.beginPath()
        this.ctx.moveTo(0, this.height/2)

        //draw our waveform
        let x = 0

        this.webAudioNodes.analyserNode.getByteTimeDomainData(this.buffer)
        //pcm data is in [-1.0,1.0]
        const sampleStride = Math.ceil(this.buffer.length/this.width)

        //TODO zooming, split the range of channel data before iterating, faster!
        for (let sample = 0; sample < this.buffer.length; sample+=sampleStride){
            this.ctx.lineTo(x, this.buffer[sample]*this.height/256)
            x++
        }

        //this.ctx.lineTo(this.width, this.height/2)
        this.ctx.stroke()
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

export {Scope}
