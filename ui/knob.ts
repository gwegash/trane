import {lerp} from "./utils"
import {registerCC} from "./midi_manager"
import "./css/knob.css"

const SIZE_PX = 40
const KNOB_START_ROTATION = Math.PI/8
const KNOB_SENSITIVITY = 1/200 //vertical pixels before sweeping through the whole range
const KNOB_TIME_CONSTANT = 1/10000

class Knob {
  parameter
  min
  max

  logMin
  logMax
  logScale

  //internal
  headingEl
  containerEl
  canvas
  audioContext
  ctx

  mouseStart
  mouseMoveEvent

  getRotation(){
    const normalised = this.logScale ? 
      (Math.log2(this.parameter.value) - this.logMin)/(this.logMax-this.logMin) :
      (this.parameter.value - this.min)/(this.max-this.min)
    return lerp(2*Math.PI - KNOB_START_ROTATION, KNOB_START_ROTATION, normalised)
  }

  setFromCC(byteVal){
    const normalised = byteVal/127.0

    const target = this.logScale ? 
      Math.pow(2, this.logMin + (this.logMax-this.logMin)*normalised) :
      this.min + (this.max-this.min)*normalised

    this.parameter.setTargetAtTime(target, this.audioContext.currentTime, KNOB_TIME_CONSTANT)
  }

  constructor(audioContext, parentEl, parameter, knobName, min, max, logScale = false){

    this.audioContext = audioContext
    this.parameter = parameter
    this.min = min !== undefined ? min : parameter.minValue
    this.max = max !== undefined ? max : parameter.maxValue

    this.logMin = Math.log2(min)
    this.logMax = Math.log2(max)
    this.logScale = logScale

    this.headingEl = document.createElement("p")
    this.headingEl.className = "heading"
    this.headingEl.innerText = knobName

    this.canvas = document.createElement("canvas")

    this.canvas.width = SIZE_PX
    this.canvas.height = SIZE_PX

    this.containerEl = document.createElement("div")
    this.containerEl.className = "knob-container"
    this.containerEl.appendChild(this.headingEl)
    this.containerEl.appendChild(this.canvas)
    parentEl.appendChild(this.containerEl)

    this.ctx = this.canvas.getContext("2d")
    this.ctx.fillStyle = "white"
    this.ctx.strokeStyle = "white"
    this.draw()

    this.canvas.addEventListener("mousedown", (e) => {
      if(e.shiftKey){ //register a midi CC to control this
        registerCC(this.setFromCC.bind(this))
      }
      else{ //move the param
        this.mouseStart = e.pageY

        const startVal = this.logScale ? Math.log2(this.parameter.value) : this.parameter.value

        const onMouseMove = (e) => {
          const normalised = (this.mouseStart - e.pageY )*KNOB_SENSITIVITY

          const target = this.logScale ? 
            Math.pow(2, Math.min(Math.max(startVal + normalised*(this.logMax-this.logMin), this.logMin), this.logMax)) :
            Math.min(Math.max(startVal + normalised*(this.max-this.min), this.min), this.max)

          this.parameter.setTargetAtTime(target, this.audioContext.currentTime, KNOB_TIME_CONSTANT)
        }

        this.mouseMoveEvent = document.addEventListener("mousemove", onMouseMove)

        //eslint-disable-next-line
        document.addEventListener("mouseup", (e) => {
          document.removeEventListener("mousemove", onMouseMove)
        }, {once: true})
      }
      //e.preventDefault();
    })
  }

  draw(){
    this.ctx.clearRect(0, 0, SIZE_PX, SIZE_PX)

    this.ctx.font = "10px ibmvga"

    this.ctx.beginPath()
    const radius = SIZE_PX/2 - 6
    this.ctx.arc(SIZE_PX/2, SIZE_PX/2, radius, 0, 2 * Math.PI)
    this.ctx.moveTo(SIZE_PX/2, SIZE_PX/2)
    this.ctx.lineTo(SIZE_PX/2 + Math.sin(this.getRotation())*radius, SIZE_PX/2 + Math.cos(this.getRotation())*radius)
    this.ctx.stroke()

    this.ctx.fillText(`${this.min}`, 1, SIZE_PX)

    const maxTextWidth = this.ctx.measureText(`${this.max}`).width
    this.ctx.fillText(`${this.max}`, SIZE_PX - maxTextWidth, SIZE_PX)
    window.requestAnimationFrame(this.draw.bind(this))
  }
}

export {Knob}
