import {Sampler} from "./sampler_generic"
import {note_to_frequency} from "./utils"

class PitchedSampler extends Sampler {

    static friendlyName = "pitched_sampler"
    samplePitch : number

    addVoice(){
    
        const voice = {
            signal : this.audioContext.createOscillator(),
            envelopeGain : this.audioContext.createGain(),
        }

        voice.signal.type = this.oscillatorType
        voice.signal.connect(voice.envelopeGain)
        voice.signal.start()
        voice.envelopeGain.gain.setValueAtTime(0, this.audioContext.currentTime)
        voice.envelopeGain.connect(this.webAudioNodes.gainNode)

        return voice
    }

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
    }

    async setup(sampleURL, samplePitch){ //TODO make bpm dynamic

        if(samplePitch){
            this.samplePitch = parseFloat(samplePitch)
        }
        else{
            this.samplePitch = 69.0
        }

        super.setup(sampleURL)

        return this
    }

    play(note, startTime, dur){
        const sampleFreq = note_to_frequency(this.samplePitch)
        const desiredFreq = note_to_frequency(note)

        const playbackRate = desiredFreq/sampleFreq

        this.playSample(startTime, dur, 0, playbackRate)
    }

    draw(){
        super.draw()
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

export {PitchedSampler}
