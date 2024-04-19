import {Effect} from "./effect"

let bpm = undefined

class Output extends Effect { //TODO this isn't really an effect. 

    friendlyName = "out"
    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.inputNode = context.destination
        this.outputNode = undefined //should error if someone tries to wire this to something :)
    }

    async setup(newBpm: string){
      if(newBpm && bpm === undefined){
        bpm = parseFloat(newBpm)
      }
      return this
    }
}

export {Output, bpm}
