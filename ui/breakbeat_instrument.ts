import {Sampler} from "./sampler_generic"
import {bpm} from "./index"

class BreakbeatSampler extends Sampler {

    length_bars = 8 //default to two bars
    numSlices = 4
    friendlyName = "breakbeat_sampler"

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
    }

    async setup(breakbeatURL, length_bars, num_slices){ //TODO make bpm dynamic

        this.length_bars = parseFloat(length_bars)
        this.numSlices = parseInt(num_slices)

	super.setup(breakbeatURL)

        return this
    }

    play(note, startTime, dur){
        if(this.buffer){
            const wantSampleLength_s = (this.length_bars/bpm) * 60 //the sample length we want to squish down to
            const playbackRate = this.buffer.duration/wantSampleLength_s

            const sliceTime = (note % this.numSlices) * this.buffer.duration/this.numSlices

            this.playSample(startTime, dur, sliceTime, playbackRate)
        }
    }

    draw(){
        super.draw()
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

export {BreakbeatSampler}
