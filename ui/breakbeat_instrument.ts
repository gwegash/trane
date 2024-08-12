import {Sampler} from "./sampler_generic"
import {bpm} from "./index"

class BreakbeatSampler extends Sampler {

    static friendlyName = "breakbeat_sampler"
    length_bars = 8 //default to two bars
    sampleStart = 0
    sampleEnd = 1
    slices = [this.sampleStart]
    slicesWithEnd = [this.sampleStart, this.sampleEnd] //for visualisation

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.setupUI()
    }

    async setup({url, length_beats, slices}){ //TODO make bpm dynamic
        this.length_bars = parseFloat(length_beats)
        const parsedSlices = slices.slice(1, -1).split(" ").map(slice => parseFloat(slice))
        this.sampleStart = parsedSlices[0]
        this.sampleEnd = parsedSlices[parsedSlices.length - 1]
        this.slices = parsedSlices.slice(0, -1) //ignore last slice, it's the end marker, not an onset
        this.slicesWithEnd = [...this.slices, this.sampleEnd]
        super.setup(url)
        return this
    }

    play(note, startTime, dur){
        if(this.buffer){
            const wantSampleLength_s = (this.length_bars/bpm) * 60 //the sample length we want to squish down to

            const playbackRate = (this.sampleEnd-this.sampleStart)*this.buffer.duration/wantSampleLength_s
            //Don't include the end (last slice point) in this 
            const sliceTime = this.slices[(note % this.slices.length)] * this.buffer.duration

            //we get a noteOn, we just want to play the slice that they refer to, nothing else
            let playDur = dur
            if(dur < 0){
                //      seconds?        multiplier
                const sliceTime = this.slices[(note % this.slices.length)] * this.buffer.duration
                const nextSliceTime = this.slicesWithEnd[(note % this.slices.length) + 1] * this.buffer.duration
                playDur = (nextSliceTime - sliceTime)/playbackRate
            }

            this.playSample(startTime, playDur, sliceTime, playbackRate)
        }
    }

    /*
     * Gets the x position at a normalised time within a sample
     */
    getXForNTime(nTime: number){
        return nTime*this.width
    }

    drawSlices(){

        const start = this.getXForNTime(this.sampleStart)
        const end = this.getXForNTime(this.sampleEnd)
        this.ctx.beginPath()
        this.ctx.setLineDash([])
        this.ctx.moveTo(start, 0)
        this.ctx.lineTo(start, this.height)
        this.ctx.moveTo(end, 0)
        this.ctx.lineTo(end, this.height)
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.setLineDash([5, 5])
        this.slices.slice(1).forEach(slice => {
            const x = this.getXForNTime(slice)
            this.ctx.moveTo(x, 0)
            this.ctx.lineTo(x, this.height)
        })

        this.ctx.stroke()
    }

    draw(){
        super.draw()
        this.drawSlices()
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

export {BreakbeatSampler}
