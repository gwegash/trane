function mod_wrap(i, i_max){
  return (((i % i_max) + i_max) % i_max);
}

class LoopProcessor extends AudioWorkletProcessor {

  buffer
  loopTime_s

  newBuffer(){
    this.buffer = new Float32Array(this.loopTime_s*sampleRate);
    console.log("resizing buffer to!", this.buffer.length);
  }

  constructor(options){
      super();
      this.loopTime_s = options.processorOptions.loopTime_s;
      this.newBuffer()

      this.port.onmessage = (e) => { //message is for now a loopTime_s
          if(e.data.loopTime_s !== this.loopTime_s){
            this.loopTime_s = e.data.loopTime_s;
            this.newBuffer()
          }
      };
  }

  static get parameterDescriptors() {
    return [
      {
        name: "latency",
        defaultValue: 30,
        minValue: 1,
        maxValue: 500,
        automationRate: "k-rate",
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0]; //first input
    const input = inputs[0]; //first output

    //TODO assumption here is 1 channel
    for (let o = 0; o < output.length; o++) {
      for (let s = 0; s < output[0].length; s++) {
        for (let i = 0; i < input.length; i++) {
          //record ahead of time, no monitoring. 
          // TODO Maybe add a monitoring option?
          //this.buffer[mod_wrap(s + currentFrame - Math.floor(parameters.latency[0]/(1000*sampleRate)), this.buffer.length)] = this.buffer[mod_wrap(s + currentFrame - Math.floor(parameters.latency[0]/(1000*sampleRate)), this.buffer.length)] + input[i][s]
          this.buffer[mod_wrap(s + currentFrame, this.buffer.length)] = this.buffer[mod_wrap(s + currentFrame, this.buffer.length)] + input[i][s]
        }
        output[o][s] = this.buffer[mod_wrap(s + currentFrame + Math.floor(parameters.latency[0]*sampleRate/1000), this.buffer.length)];
      }
    }
    return true;
  }
}

registerProcessor("loop-processor", LoopProcessor);
