import {Instrument} from "./instruments"
import {Knob} from "./knob"
import {note_to_frequency} from "./utils"
import "./css/synth.css"


// oscillators[i] -> envelopeGain -> gain -> output
class SawSynth extends Instrument {

    friendlyName = "synth"
    oscillatorType = "sawtooth"

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
        this.webAudioNodes.releaseNode = context.createConstantSource()
        this.webAudioNodes.releaseNode.start()

        this.webAudioNodes.attackNode.offset.value = 0.01
        this.webAudioNodes.releaseNode.offset.value = 0.01

        //instantiate our oscillators
        this.webAudioNodes.voices = new Map()

        this.setupUI()
    }

    setup(oscillator_type){
        this.oscillatorType = oscillator_type
        for (let osc of this.webAudioNodes.voices.values()){
            osc.signal.type = oscillator_type
        }
    }

    //TODO oscillator cleanup
    play(note, startTime, dur){ //seconds

        let voice = this.webAudioNodes.voices.get(note)
        if (!voice) {
            voice = this.addVoice()
            this.webAudioNodes.voices.set(note, voice)
        }
        const frequency = note_to_frequency(note)

        voice.signal.frequency.setValueAtTime(frequency, startTime)

        voice.envelopeGain.gain.cancelScheduledValues(startTime)
        voice.envelopeGain.gain.setValueAtTime(0, startTime)
        voice.envelopeGain.gain.linearRampToValueAtTime(1, startTime + this.webAudioNodes.attackNode.offset.value)
    
        if(dur >= 0){
            voice.envelopeGain.gain.linearRampToValueAtTime(0, startTime + dur + this.webAudioNodes.releaseNode.offset.value)
        }
    }

    setupUI(){

        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)
        const gainKnob = new Knob(this.audioContext, this.knobsEl, this.webAudioNodes.gainNode.gain, "gain", 0, 1)
        const attackKnob = new Knob(this.audioContext, this.knobsEl, this.webAudioNodes.attackNode.offset, "attack", 0, 1)
        const releaseKnob = new Knob(this.audioContext, this.knobsEl, this.webAudioNodes.releaseNode.offset, "release", 0, 1)
    }
}

export {
    SawSynth
}
