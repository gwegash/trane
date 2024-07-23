import {Effect} from "./effect"

class MIDIInst extends Effect { //TODO this isn't really an effect. 

    static friendlyName = "midi"

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.inputNode = undefined //should error if someone tries to wire this to something :)
        this.outputNode = undefined //should error if someone tries to wire this to something :)
    }

}

export {MIDIInst}
