import {Sampler} from "./sampler_generic"
import {note_to_frequency} from "./utils"
import {nullGain} from "./audio"

class PitchedSampler extends Sampler {

    static friendlyName = "pitched_sampler"
    samplePitch : number
    params = [
	    {name: "gain", path: "gainNode.gain", min: 0.001, max: 1, lastValue: 1.0},
	    {name: "attack", path: "attackNode.offset", min: 0, max: 1, lastValue: 0.01},
	    {name: "release", path: "releaseNode.offset",min: 0, max: 1, lastValue: 0.01},
    ]

    //TODO this is shared almost verbatim between the synth and this. Maybe refactor into instrument?
    addVoice(){
    
        const voice = {
            envelopeGain : this.audioContext.createGain(),
        }

        voice.envelopeGain.gain.setValueAtTime(0, this.audioContext.currentTime)
        voice.envelopeGain.connect(this.webAudioNodes.gainNode)

        return voice
    }

    removeVoice(voice){
        voice.envelopeGain.disconnect()
        voice.signal.stop(this.audioContext.currentTime)
    }

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
	    this.params = [
		    {name: "gain", path: "gainNode.gain", min: 0.001, max: 1, lastValue: 1.0},
		    {name: "attack", path: "attackNode.offset", min: 0, max: 1, lastValue: 0.01},
		    {name: "release", path: "releaseNode.offset",min: 0, max: 1, lastValue: 0.01},
	    ]

        this.webAudioNodes.attackNode = context.createConstantSource()
        this.webAudioNodes.attackNode.start()
        this.webAudioNodes.attackNode.connect(nullGain)
        this.webAudioNodes.releaseNode = context.createConstantSource()
        this.webAudioNodes.releaseNode.start()
        this.webAudioNodes.releaseNode.connect(nullGain)

        this.webAudioNodes.attackNode.offset.value =  
        this.webAudioNodes.releaseNode.offset.value = 0.01

        //instantiate our oscillators
        this.webAudioNodes.voices = {}
        this.setupUI()
    }

    async setup({url, pitch, gain, attack, release}){

        if(pitch){
            this.samplePitch = parseFloat(pitch)
        }
        else{
            this.samplePitch = 69.0
        }

	this.updateParamIfChanged(0, gain)
	this.updateParamIfChanged(1, attack)
	this.updateParamIfChanged(2, release)

        super.setup(url)

        return this
    }

    play(note, startTime, dur){
        let voice

        const sampleFreq = note_to_frequency(this.samplePitch)
        const desiredFreq = note_to_frequency(note)

        const playbackRate = desiredFreq/sampleFreq

        if(dur > 0){
            voice = this.addVoice()
        }
        else if(dur < 0){
            voice = this.addVoice()
            this.webAudioNodes.voices[note] = voice
        }
        else {
            voice = this.webAudioNodes.voices[note]
            delete this.webAudioNodes.voices[note] // this is on its way out
            setTimeout(() => this.removeVoice(voice), 5000) //5 second deletion? might eat into release time
        }

        if(dur > 0){
            voice.envelopeGain.gain.setValueAtTime(0, startTime)
            voice.envelopeGain.gain.linearRampToValueAtTime(1, startTime + Math.min(this.webAudioNodes.attackNode.offset.value, dur))
            voice.envelopeGain.gain.setValueAtTime(1, startTime + dur)
            voice.envelopeGain.gain.linearRampToValueAtTime(0, startTime + dur + this.webAudioNodes.releaseNode.offset.value)

            voice.signal = this.playSample(startTime, dur + this.webAudioNodes.releaseNode.offset.value, 0, playbackRate, voice.envelopeGain)
            setTimeout(() => this.removeVoice(voice), (startTime - this.audioContext.currentTime + dur + this.webAudioNodes.releaseNode.offset.value)*1000 + 3000) //3 second just to be sure
        }
        else if(dur < 0){
            voice.envelopeGain.gain.setValueAtTime(0, startTime)
            voice.envelopeGain.gain.linearRampToValueAtTime(1, startTime + this.webAudioNodes.attackNode.offset.value)
            voice.signal = this.playSample(startTime, dur + this.webAudioNodes.releaseNode.offset.value, 0, playbackRate, voice.envelopeGain)
        }
        else if(dur === 0){
            voice.envelopeGain.gain.linearRampToValueAtTime(0, startTime + this.webAudioNodes.releaseNode.offset.value)
        }

    }

    draw(){
        super.draw()
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

export {PitchedSampler}
