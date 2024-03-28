class LoopProcessor extends AudioWorkletProcessor {

  buffer
  loopTime_s

  constructor(options){
      super();
      this.loopTime_s = options.processorOptions.loopTime_s;
      this.buffer = new Float32Array(this.loopTime_s*sampleRate);
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0]; //first input
    const input = inputs[0]; //first output

    //TODO assumption here is 1 channel
    for (let o = 0; o < output.length; o++) {
      for (let s = 0; s < output[0].length; s++) {
        for (let i = 0; i < input.length; i++) {
          this.buffer[(s + currentFrame) % this.buffer.length] = this.buffer[(s + currentFrame) % this.buffer.length] + input[i][s]
        }
        output[o][s] = this.buffer[(s + currentFrame) % this.buffer.length]
      }
    }
    return true;
  }
}

registerProcessor("loop-processor", LoopProcessor);
