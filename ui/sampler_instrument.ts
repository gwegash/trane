import {Instrument} from "./instruments"
import {loadSample} from "./utils"

interface SampleBuffer { // Represents an individual hit
    sampleURL : string
    buffer: AudioBuffer 
    opacity : number
    lastHitTime: number
}

class Sampler extends Instrument {

    static friendlyName = "drums"
    height = 65
    width = 65
    ctx
    canvas

    settings = {
        detune: 0,
        loop: false,
        loopStart: 0,
        loopEnd: 100,
        playbackRate: 1
    }
    buffers: Array<SampleBuffer>

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)

        this.webAudioNodes.gainNode = context.createGain()
        this.webAudioNodes.gainNode.gain.value = 1.0

        this.outputNode = this.webAudioNodes.gainNode
        this.buffers = []
    }

    async setup({hits}){
        const samples = hits.slice(1,-1).split(" ").map(str => str.replaceAll("\"", ""))
        const newBuffers = Array(samples.length)
        await Promise.all(samples.map(async (sampleURL, i) => {
            const sampleBuffer: SampleBuffer = {}
            if(this.buffers[i]?.sampleURL != sampleURL){
                const buffer = await loadSample(sampleURL)
                const decoded = await this.audioContext.decodeAudioData(buffer)
                sampleBuffer.buffer = decoded
                sampleBuffer.sampleURL = sampleURL
            }
            else {
                sampleBuffer.buffer = this.buffers[i].buffer
                sampleBuffer.sampleURL = sampleURL
            }
            newBuffers[i] = sampleBuffer
        }))
        this.buffers = newBuffers
        return this
    }

    play(note, startTime, dur){
        const player = this.audioContext.createBufferSource()
        player.connect(this.webAudioNodes.gainNode)
        player.buffer = this.buffers[Math.floor(note) % this.buffers.length]?.buffer
        player.start(startTime)
        if(dur >= 0) {
            player.stop(startTime + dur)
        }
        else {
            player.stop(startTime + player.buffer?.duration || 0)
        }
    }
}

export {Sampler}
