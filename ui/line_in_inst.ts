import {Effect} from "./effect"

class LineIn extends Effect { //TODO this isn't really an effect. 

    friendlyName = "line_in"

    constructor(context: AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)

        this.webAudioNodes.gainNode = this.audioContext.createGain()
        this.inputNode = undefined //should error if someone tries to wire this to something :)
        this.outputNode = this.webAudioNodes.gainNode
    }

    async setup(){
      if (!this.webAudioNodes.mediaStreamNode){
        const stream = await navigator.mediaDevices.getUserMedia({ audio: {autoGainControl: false, echoCancellation: false, noiseSuppression: false, latency: 0.003, channelCount: 1}, video: false })
        this.webAudioNodes.mediaStreamNode = this.audioContext.createMediaStreamSource(stream)
        this.webAudioNodes.mediaStreamNode?.connect(this.webAudioNodes.gainNode)
      }
      return this
    }
}

export {LineIn}
