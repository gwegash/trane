class EnvelopeNode {
  gain
  attackEnd
  decayEnd
  releaseEnd

  constructor(context : AudioContext){
    this.gain = context.createGain()
    this.gain.gain.setValueAtTime(0, context.currentTime)

    this.attackEnd = context.currentTime
    this.decayEnd = context.currentTime
    this.releaseEnd = context.currentTime
  }

  play(startTime, dur, vel, attack, decay, sustain, release) {
    this.noteOn(startTime, vel, attack, decay, sustain)
    this.noteOff(startTime + dur, release)

  }

  noteOn(startTime, vel, attack, decay, sustain) {
    if(startTime < this.releaseEnd || startTime < this.attackEnd || startTime < this.decayEnd){
      this.gain.gain.cancelAndHoldAtTime(startTime)
    }
    else{
      this.gain.gain.setValueAtTime(0, startTime)
    }

    this.attackEnd = startTime + attack
    this.gain.gain.linearRampToValueAtTime(vel, this.attackEnd)
    this.decayEnd = this.attackEnd + decay
    this.gain.gain.linearRampToValueAtTime(sustain * vel, this.decayEnd)
  }

  noteOff(endTime, release){
    if(endTime < this.attackEnd || endTime < this.decayEnd ){
      this.gain.gain.cancelAndHoldAtTime(endTime)
    }
    this.releaseEnd = endTime + release
    this.gain.gain.linearRampToValueAtTime(0, this.releaseEnd)
  }

  connect(to){
    this.gain.connect(to)
  }
    
  disconnect(){
    this.gain.disconnect()
  }
}

export {EnvelopeNode}
