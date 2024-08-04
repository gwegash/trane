import {SawSynth} from "./sineInstrument"
import {Sampler} from "./sampler_instrument"
import {BreakbeatSampler} from "./breakbeat_instrument"
import {PitchedSampler} from "./pitched_sampler"
import {ConvolutionReverb} from "./reverb"
import {Compressor} from "./compressor"
import {Delay} from "./delay"
import {Distortion} from "./distortion"
import {Gain} from "./gain"
import {Output} from "./master_out"
import {LoopInstrument} from "./loop_instrument"
import {Biquad} from "./biquad"
import {Oscillator} from "./oscillator"
import {Constant} from "./constant"
import {Scope} from "./scope"
import {LFO} from "./lfo"
import {MIDIInst} from "./midi_inst"
import {Chorus} from "./chorus"
import {LineIn} from "./line_in_inst"
import {Panner} from "./panner"
import type {GraphNode, Instrument} from "./instruments"
import type {Effect} from "./effect"
import {Wire} from "./wire"
import "./css/fonts.css"
import {bpm} from "./index"

let instruments
const instrumentsByName: Record<string, Effect> = {} //a mapping from instrumentName to 
let context
let instrumentEl

const instMap = Object.fromEntries(
  [Output, SawSynth, Gain, Sampler, BreakbeatSampler, PitchedSampler, ConvolutionReverb, 
    Delay, MIDIInst, Distortion, Compressor, Biquad, Constant, Oscillator, LFO, Scope, Panner, 
    LoopInstrument, Chorus, LineIn].map(instDef => [instDef.friendlyName, instDef]))

function friendlyNameToInstrument(friendlyName, name) { //TODO refactor this
  if(friendlyName === "wire"){
    return new Wire(name)
  }
  else{
    return new instMap[friendlyName](context, instrumentEl, name)
  }
}

async function initAudio(instrumentElement : DOMElement) {
    //don't bother if we've already started the context
    if(context){
      return
    }
	
    console.log(Output.friendlyName)
    context = new AudioContext({latencyHint: 0})
    instrumentEl = instrumentElement
    // init worklet modules
    await context.audioWorklet.addModule("loop_worker.js")
}

async function newInstrumentMappings(new_instrument_mappings){
    const newInstruments = new Array(new_instrument_mappings.size()) //our new channel -> instrument array

    for (let i = 0; i<new_instrument_mappings.size(); i++){
        const instrument_mapping = new_instrument_mappings.get(i)

        let inst

        // if we have already instantiated this instrument
        if(instrumentsByName[instrument_mapping.name]){
            inst = instrumentsByName[instrument_mapping.name]
        }
        else{
            //we need to instantiate it
            inst = await friendlyNameToInstrument(instrument_mapping.args.get(0).slice(1), instrument_mapping.name)
            instrumentsByName[instrument_mapping.name] = inst
        }

        const argsList: string[] = [] //call setup on already-instantiated instruments. TODO notice if an instrument has changed type
        for (let j = 1; j<instrument_mapping.args.size(); j++){
            argsList.push(instrument_mapping.args.get(j))
        }

        inst.setup(...argsList)

        newInstruments[instrument_mapping.channel] = inst
    }

    // handle deletion of instruments that have gone

    const instsToDelete = instruments?.filter((maybeOldInst : Instrument) => !newInstruments.find(newInst => newInst.name == maybeOldInst.name))

    instsToDelete?.forEach(inst => deleteInstrument(inst.name))

    instruments = newInstruments
    window.instruments = instruments
}

function deleteInstrument(name){ //TODO should delete an instrument after some time (for now lets just set up a time after which all sounds should have stopped)
//  
    console.log("deleting instrument " + name)
    const inst = instrumentsByName[name]
    instrumentsByName[name] = undefined
    setTimeout(() => inst.disconnect(), 10) //disconnect all webAudioNodes after 10ms
}


// I think this needs a rename
function play(channel, note, vel, startTime, dur){ //seconds
    if(channel >= 0){ //TODO rename this to routeEvent or something, it handles changes and plays
        instruments[channel].play(note, startTime, dur)
    }
    else{
        const chanNormalized = -(channel) - 1
        const paramIndex = ((1<<5) - 1) & chanNormalized
        const channelIndex = chanNormalized >> 5
        //console.log(`param: ${paramIndex} chan: ${channelIndex}`)
        instruments[channelIndex].change(paramIndex, vel, note, startTime, dur)
    }
}

function instruments2GraphViz(){
  return instruments.filter(inst => inst.friendlyName == "wire").map(wire => {
    return `\"${wire.from}\" -> \"${wire.to}\" [label = \"${wire.toParam ? ":" + wire.toParam : "" }\"];`
  }).join("\n")
}

window.instruments2GraphViz = instruments2GraphViz

export {
    initAudio,
    play,
    context,
    newInstrumentMappings,
    instrumentsByName,
    instMap,
}
