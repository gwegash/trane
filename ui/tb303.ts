import { Instrument } from "./instruments"
import { note_to_frequency } from "./utils"
import { nullGain } from "./audio"
import filterWasm from "../src/cpp/ladder_filter.wasm"

// Signal chain: osc → ladder filter → vcaGain → gainNode
//
// The envelope is a single AudioWorkletNode (envelope-processor) whose gate
// AudioParam is scheduled with setValueAtTime — no knob values are sampled at
// schedule time.  attack/decay/sustain/release are k-rate AudioParams read by
// the worklet at processing time, so knob changes apply to notes already queued.
//
// VCA:    envNode output (0–1, amount=1)       → vcaGain.gain
// Filter: envNode output (0–envPeak Hz, scaled) → ladder filter cutoff (additive)
//         filterEnvScaler.gain = envPeak is recomputed in setup() whenever
//         cutoff or envMod changes, so it also reflects the latest knob value
//         at playback time rather than at schedule time.

class TB303 extends Instrument {
  static def = {
    name: "tb303",
    params: {
      gain: { at: (n) => n.gainNode.gain, min: 0.001, max: 1, default: 0.5 },
      cutoff: {
        at: (n) => n.filterNode.parameters.get("cutoff"),
        min: 40,
        max: 8000,
        log: true,
        default: 800,
      },
      resonance: {
        at: (n) => n.filterNode.parameters.get("Q"),
        min: 0.02,
        max: 2,
        default: 0.8,
      },
      envMod: {
        at: (n) => n.envModNode.offset,
        min: 0,
        max: 1,
        default: 0.5,
      },
      decay: {
        at: (n) => n.envNode.parameters.get("decay"),
        min: 0.01,
        max: 2,
        default: 0.3,
      },
      attack: {
        at: (n) => n.envNode.parameters.get("attack"),
        min: 0.001,
        max: 0.1,
        default: 0.005,
      },
      slide: {
        at: (n) => n.slideNode.offset,
        min: 0.001,
        max: 0.5,
        default: 0.05,
      },
    },
  }

  osc: OscillatorNode
  filterNode: AudioWorkletNode
  envNode: AudioWorkletNode      // single envelope drives both VCA and filter
  vcaGain: GainNode              // gain modulated by envNode output
  filterEnvScaler: GainNode      // scales 0–1 envelope to 0–(envMod×8000) Hz
  envModNode: ConstantSourceNode
  slideNode: ConstantSourceNode
  _sliding = false

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    const gainNode = context.createGain()
    gainNode.gain.value = 0.75
    this.webAudioNodes.gainNode = gainNode
    this.outputNode = gainNode

    // Oscillator
    this.osc = context.createOscillator()
    this.osc.type = "sawtooth"
    this.webAudioNodes.osc = this.osc

    // Ladder filter
    this.filterNode = new AudioWorkletNode(context, "filter-processor")
    this.filterNode.port.postMessage({ wasm: filterWasm.buffer })
    this.webAudioNodes.filterNode = this.filterNode

    // Envelope worklet — gate is driven by scheduled setValueAtTime calls in play()
    this.envNode = new AudioWorkletNode(context, "envelope-processor")
    this.webAudioNodes.envNode = this.envNode
    // sustain = 0 for classic 303-style AD envelope (no sustain phase)
    this.envNode.parameters.get("sustain")?.setValueAtTime(0, context.currentTime)

    // VCA: envelope (0–1) modulates vcaGain's gain AudioParam additively
    this.vcaGain = context.createGain()
    this.vcaGain.gain.value = 0   // silent until envelope opens it
    this.webAudioNodes.vcaGain = this.vcaGain
    this.envNode.connect(this.vcaGain.gain)

    // Filter envelope scaler: scales 0–1 envelope to 0–(envMod×8000) Hz.
    // filterEnvScaler.gain is driven by the audio graph (envModNode → envModMaxScaler),
    // so the envMod knob takes effect in real-time without needing setup().
    this.filterEnvScaler = context.createGain()
    this.filterEnvScaler.gain.value = 0  // driven entirely by envModMaxScaler
    this.webAudioNodes.filterEnvScaler = this.filterEnvScaler
    this.envNode.connect(this.filterEnvScaler)
    const cutoffParam = this.filterNode.parameters.get("cutoff")
    if (cutoffParam) this.filterEnvScaler.connect(cutoffParam)

    // Signal chain: osc → filter → vcaGain → gainNode
    this.osc.connect(this.filterNode)
    this.filterNode.connect(this.vcaGain)
    this.vcaGain.connect(gainNode)
    this.osc.start()

    // ConstantSource nodes for params not directly mapped to an AudioParam
    const makeParamSource = (value: number): ConstantSourceNode => {
      const node = context.createConstantSource()
      node.offset.value = value
      node.start()
      node.connect(nullGain)
      return node
    }

    // envModMaxScaler: scales envMod (0–1) to 0–8000 Hz range for filter envelope depth.
    // Wired: envModNode (DC=envMod) → envModMaxScaler (×8000) → filterEnvScaler.gain (additive).
    // When the envMod knob moves it updates envModNode.offset, which propagates immediately.
    const envModMaxScaler = context.createGain()
    envModMaxScaler.gain.value = 8000
    this.webAudioNodes.envModMaxScaler = envModMaxScaler

    this.envModNode = makeParamSource(0.2)
    this.envModNode.connect(envModMaxScaler)
    envModMaxScaler.connect(this.filterEnvScaler.gain)

    this.slideNode  = makeParamSource(0.02)
    this.webAudioNodes.envModNode = this.envModNode
    this.webAudioNodes.slideNode  = this.slideNode

    this.setupUI()
  }

  async setup({ wave }: Record<string, any>) {
    if (wave) this.osc.type = wave as OscillatorType
    return this
  }

  play(note: number, startTime: number, dur: number) {
    const gate = this.envNode.parameters.get("gate")!
    const freq = note_to_frequency(note)

    if (this._sliding) {
      this.osc.frequency.setTargetAtTime(freq, startTime, this.slideNode.offset.value)
    } else {
      this.osc.frequency.setValueAtTime(freq, startTime)
    }

    if (dur > 0) {
      gate.setValueAtTime(1, startTime)
      gate.setValueAtTime(0, startTime + dur)
      this._sliding = false
    } else if (dur < 0) {
      gate.setValueAtTime(1, startTime)
      this._sliding = true
    } else {
      gate.setValueAtTime(0, startTime)
      this._sliding = false
    }
  }

  disconnect() {
    this.osc.stop()
    super.disconnect()
  }

  setupUI() {
    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)
    this.resolveParams()
    this.setupKnobs()
  }
}

export { TB303 }
