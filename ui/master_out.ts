import {Effect} from "./effect"

class Output extends Effect { //TODO this isn't really an effect. 

    static friendlyName = "out"
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.inputNode = context.destination
        this.outputNode = undefined //should error if someone tries to wire this to something :)
    }
}

export {Output}
