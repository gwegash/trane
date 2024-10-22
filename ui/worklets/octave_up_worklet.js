class OctaveUpProcessor extends AudioWorkletProcessor {
  inputBuffer;
  outputBuffer;
  inputStart;
  outputStart;
  process;
  initialised = false;
  static get parameterDescriptors() {
    return [
    ];
  }

  constructor() {
    super();
    this.WEBEAUDIO_FRAME_SIZE = 128;

    this.port.onmessage = (e) => {
      const key = Object.keys(e.data)[0];
      const value = e.data[key];
      if (key === "wasm") {
        //  Instanciate
        WebAssembly.instantiate(value).then((result) => {
          /* result : {module: Module, instance: Instance} */
          //  exposes C functions to the outside world. only for readness
          const exports = result.instance.exports;
          //  Gets pointer to wasm module memory
          this.inputStart = exports._Z14inputBufferPtrv();
          this.outputStart = exports._Z15outputBufferPtrv();
          //  Create shadow buffer of float.
          this.inputBuffer = new Float32Array(
            exports.memory.buffer,
            this.inputStart,
            this.WEBEAUDIO_FRAME_SIZE,
          );
          this.outputBuffer = new Float32Array(
            exports.memory.buffer,
            this.outputStart,
            this.WEBEAUDIO_FRAME_SIZE,
          );
          exports._Z4initv();
          //  Gets the filter function
          this.process = exports._Z7processv;
          this.initialised = true;
        });
      }
    };
  }

  process(inputList, outputList, parameters) {
    if (
      this.initialised &&
      inputList.length > 0 &&
      inputList[0].length > 0 &&
      outputList.length > 0 &&
      outputList[0].length > 0
    ) {
      this.inputBuffer.set(inputList[0][0]);
      this.process()
      outputList[0][0].set(this.outputBuffer);
    } 
    return true;
  }
}
registerProcessor("octave-up-processor", OctaveUpProcessor);
