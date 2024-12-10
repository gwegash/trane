//TODO create a custom AudioNode class
class CrossfaderNode {
  panner
  splitter
  lGain
  rGain
  constantOne
  outputGain

  constructor(context : AudioContext){
    this.panner = context.createStereoPanner()
    this.splitter =
      context.createChannelSplitter(2)
    //this.webAudioNodes.wetDryGainToAudio = context.createGain() //TODO setup this don,t know if I need
    this.lGain = context.createGain()
    this.rGain = context.createGain()
    this.outputGain = context.createGain()
    this.constantOne =
      context.createConstantSource()

    this.constantOne.start()

    this.lGain.gain.setValueAtTime(
      0,
      context.currentTime,
    )
    this.rGain.gain.setValueAtTime(
      0,
      context.currentTime,
    )

    //Wire everything up
    this.constantOne.connect(
      this.panner,
    )
    this.panner.connect(
      this.splitter,
    )

    this.panner.channelCount = 1
    this.panner.channelCountMode = "explicit"

    this.splitter.connect(
      this.lGain.gain,
      0,
    )
    this.splitter.connect(
      this.rGain.gain,
      1,
    )

    this.lGain.connect(
      this.outputGain,
    )
    this.rGain.connect(
      this.outputGain,
    )
  }

  getLeft(){
    return this.lGain
  }

  getRight(){
    return this.rGain
  }

  getOutput(){
    return this.outputGain
  }

  connect(to){
    this.outputGain.connect(to)
  }
    
  disconnect(){
    this.panner.disconnect()
    this.splitter.disconnect()
    this.lGain.disconnect()
    this.rGain.disconnect()
    this.constantOne.disconnect()
    this.outputGain.disconnect()
  }
}

export {CrossfaderNode}
