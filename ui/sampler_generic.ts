import { Instrument } from "./instruments"
import { Knob } from "./knob"
import { loadSample, clamp } from "./utils"
import { AudioMipmap } from "./audio_mipmap"

interface Playhead {
  startTime: number
  startTimeInAudio: number
  dur: number
  playbackRate: number
}

function findClosest(sortedArray: number[], x: number, left = 0, right = sortedArray.length - 1): number | undefined {
  if (left > right) {
    if (right < 0) return sortedArray[0];
    if (left >= sortedArray.length) return sortedArray[sortedArray.length - 1];

    const leftDiff = Math.abs(sortedArray[right] - x);
    const rightDiff = Math.abs(sortedArray[left] - x);

    return leftDiff <= rightDiff ? sortedArray[right] : sortedArray[left];
  }

  const mid = Math.floor((left + right) / 2);

  if (sortedArray[mid] === x) return sortedArray[mid];

  if (sortedArray[mid] < x) {
    return findClosest(sortedArray, x, mid + 1, right);
  } else {
    return findClosest(sortedArray, x, left, mid - 1);
  }
}

// All sample times/quantities are normalised to the length of the sample
// samplers -> hpf -> lpf -> gain -> output
class Sampler extends Instrument {
  buffer: AudioBuffer
  canvas: HTMLCanvasElement
  ctx //TODO this is overloaded with audiocontext, rename!
  height = 65
  width = 350
  sampleURL: string
  mipmap: AudioMipmap

  viewBounds = [0.0, 1.0] //viewport bounds in normalized sample length.
                          //A viewLight/viewRight of [0, 0.5] would display the first half of the sample
  playheads: Set<Playhead>

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.playheads = new Set()

    this.webAudioNodes.gainNode = context.createGain()
    this.webAudioNodes.gainNode.gain.value = 1.0
    this.outputNode = this.webAudioNodes.gainNode
  }

  async setup(sampleURL) {
    if (this.sampleURL !== sampleURL) {
      await this.loadSample(sampleURL)
    }

    return this
  }

  async loadSample(sampleURLRaw) {
    const buffer = await loadSample(sampleURLRaw)
    if (buffer) {
      const decoded = await this.audioContext.decodeAudioData(buffer)
      this.buffer = decoded
      this.sampleURL = sampleURLRaw
      this.mipmap = new AudioMipmap(this.buffer.getChannelData(0))
    } else {
      this.buffer = undefined
      this.sampleURL = undefined
    }
  }

  addPlayhead(playhead: Playhead) {
    this.playheads.add(playhead)
    setTimeout(
      () => this.playheads.delete(playhead),
      (playhead.startTime - this.audioContext.currentTime + playhead.dur) *
        1000 +
        50,
    )
  }

  /*
   * Gets the x position at a normalised time within a sample
   */
  getXForNTime(nTime: number) {
    return (nTime - this.viewBounds[0])/(this.viewBounds[1] - this.viewBounds[0])*this.width
  }

  /*
   * Gets the normalisedTime within a sample given a canvas position
   */
  getNTimeForX(canvasX: number) {
    return this.viewBounds[0] + (canvasX / this.width)*(this.viewBounds[1] - this.viewBounds[0])
  }

  onWheel(event: WheelEvent) {
    const zoomCenter = this.getNTimeForX(event.offsetX)
    const zoomAmount = event.deltaY * 1e-3
    
    this.viewBounds[0] = clamp(this.viewBounds[0] + (zoomCenter - this.viewBounds[0])*zoomAmount, 0, this.viewBounds[1])
    this.viewBounds[1] = clamp(this.viewBounds[1] + (zoomCenter - this.viewBounds[1])*zoomAmount, this.viewBounds[0], 1)
  }

  playSample(
    startTime,
    dur,
    timeInAudio,
    rate,
    envelopeNode: AudioNode | undefined = undefined,
		loop_start,
		loop_end,
  ) {
    if (this.buffer) {
      const player = this.audioContext.createBufferSource()
      player.playbackRate.value = rate
      player.connect(envelopeNode ? envelopeNode : this.webAudioNodes.gainNode)
      player.buffer = this.buffer
			player.loop = loop_start >= 0 && loop_start < this.buffer.duration && loop_end > 0 && loop_end <= this.buffer.duration
			if(player.loop){
				player.loopStart = loop_start
				player.loopEnd = loop_end
			}
      player.start(startTime, timeInAudio)
      if (dur >= 0) {
        player.stop(startTime + dur)
      }

      this.addPlayhead({
        startTime,
        dur,
        startTimeInAudio: timeInAudio,
        playbackRate: player.playbackRate.value,
      }) //TODO looping do i even want looping? surely easier to say na and leave the user to loop
      return player
    }
  }

  setupUI() {
    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)

    this.canvas = document.createElement("canvas")

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = this.width
    this.canvas.style.height = this.height
    this.knobsEl.appendChild(this.canvas)
    this.canvas.addEventListener("wheel", this.onWheel.bind(this))

    this.ctx = this.canvas.getContext("2d")
    this.ctx.strokeStyle = "white"
    this.draw()

    this.resolveParams()
    this.setupKnobs()
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    this.ctx.font = "5px pixeled"

    this.ctx.beginPath()
    this.ctx.setLineDash([])
    this.ctx.moveTo(0, this.height / 2)

    //TODO should we allow this? I think so, or should we enforce that the sample is loaded before we get here? I think this is OK, if a bit messy. It still allows messages to be routed around fine
    if (this.buffer) {
      const samples = this.mipmap.sampleRange(this.viewBounds[0], this.viewBounds[1], this.width)

      samples.forEach((sample, x) => 
        this.ctx.lineTo(
          x,
          this.height / 2 +
            (this.webAudioNodes.gainNode.gain.value *
              sample *
              this.height) /
              2,
        )
      )

      this.playheads.forEach((playhead) => {
        if (
          this.audioContext.currentTime >= playhead.startTime &&
          this.audioContext.currentTime < playhead.startTime + playhead.dur
        ) {
          //we're at a time where this should be playing!
          const playheadX =
            (this.width *
              (playhead.startTimeInAudio +
                (this.audioContext.currentTime - playhead.startTime) *
                  playhead.playbackRate)) /
            this.buffer.duration
          this.ctx.moveTo(playheadX, 0)
          this.ctx.lineTo(playheadX, this.height)
        }
      })
      this.ctx.stroke()
    } else {
      const eyeWidth = 10
      const eyeHeight = 20
      const frownHeight = 10
      this.ctx.fillStyle = "white"
      this.ctx.fillRect(
        this.width / 2 - eyeWidth,
        Math.floor(this.height / 2) - eyeHeight,
        1,
        1,
      )
      this.ctx.fillRect(
        this.width / 2 + eyeWidth,
        Math.floor(this.height / 2) - eyeHeight,
        1,
        1,
      )
      this.ctx.beginPath()
      this.ctx.arc(
        this.width / 2,
        this.height / 2 - frownHeight,
        4.0,
        -Math.PI / 2 - 1,
        -Math.PI / 2 + 1,
      )
      this.ctx.stroke()
      this.ctx.font = "10px ibmvga"
      this.ctx.fillText("couldn't load sample", this.width / 2 - 45, 50)
    }
  }
}

export { Sampler }
