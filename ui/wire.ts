import {instrumentsByName} from "./audio"
import {registerMidiNoteInput, deregisterMidiNoteInput} from "./midi_manager"

class Wire{
    static friendlyName = "wire"

    name: string
    from : string
    to : string
    toParam: string

    constructor(name){
        this.name = name
    }

    getDestination(){
        const toInst = instrumentsByName[this.to]
        const destination: AudioNode | AudioParam = this.toParam ? toInst.resolvedParams[toInst.params.findIndex(param => param.name === this.toParam)] : toInst.inputNode
        return destination
    }


    setup(from, to, toParam){
        this.from = from
        this.to = to
        this.toParam = toParam === "nil" ? undefined : toParam.slice(1) //TODO fix this, we shouldn't be getting these here
            
        const toInst = instrumentsByName[to]
        const fromInst = instrumentsByName[from]

        if(from === ":midi"){
            registerMidiNoteInput(to, toInst)
        }
        else if (fromInst.outputNode && toInst.inputNode){
            // TODO this find call is inefficient, use the param index. 
            // It's what it's there for! To stop this sort of thing
            const destination = this.getDestination()
            console.log("destination unknown", destination)
            fromInst.outputNode.connect(destination)
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
            const destination = this.getDestination()
            fromInst?.outputNode.disconnect(destination)
        }
    }
}

export {Wire}
