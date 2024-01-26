//This module listens to MIDI messages, and forwards events onto handlers that are registered with it.
//

const CC = 0xb0
const NOTE_ON = 0x90
const cc_registrations = { //cc to callback //TODO make this use the input too they will clash if someone has multiple midi controllers
}

const note_registrations = {
}


let midi 

let registeringFunction //the current function trying to get an assignment to the next cc parameter

//TODO make this async
function init(){
    function onMIDISuccess(midiAccess) {
        console.log("MIDI ready!")
        midi = midiAccess // store in the global (in real usage, would probably keep in an object instance)
        window.midi = midi
        listenToMidiMessages(midi, 0)
    }

    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`)
    }

    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
}


function registerCC(callback){
    registeringFunction = callback
    if(!midi){
        init()
    }
}

function onMIDIMessage(event) {
    if(event.data[0] === CC){
        if(registeringFunction != undefined){
            console.log("registered CC event")
            cc_registrations[event.data[1]] = registeringFunction
            registeringFunction = undefined //clear this, for the next registration
        }
        else if(cc_registrations[event.data[1]]){ //we have a function registered
            cc_registrations[event.data[1]](event.data[2]) //call the function
        }
    }
    else if(event.data[0] === NOTE_ON){
        Object.values(note_registrations).forEach(
            note_registration => {
                const dur = event.data[2] > 0 ? -1 : 0
                note_registration.play(event.data[1], note_registration.audioContext.currentTime, dur)
        })
    }
}

function listenToMidiMessages(midiAccess, indexOfPort) {
    midiAccess.inputs.forEach((entry) => {
        entry.onmidimessage = onMIDIMessage
    })
}

function registerMidiNoteInput(toName: string, to : Instrument){
    note_registrations[toName] = to
}

function deregisterMidiNoteInput(toName : string){
    delete note_registrations[toName]
}


export {init, registerCC, registerMidiNoteInput, deregisterMidiNoteInput}
