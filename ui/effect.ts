import { GraphNode } from "./instruments"

class Effect extends GraphNode {
  inputNode: AudioNode

  createWetDry() {
    /*
     *Use after the hooking up of inputNode and outputNode, before resolveParams
     *this.inputNode must be a gainNode with value one (Ie an untouched signal)
     */
    this.webAudioNodes.wetDryPanner = this.audioContext.createStereoPanner()
    this.webAudioNodes.wetDryChannelSplitter =
      this.audioContext.createChannelSplitter(2)
    //this.webAudioNodes.wetDryGainToAudio = this.audioContext.createGain() //TODO setup this don,t know if I need
    this.webAudioNodes.wetDryWetGain = this.audioContext.createGain()
    this.webAudioNodes.wetDryDryGain = this.audioContext.createGain()
    this.webAudioNodes.wetDryOutputGain = this.audioContext.createGain()
    this.webAudioNodes.wetDryConstantOne =
      this.audioContext.createConstantSource()

    this.webAudioNodes.wetDryWetGain.gain.setValueAtTime(
      0,
      this.audioContext.currentTime,
    )
    this.webAudioNodes.wetDryDryGain.gain.setValueAtTime(
      0,
      this.audioContext.currentTime,
    )

    //Wire everything up
    this.webAudioNodes.wetDryConstantOne.connect(
      this.webAudioNodes.wetDryPanner,
    )
    this.webAudioNodes.wetDryConstantOne.start()
    this.webAudioNodes.wetDryPanner.connect(
      this.webAudioNodes.wetDryChannelSplitter,
    )

    //this.webAudioNodes.wetDryPanner.channelCount = 1;
    //this.webAudioNodes.wetDryPanner.channelCountMode = "explicit";

    this.webAudioNodes.wetDryChannelSplitter.connect(
      this.webAudioNodes.wetDryWetGain.gain,
      0,
    )
    this.webAudioNodes.wetDryChannelSplitter.connect(
      this.webAudioNodes.wetDryDryGain.gain,
      1,
    )

    this.webAudioNodes.wetDryWetGain.connect(
      this.webAudioNodes.wetDryOutputGain,
    )
    this.webAudioNodes.wetDryDryGain.connect(
      this.webAudioNodes.wetDryOutputGain,
    )

    this.inputNode.connect(this.webAudioNodes.wetDryDryGain)
    this.outputNode.connect(this.webAudioNodes.wetDryWetGain)

    this.outputNode = this.webAudioNodes.wetDryOutputGain
  }
}

export { Effect }
