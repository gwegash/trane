// ADSR envelope AudioWorkletProcessor
// Outputs an audio-rate signal shaped by the gate and ADSR parameters.
// The `amount` param scales the output so it can directly drive an AudioParam.
//
// Usage (VCA):    envNode output -> vcaGain.gain  (amount = 1)
// Usage (filter): envNode output -> filter.cutoff (amount = envPeak Hz)

const IDLE    = 0
const ATTACK  = 1
const DECAY   = 2
const SUSTAIN = 3
const RELEASE = 4

class EnvelopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "gate",    defaultValue: 0,    minValue: 0,      maxValue: 1,      automationRate: "a-rate" },
      { name: "attack",  defaultValue: 0.01, minValue: 0.0001, maxValue: 10,     automationRate: "k-rate" },
      { name: "decay",   defaultValue: 0.1,  minValue: 0.0001, maxValue: 10,     automationRate: "k-rate" },
      { name: "sustain", defaultValue: 0.0,  minValue: 0,      maxValue: 1,      automationRate: "k-rate" },
      { name: "release", defaultValue: 0.05, minValue: 0.0001, maxValue: 10,     automationRate: "k-rate" },
      { name: "amount",  defaultValue: 1,    minValue: 0,      maxValue: 100000, automationRate: "k-rate" },
    ]
  }

  constructor() {
    super()
    this.level = 0
    this.phase = IDLE
    this.prevGate = 0
    this.releaseStartLevel = 0
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0][0]
    if (!output) return true

    const gate    = parameters.gate
    const attack  = parameters.attack[0]
    const decay   = parameters.decay[0]
    const sustain = parameters.sustain[0]
    const release = parameters.release[0]
    const amount  = parameters.amount[0]
    const isARate = gate.length > 1

    for (let i = 0; i < output.length; i++) {
      const g = isARate ? gate[i] : gate[0]

      // Edge detection — runs before phase update so edges take effect this sample
      if (g > 0.5 && this.prevGate <= 0.5) {
        this.phase = ATTACK
        this.level = 0            // hard retrigger from zero (303-style)
      } else if (g <= 0.5 && this.prevGate > 0.5) {
        this.releaseStartLevel = this.level
        this.phase = RELEASE
      }
      this.prevGate = g

      if (this.phase === ATTACK) {
        this.level += 1 / (attack * sampleRate)
        if (this.level >= 1) {
          this.level = 1
          this.phase = DECAY
        }
      } else if (this.phase === DECAY) {
        this.level -= (1 - sustain) / (decay * sampleRate)
        if (this.level <= sustain) {
          this.level = sustain
          this.phase = sustain > 1e-4 ? SUSTAIN : IDLE
        }
      } else if (this.phase === SUSTAIN) {
        this.level = sustain
        if (g <= 0.5) {
          this.releaseStartLevel = this.level
          this.phase = RELEASE
        }
      } else if (this.phase === RELEASE) {
        this.level -= this.releaseStartLevel / (release * sampleRate)
        if (this.level <= 0) {
          this.level = 0
          this.phase = IDLE
        }
      } else {
        this.level = 0
      }

      output[i] = this.level * amount
    }

    return true
  }
}

registerProcessor("envelope-processor", EnvelopeProcessor)
