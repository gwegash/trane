import {instrumentsByName} from "./audio"
import {registerMidiNoteInput, deregisterMidiNoteInput} from "./midi_manager"

class Wire{
    name: string
    from : string
    to : string

    constructor(name){
        this.name = name
    }

    setup(from, to){
        this.from = from
        this.to = to
            
        const toInst = instrumentsByName[to]
        const fromInst = instrumentsByName[from]

        if(from === ":midi"){
            registerMidiNoteInput(to, toInst)
        }
        else if (fromInst.outputNode && toInst.inputNode){
            fromInst.outputNode.connect(toInst.inputNode)
        }
        else{
            console.warn(`No output or input to wire together ${this.name}`)
        }

    }

    disconnect(){
        const fromInst = instrumentsByName[this.from]
        const toInst = instrumentsByName[this.to]

        if (this.from === ":midi"){
            deregisterMidiNoteInput(this.to)
        }
        if (toInst){
            fromInst?.outputNode.disconnect(toInst.inputNode)
        }
    }
}

export {Wire}
