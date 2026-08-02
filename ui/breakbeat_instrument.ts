import { Sampler } from "./sampler_generic"
import { bpm } from "./index"
import { findClosest, clamp} from "./utils"

class BreakbeatSampler extends Sampler {
  static friendlyName = "breakbeat_sampler"
  length_beats = 8 //default to two bars
  sampleStart = 0
  sampleEnd = 1
  slices = [this.sampleStart, this.sampleEnd]
  movingSliceIdx: number | undefined = undefined
  scrolling = false

  //TODO the slices field is so redundant. I am dumb. Let's get rid of it. WHY do i program these things so late

  params = [
    { name: "gain", path: "gainNode.gain", min: 0.001, max: 1, logScale: true },
  ]

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.setupUI()
    this.canvas.addEventListener("mousedown", this.onMousedown.bind(this))
    document.addEventListener("mouseup", this.onMouseup.bind(this))
    this.canvas.addEventListener("mousemove", this.onMousemove.bind(this))
    this.canvas.addEventListener("contextmenu", (e) => { e.preventDefault() })
  }

  async setup({length_beats, slices, gain, ...rest }) {
    //TODO make bpm dynamic
    this.length_beats = parseFloat(length_beats)
    if(slices){
      const parsedSlices = slices
        .slice(1, -1)
        .split(" ")
        .map((slice) => parseFloat(slice))
      this.slices = parsedSlices
    }
    else{
      this.slices = [this.sampleStart]
      this.sampleEnd = 1
    }
    this.sampleStart = this.slices[0]
    this.sampleEnd = this.slices[this.slices.length - 1]
    this.updateParamIfChanged(0, gain) //TODO move this to the parent element
    //
    //this.buffer is set after super is loaded.
    await super.setup(rest)

    return this
  }

  onMouseup(event: MouseEvent){
    if(this.movingSliceIdx){
      this.movingSliceIdx = undefined
      this.slices.sort() //TODO this is potentially inefficient. We just need an insertion beforehand. Oh well.
    }
    this.scrolling = false
  }

  formatArgs = (): object => {
    return {
      length_beats: this.length_beats,
      url: this.sampleURL,
      slices: this.slices,
      gain: this.resolvedParams[0].value
    }
  }

  onMousemove(event: MouseEvent){
    if(this.movingSliceIdx){
      this.slices[this.movingSliceIdx] = this.getNTimeForX(event.offsetX)
    }
    else if(this.scrolling){
      //scrolling
      const movement = (-event.movementX / this.width)*(this.viewBounds[1] - this.viewBounds[0])
      this.viewBounds[0] = clamp(this.viewBounds[0]+movement, 0, this.viewBounds[1])
      this.viewBounds[1] = clamp(this.viewBounds[1]+movement, this.viewBounds[0], 1)
    }
  }

  onMousedown(event: MouseEvent){
    const mouseTime = this.getNTimeForX(event.offsetX)

    const firstVisibleSliceIdx = this.slices.findIndex(slice => slice >= this.viewBounds[0]) //find finds the first, helpfully
    let lastVisibleSliceIdx = this.slices.findIndex(slice => slice >= this.viewBounds[1])
    const closestSliceIdx = findClosest(this.slices, mouseTime, firstVisibleSliceIdx, lastVisibleSliceIdx)

    if(Math.abs(this.getXForNTime(this.slices[closestSliceIdx]) - event.offsetX) < 4 && event.button == 0){
      console.log(`Hit! slice ${closestSliceIdx}`)
      this.movingSliceIdx = closestSliceIdx
    }
    else {
      if(event.button == 2){ //RMB, let's play a slice
        const playSlice = mouseTime < this.slices[closestSliceIdx] ? closestSliceIdx - 1 : closestSliceIdx
        console.log(`Not a hit! Playing ${playSlice}`)
        this.play(playSlice, this.audioContext.currentTime, -1)
      }
      else if (event.shiftKey){
        //Lets insert a new slice!
        this.movingSliceIdx = this.slices.push(mouseTime) - 1
      }
      else{
        this.scrolling = true
      }
    }
  }

  play(note, startTime, dur) {
    if (this.buffer) {
      const wantSampleLength_s = (this.length_beats / bpm) * 60 //the sample length we want to squish down to

      const playbackRate =
        ((this.sampleEnd - this.sampleStart) * this.buffer.duration) /
        wantSampleLength_s
      //Don't include the end (last slice point) in this
      const sliceTime =
        this.slices[note % (this.slices.length - 1)] * this.buffer.duration

      //we get a noteOn, we just want to play the slice that they refer to, nothing else
      let playDur = dur
      if (dur < 0) {
        //      seconds?        multiplier
        const sliceTime =
          this.slices[note % (this.slices.length - 1)] * this.buffer.duration
        const nextSliceTime =
          this.slices[note % (this.slices.length - 1) + 1] *
          this.buffer.duration
        playDur = (nextSliceTime - sliceTime) / playbackRate
      }

      this.playSample(startTime, playDur, sliceTime, playbackRate)
    }
  }

  drawSlices() {
    this.slices.forEach((slice, i) => {
      this.ctx.beginPath()
      const canvasX = this.getXForNTime(slice)

      if(i == 0 || i == (this.slices.length - 1)){
        this.ctx.setLineDash([])
        this.ctx.moveTo(canvasX, 0)
        this.ctx.lineTo(canvasX, this.height)
      }
      else{

        this.ctx.setLineDash([5, 5])
        this.ctx.moveTo(canvasX, 0)
        this.ctx.lineTo(canvasX, this.height)
      }
      this.ctx.stroke()
    })
  }

  draw() {
    super.draw()
    if (this.buffer) {
      this.drawSlices()
    }
    window.requestAnimationFrame(this.draw.bind(this))
  }
}

export { BreakbeatSampler }
