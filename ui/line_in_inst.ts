import { Effect } from "./effect"

class LineIn extends Effect {
  //TODO this isn't really an effect.

  static friendlyName = "line_in"
  stereo: boolean = false

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    this.webAudioNodes.gainNode = this.audioContext.createGain()
    this.inputNode = undefined //should error if someone tries to wire this to something :)
    this.outputNode = this.webAudioNodes.gainNode
  }

  async setup({stereo}){
    if (this.webAudioNodes.mediaStreamNode && this.stereo == stereo) {
      return
    }
    else{
      this.stereo = stereo !== undefined

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
          latency: 0.0,
          channelCount: this.stereo ? 2 : 1
        },
        video: false,
      })

      this.webAudioNodes.mediaStreamNode =
        this.audioContext.createMediaStreamSource(stream)
      if(!this.stereo){
          this.webAudioNodes.channelSplitter = this.audioContext.createChannelSplitter(2)
          this.webAudioNodes.mediaStreamNode.connect(this.webAudioNodes.channelSplitter)
          this.webAudioNodes.channelSplitter.connect(this.webAudioNodes.gainNode, 0)
      }
      else {
        this.webAudioNodes.mediaStreamNode?.connect(this.webAudioNodes.gainNode)
      }
    }
    return this
  }
}

export { LineIn }
