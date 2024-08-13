/*
 *  compilation directive
 *
 *  emcc -O3 -s WASM=1 ladder_filter.c -o ladder_filter.wasm --no-entry
 */

#include <emscripten.h>

#define WEBEAUDIO_FRAME_SIZE 128

static float inputBuffer[WEBEAUDIO_FRAME_SIZE];
static float outputBuffer[WEBEAUDIO_FRAME_SIZE];

EMSCRIPTEN_KEEPALIVE
float* inputBufferPtr() {
    return inputBuffer;
}
EMSCRIPTEN_KEEPALIVE
float* outputBufferPtr() {
	return outputBuffer;
}
EMSCRIPTEN_KEEPALIVE
void filter() {
    //  just copy in to out !
    for (int i=0 ; i<128 ; i++) {
        outputBuffer[i] = inputBuffer[i];
    }
}
