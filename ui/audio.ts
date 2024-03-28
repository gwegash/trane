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
import {MIDIInst} from "./midi_inst"
import {LineIn} from "./line_in_inst"
import {Panner} from "./panner"
import type {Instrument} from "./instruments"
import {Wire} from "./wire"
import "./css/fonts.css"

let instruments
const instrumentsByName = {} //a mapping from instrumentName to 
let context
let instrumentEl
let bpm

function friendlyNameToInstrument(friendlyName, name) { //TODO refactor this
    if(friendlyName == "out"){
        return new Output(context, instrumentEl, name)
    }
    if(friendlyName == "synth"){
        return new SawSynth(context, instrumentEl, name)
    }
    if(friendlyName == "gain"){
        return new Gain(context, instrumentEl, name)
    }
    else if(friendlyName == "drums"){
        return new Sampler(context, instrumentEl, name)
    }
    else if(friendlyName == "breakbeat_sampler"){
        return new BreakbeatSampler(context, instrumentEl, name)
    }
    else if(friendlyName == "pitched_sampler"){
        return new PitchedSampler(context, instrumentEl, name)
    }
    else if(friendlyName == "reverb"){
        return new ConvolutionReverb(context, instrumentEl, name)
    }
    else if(friendlyName == "Dlay"){
        return new Delay(context, instrumentEl, name)
    }
    else if(friendlyName == "distortion"){
        return new Distortion(context, instrumentEl, name)
    }
    else if(friendlyName == "compressor"){
        return new Compressor(context, instrumentEl, name)
    }
    else if(friendlyName == "biquad"){
        return new Biquad(context, instrumentEl, name)
    }
    else if(friendlyName == "panner"){
        return new Panner(context, instrumentEl, name)
    }
    else if(friendlyName == "looper"){
        return new LoopInstrument(context, instrumentEl, name)
    }
    else if(friendlyName == "wire"){
        return new Wire(name)
    }
    else if(friendlyName == "midi"){
        return new MIDIInst(context, instrumentEl, name)
    }
    else if(friendlyName == "line_in"){
        return new LineIn(context, instrumentEl, name)
    }
}

async function initAudio(bpmIn, instrumentElement : DOMElement) {
    context = new AudioContext()
    instrumentEl = instrumentElement
    bpm = bpmIn //TODO hack hack, import this from somewhere
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

    //handle deletion of instruments that have gone

    const instsToDelete = instruments?.filter((maybeOldInst : Instrument) => !newInstruments.find(newInst => newInst.name == maybeOldInst.name))

    instsToDelete?.forEach(inst => deleteInstrument(inst.name))

    instruments = newInstruments
}

function deleteInstrument(name){ //TODO should delete an instrument after some time (for now lets just set up a time after which all sounds should have stopped)
//  

    console.log("deleting instrument " + name)
    const inst = instrumentsByName[name]
    instrumentsByName[name] = undefined
    setTimeout(() => inst.disconnect(), 10) //disconnect all webAudioNodes after 10ms
}

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

export {
    initAudio,
    play,
    context,
    newInstrumentMappings,
    instrumentsByName,
}
