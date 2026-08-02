import { Synth } from "./synth"
import { DrumSampler } from "./sampler_instrument"
import { BreakbeatSampler } from "./breakbeat_instrument"
import { PitchedSampler } from "./pitched_sampler"
import { ConvolutionReverb } from "./reverb"
import { Compressor } from "./compressor"
import { Delay } from "./delay"
import { Distortion } from "./distortion"
import { Gain } from "./gain"
import { Output } from "./master_out"
import { LoopInstrument } from "./loop_instrument"
import { Biquad } from "./biquad"
import { Oscillator } from "./oscillator"
import { Constant } from "./constant"
import { Scope } from "./scope"
import { LFO } from "./lfo"
import { MIDIInst } from "./midi_inst"
import { Chorus } from "./chorus"
import { LineIn } from "./line_in_inst"
import { Panner } from "./panner"
import { LadderFilter } from "./ladder_filter"
import { TB303 } from "./tb303"
import { Keyboard } from "./keyboard"
import type { GraphNode, Instrument, NodeDef } from "./instruments"
import { Wire } from "./wire"
import "./css/fonts.css"
import { instrumentElement as instrumentEl } from "./index"
import { Timestretcher } from "timestretcher"
import { init as initLoopManager } from "./loop_manager"

let instruments
const instrumentsByName: Record<string, GraphNode> = {} //a mapping from instrumentName to
let context
let nullGain //for chrome based implementation details on constant sources

const instMap = Object.fromEntries(
  [
    Output,
    Synth,
    Gain,
    DrumSampler,
    BreakbeatSampler,
    PitchedSampler,
    ConvolutionReverb,
    Delay,
    MIDIInst,
    Distortion,
    Keyboard,
    Compressor,
    Biquad,
    Constant,
    Oscillator,
    LFO,
    Scope,
    Panner,
    LoopInstrument,
    Chorus,
    LineIn,
    LadderFilter,
    TB303,
  ].map((nodeType) => [nodeType.def.name, nodeType]),
)

function createNode(typeName: string, name: string) {
  if (typeName === Wire.def.name) {
    return new Wire(name)
  }
  return new instMap[typeName](context, instrumentEl, name)
}

//This populates a table of instruments and their respective parameters, and passes it to janet so that the parameters can be checked and encoded
function paramsAsJanet() {
  const types = Object.values(instMap)
    .map((nodeType) => {
      const names = Object.keys((nodeType.def as NodeDef).params ?? {})
      if (names.length === 0) {
        return undefined
      }
      const entries = names.map((name, i) => `:${name} ${i}`).join(" ")
      return `:${nodeType.def.name} @{${entries}}`
    })
    .filter(Boolean)
  return `@{${types.join(" ")}}`
}

async function initWorklets() {
  await Promise.all(
    [
      "loop_worker.js", //TODO rename to worklet
      "filter_worklet.js",
      "envelope_worklet.js",
    ].map(
      async (worker_url) => await context.audioWorklet.addModule(worker_url),
    ),
  )
}
async function initAudio() {
  //don't bother if we've already started the context
  if (context) {
    return
  }

  context = new AudioContext({ sampleRate: 48000, latencyHint: 0.00001 })
  initLoopManager() //no-op if already initialised
  nullGain = context.createGain()
  nullGain.gain.value = 0.0
  nullGain.connect(context.destination)

  // init worklet modules
  //
  await Timestretcher.init()
  await initWorklets()
  setInterval(() => console.log("latency", context.baseLatency), 1000)
}

async function newInstrumentMappings(new_instrument_mappings) {
  const newInstruments = new Array(new_instrument_mappings.size()) //our new channel -> instrument array

  for (let i = 0; i < new_instrument_mappings.size(); i++) {
    const instrument_mapping = new_instrument_mappings.get(i)

    let inst

    // if we have already instantiated this instrument
    if (instrumentsByName[instrument_mapping.name]) {
      inst = instrumentsByName[instrument_mapping.name]
    } else {
      //we need to instantiate it
      inst = createNode(
        instrument_mapping.args.get(0).slice(1),
        instrument_mapping.name,
      )
      instrumentsByName[instrument_mapping.name] = inst
    }

    const argsMap = {} //call setup on already-instantiated instruments. TODO notice if an instrument has changed type
    for (let j = 1; j < instrument_mapping.args.size(); j += 2) {
      const val = instrument_mapping.args.get(j + 1)
      //Nils to undefined
      argsMap[instrument_mapping.args.get(j).slice(1)] = val === "nil" ? undefined : val
    }

    // Params first, by name, for anything with a def; then the instrument's own
    // handling of the args that aren't params. Wire has no params, hence the ?.
    inst.applyArgs?.(argsMap)
    inst.setup(argsMap)

    newInstruments[instrument_mapping.channel] = inst
  }

  // handle deletion of instruments that have gone

  const instsToDelete = instruments?.filter(
    (maybeOldInst: Instrument) =>
      !newInstruments.find((newInst) => newInst.name == maybeOldInst.name),
  )

  instsToDelete?.forEach((inst) => deleteInstrument(inst.name))

  instruments = newInstruments
  window.instruments = instruments
}

function deleteInstrument(name) {
  //TODO should delete an instrument after some time (for now lets just set up a time after which all sounds should have stopped)
  //
  console.log("deleting instrument " + name)
  const inst = instrumentsByName[name]
  instrumentsByName[name] = undefined
  setTimeout(() => inst.disconnect(), 10) //disconnect all webAudioNodes after 10ms
}

// I think this needs a rename
function play(channel, note, vel, startTime, dur) {
  //seconds
  if (channel >= 0) {
    //TODO rename this to routeEvent or something, it handles changes and plays
    instruments[channel].play(note, startTime, dur)
  } else {
    const chanNormalized = -channel - 1
    const paramIndex = ((1 << 5) - 1) & chanNormalized
    const channelIndex = chanNormalized >> 5
    //console.log(`param: ${paramIndex} chan: ${channelIndex}`)
    instruments[channelIndex].change(paramIndex, vel, note, startTime, dur)
  }
}

function instruments2GraphViz() {
  return instruments
    .filter((inst) => inst instanceof Wire)
    .map((wire) => {
      return `\"${wire.from}\" -> \"${wire.to}\" [label = \"${wire.toParam ? ":" + wire.toParam : ""}\"];`
    })
    .join("\n")
}

window.instruments2GraphViz = instruments2GraphViz

export {
  initAudio,
  play,
  context,
  newInstrumentMappings,
  instrumentsByName,
  instMap,
  paramsAsJanet,
  nullGain,
}
