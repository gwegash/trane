class FilterProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.WEBEAUDIO_FRAME_SIZE = 128;

        this.port.onmessage = (e) => {
            //  Instanciate 
            WebAssembly.instantiate(e.data)
            .then((result) => {
                /* result : {module: Module, instance: Instance} */
                //  exposes C functions to the outside world. only for readness
                const exports = result.instance.exports;
                //  Gets pointer to wasm module memory
                this.inputStart   = exports._Z14inputBufferPtrv();
                this.outputStart  = exports._Z15outputBufferPtrv();
                //  Create shadow buffer of float.
                this.inputBuffer  = new Float32Array(exports.memory.buffer,
                                                     this.inputStart,
                                                     this.WEBEAUDIO_FRAME_SIZE);
                this.outputBuffer = new Float32Array(exports.memory.buffer,
                                                     this.outputStart,
                                                     this.WEBEAUDIO_FRAME_SIZE);
                //  Gets the filter function
                this.filter = exports._Z6filterv;
            });
        }
    }
    process(inputList, outputList, parameters) {   

        if(inputList[0].length > 0){
          this.inputBuffer.set(inputList[0][0]);
          this.filter();
          outputList[0][0].set(this.outputBuffer);
        }
        
        return true;
    }
}
registerProcessor('filter-processor', FilterProcessor);
