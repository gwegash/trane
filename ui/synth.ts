import { Instrument } from "./instruments"
import { note_to_frequency } from "./utils"
import { nullGain } from "./audio"
import { EnvelopeNode } from "./envelope"
//import "./css/synth.css"

interface Voice {
  signal: OscillatorNode
  envelope: EnvelopeNode
}

// oscillators[i] -> envelopeGain -> gain -> output
class Synth extends Instrument {
  static def = {
    name: "synth",
    params: {
      gain: { at: (n) => n.gainNode.gain, min: 0.001, max: 1, default: 1.0 },
      attack: { at: (n) => n.attackNode.offset, min: 0, max: 1, default: 0.01 },
      release: {
        at: (n) => n.releaseNode.offset,
        min: 0,
        max: 1,
        default: 0.01,
      },
    },
  }

  oscillatorType = "sawtooth"

  /*
   * Adds an oscillatorEnvelope to the WebAudioNodes
   *
   */

  addVoice(): Voice {
    const voice = {
      signal: this.audioContext.createOscillator(),
      envelope: new EnvelopeNode(this.audioContext),
    }

    voice.signal.type = this.oscillatorType
    voice.signal.connect(voice.envelope.gain)
    voice.signal.start()
    voice.envelope.connect(this.webAudioNodes.gainNode)

    return voice
  }

  removeVoice(voice) {
    voice.signal.stop()
    voice.signal.disconnect()
    voice.envelope.disconnect()
  }

  constructor(context: AudioContext, parentEl: Element, name: string) {
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

    this.voice = this.addVoice()
  }

  async setup({ wave }) {
    if (wave) this.oscillatorType = wave
    for (const osc of Object.values(this.webAudioNodes.voices)) {
      osc.signal.type = wave
    }
    return this
  }

  //TODO oscillator cleanup
  play(note, startTime, dur) {
    //seconds dur === 0 means noteOff, dur<0 means noteOn. Else play for duration
    let voice: Voice
    if (dur > 0) {
      voice = this.addVoice()
    } else if (dur < 0) {
      voice = this.addVoice()
      this.webAudioNodes.voices[note] = voice
    } else {
      voice = this.webAudioNodes.voices[note]
      delete this.webAudioNodes.voices[note] // this is on its way out
      setTimeout(() => this.removeVoice(voice), 5000) //5 second deletion? might eat into release time
    }

    const frequency = note_to_frequency(note)
    voice.signal.frequency.setTargetAtTime(frequency, startTime, 0.001)

    if (dur > 0) {
      voice.envelope.play(
        startTime,
        dur,
        1.0,
        this.webAudioNodes.attackNode.offset.value,
        0.1,
        0.9,
        this.webAudioNodes.releaseNode.offset.value,
      )

      setTimeout(
        () => this.removeVoice(voice),
        (startTime -
          this.audioContext.currentTime +
          dur +
          this.webAudioNodes.releaseNode.offset.value) *
          1000 +
          3000,
      ) //3 second just to be sure
    } else if (dur < 0) {
      voice.envelope.noteOn(startTime, 
        1.0,
        this.webAudioNodes.attackNode.offset.value,
        0.1,
        0.9)
    } else if (dur === 0) {
      voice.envelope.noteOff(startTime, 
        this.webAudioNodes.releaseNode.offset.value
      )
    }
  }

  setupUI() {
    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)
    this.resolveParams()
    this.setupKnobs()
  }
}

export { Synth }
