#include <emscripten.h>
#include <algorithm>


//  emcc -O3 -s WASM=1  filterKernel.c -o filterKernel.wasm --no-entry


#define RING_BUFFER_LENGTH 2048
#define GRAIN_SIZE 512
#define LOOKAHEAD 1024
#define RATE 2
//ratio of the grain that's crossfaded
#define CROSSFADE_LEN_GRAIN_RATIO 0.2f 

static float inputBuffer[128];
static float outputBuffer[128];

static float ringBuffer[RING_BUFFER_LENGTH];

unsigned int readPosition;
unsigned int writePosition;

unsigned int readhead1Position; //readhead within the grain
unsigned int readhead2Position; //readhead within the grain
unsigned int grainStart;

float readhead1;
float readhead2;

EMSCRIPTEN_KEEPALIVE
    void init() {
        readhead1Position = 0;
        readhead2Position = GRAIN_SIZE/2;
        writePosition = LOOKAHEAD;
    }

EMSCRIPTEN_KEEPALIVE
    float* inputBufferPtr() {
        return inputBuffer;
    }
EMSCRIPTEN_KEEPALIVE
    float* outputBufferPtr() {
        return outputBuffer;
    }

float getEnvelope(float x){ //position within the grain
  //return 1.0f;
  float env = std::min(x/CROSSFADE_LEN_GRAIN_RATIO, 1.0f);
  return std::min(1.0f - (x - (1.0f-CROSSFADE_LEN_GRAIN_RATIO)/CROSSFADE_LEN_GRAIN_RATIO), env);
}

EMSCRIPTEN_KEEPALIVE
    void process() {
        for (int i=0 ; i<128 ; i++) {
            
            grainStart = writePosition - LOOKAHEAD; // grain always starts lookahead behind
                                                   
            readhead1Position = (readhead1Position + (RATE - 1)) % GRAIN_SIZE; // Read position of readhead1 within the grain
            // RATE-1 because this grain is already moving in time by one sample per sample
            readhead2Position = (readhead1Position + GRAIN_SIZE / 2) % GRAIN_SIZE; // Read position of readhead2 within the grain

            readhead1 =  0.5*ringBuffer[(grainStart + readhead1Position) % RING_BUFFER_LENGTH];
            readhead1 += 0.5*ringBuffer[(grainStart + readhead1Position + 1) % RING_BUFFER_LENGTH];
            readhead2 =  0.5*ringBuffer[(grainStart + readhead2Position) % RING_BUFFER_LENGTH];
            readhead2 += 0.5*ringBuffer[(grainStart + readhead2Position + 1) % RING_BUFFER_LENGTH];

            outputBuffer[i] = readhead1*getEnvelope(((float) readhead1Position) / GRAIN_SIZE);
            outputBuffer[i] += readhead2*getEnvelope(((float) readhead2Position) / GRAIN_SIZE);

            ringBuffer[writePosition % RING_BUFFER_LENGTH] = inputBuffer[i];
            writePosition+=1;
        }
    }
