import { Instrument } from "./instruments"
import { loadSample } from "./utils"

interface SampleBuffer {
  // Represents an individual hit
  sampleURL: string
  buffer: AudioBuffer
  lastHitTimes: Array<number>
}

function sortedIndex(array, value) {
	var low = 0,
	high = array.length;

	while (low < high) {
		var mid = low + high >>> 1;
		if (array[mid] < value) low = mid + 1;
		else high = mid;
	}
	return low;
}

function insertSorted(arr, val){
  arr.splice(sortedIndex(arr, val)+ 1, 0, val)
}

class Sampler extends Instrument {
  static friendlyName = "drums"
  height = 65
  width = 65
  ctx
  canvas

  settings = {
    detune: 0,
    loop: false,
    loopStart: 0,
    loopEnd: 100,
    playbackRate: 1,
  }
  buffers: Array<SampleBuffer>

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)

    this.webAudioNodes.gainNode = context.createGain()
    this.webAudioNodes.gainNode.gain.value = 1.0

    this.outputNode = this.webAudioNodes.gainNode
    this.buffers = []
    this.setupUI()
  }

  setupUI() {
    this.canvas = document.createElement("canvas")

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = this.width
    this.canvas.style.height = this.height
    this.el.appendChild(this.canvas)

    this.ctx = this.canvas.getContext("2d")
    this.draw()
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    this.buffers.forEach((buffer, i) => {
      const lastHitTimeIdx = buffer.lastHitTimes.findLastIndex(time => time < this.audioContext.currentTime)
      if (lastHitTimeIdx !== -1) {
        buffer.lastHitTimes.splice(0, lastHitTimeIdx)
        const lastHitTime = buffer.lastHitTimes.at(0)

        const x = i % 8
        const y = Math.floor(i / 8)

        const opacity = 255*Math.max(1 -(this.audioContext.currentTime - lastHitTime), 0)
        this.ctx.fillStyle = `rgb(${opacity} ${opacity} ${opacity})`
        this.ctx.fillRect(x * 8 + 1, y * 8 + 1, 7, 7)
      }
    })

    window.requestAnimationFrame(this.draw.bind(this))
  }

  async setup({ hits }) {
    const samples = hits
      .slice(1, -1)
      .split(" ")
      .map((str) => str.replaceAll('"', ""))
    const newBuffers = Array(samples.length)
    await Promise.all(
      samples.map(async (sampleURL, i) => {
        const sampleBuffer: SampleBuffer = {}
        if (this.buffers[i]?.sampleURL != sampleURL) {
          const buffer = await loadSample(sampleURL)
          const decoded = await this.audioContext.decodeAudioData(buffer)
          sampleBuffer.buffer = decoded
          sampleBuffer.sampleURL = sampleURL
          sampleBuffer.lastHitTimes = []
        } else {
          sampleBuffer.buffer = this.buffers[i].buffer
          sampleBuffer.lastHitTimes = this.buffers[i].lastHitTimes
          sampleBuffer.sampleURL = sampleURL
        }
        newBuffers[i] = sampleBuffer
      }),
    )
    this.buffers = newBuffers
    return this
  }

  play(note, startTime, dur) {
    const player = this.audioContext.createBufferSource()
    player.connect(this.webAudioNodes.gainNode)
    const sampleBuffer = this.buffers[Math.floor(note) % this.buffers.length]
    player.buffer = sampleBuffer?.buffer
    player.start(startTime)
    if (dur >= 0) {
      player.stop(startTime + dur)
    } else {
      player.stop(startTime + player.buffer?.duration || 0)
    }
    insertSorted(sampleBuffer.lastHitTimes, startTime)
  }
}

export { Sampler }
