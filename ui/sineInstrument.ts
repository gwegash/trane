import {Instrument} from "./instruments"
import {Knob} from "./knob"
import {note_to_frequency} from "./utils"
import {nullGain} from "./audio"
//import "./css/synth.css"


// oscillators[i] -> envelopeGain -> gain -> output
class SawSynth extends Instrument {

    static friendlyName = "synth"
    oscillatorType = "sawtooth"

    params = [
	    {name: "gain", path: "gainNode.gain", min: 0.001, max: 1, lastValue: 1.0},
	    {name: "attack", path: "attackNode.offset", min: 0, max: 1, lastValue: 0.01},
	    {name: "release", path: "releaseNode.offset",min: 0, max: 1, lastValue: 0.01},
    ]

    /*
     * Adds an oscillatorEnvelope to the WebAudioNodes
     */

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

    removeVoice(voice){
        voice.signal.stop()
        voice.signal.disconnect()
        voice.envelopeGain.disconnect()
    }

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)

        this.webAudioNodes.gainNode = context.createGain()
        this.webAudioNodes.gainNode.gain.value = 0.5
        this.outputNode = this.webAudioNodes.gainNode

        this.webAudioNodes.attackNode = context.createConstantSource()
        this.webAudioNodes.attackNode.start()
        this.webAudioNodes.attackNode.connect(nullGain)
        this.webAudioNodes.releaseNode = context.createConstantSource()
        this.webAudioNodes.releaseNode.start()
        this.webAudioNodes.releaseNode.connect(nullGain)

        this.webAudioNodes.attackNode.offset.value = 0.01
        this.webAudioNodes.releaseNode.offset.value = 0.01

        //instantiate our oscillators
        this.webAudioNodes.voices = {}

        this.setupUI()
    }

    setup({wave, gain, attack, release}){
        this.oscillatorType = wave
        for (let osc of Object.values(this.webAudioNodes.voices)){
            osc.signal.type = wave
        }
	this.updateParamIfChanged(0, gain)
	this.updateParamIfChanged(1, attack)
	this.updateParamIfChanged(2, release)
    }

    //TODO oscillator cleanup
    play(note, startTime, dur){ //seconds dur === 0 means noteOff, dur<0 means noteOn. Else play for duration
        let voice
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

        const frequency = note_to_frequency(note)
        voice.signal.frequency.setTargetAtTime(frequency, startTime, 0.001)

        if(dur > 0){
            voice.envelopeGain.gain.setValueAtTime(0, startTime)
            voice.envelopeGain.gain.linearRampToValueAtTime(1, startTime + Math.min(this.webAudioNodes.attackNode.offset.value, dur))
            voice.envelopeGain.gain.setValueAtTime(1, startTime + dur)
            voice.envelopeGain.gain.linearRampToValueAtTime(0, startTime + dur + this.webAudioNodes.releaseNode.offset.value)

            setTimeout(() => this.removeVoice(voice), (startTime - this.audioContext.currentTime + dur + this.webAudioNodes.releaseNode.offset.value)*1000 + 3000) //3 second just to be sure
        }
        else if(dur < 0){
            voice.envelopeGain.gain.setValueAtTime(0, startTime)
            voice.envelopeGain.gain.linearRampToValueAtTime(1, startTime + this.webAudioNodes.attackNode.offset.value)
        }
        else if(dur === 0){
            voice.envelopeGain.gain.cancelScheduledValues(startTime)
            voice.envelopeGain.gain.setValueAtTime(voice.envelopeGain.gain.value, startTime)
            voice.envelopeGain.gain.linearRampToValueAtTime(0, startTime + this.webAudioNodes.releaseNode.offset.value)
        }

    
    }

    setupUI(){

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)
	this.resolveParams()
	this.setupKnobs()
    }
}

export {
    SawSynth
}
