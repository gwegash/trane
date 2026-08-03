import { lerp } from "./utils"
import { registerCC } from "./midi_manager"
import type { GraphNode } from "./instruments"
import { updateParam } from "./buffer_update"
import "./css/knob.css"

const SIZE_PX = 40
const KNOB_START_ROTATION = Math.PI / 8
const KNOB_SENSITIVITY = 1 / 200 //vertical pixels before sweeping through the whole range
const KNOB_TIME_CONSTANT = 1 / 10000
const KNOB_KNOTCH_LENGTH = 0.5 //How much of the circle the indicator shows
const CC_PRINT_TIMEOUT = 1 //Stop showing the message 1s after midi

class Knob {
  parameter: AudioParam
  paramName
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
  canvasCtx

  mouseStart
  mouseMoveEvent

  hovered = false
  clicked = false
  lastCCChange = 0

  getRotation() {
    const normalised = this.logScale
      ? (Math.log2(this.parameter.value) - this.logMin) /
        (this.logMax - this.logMin)
      : (this.parameter.value - this.min) / (this.max - this.min)
    return lerp(
      2 * Math.PI - KNOB_START_ROTATION,
      KNOB_START_ROTATION,
      normalised,
    )
  }

  shouldDrawParamValue() {
    return (
      this.hovered ||
      this.clicked ||
      this.audioContext.currentTime < this.lastCCChange + CC_PRINT_TIMEOUT
    )
  }

  setFromCC(byteVal) {
    const normalised = byteVal / 127.0

    const target = this.logScale
      ? Math.pow(2, this.logMin + (this.logMax - this.logMin) * normalised)
      : this.min + (this.max - this.min) * normalised

    this.lastCCChange = this.audioContext.currentTime

    this.parameter.setTargetAtTime(
      target,
      this.audioContext.currentTime,
      KNOB_TIME_CONSTANT,
    )
  }

  constructor(
    instrument: GraphNode,
    paramIndex : number,
  ) {
    this.audioContext = instrument.audioContext

    this.paramName = instrument.paramNames[paramIndex]
    this.parameter = instrument.resolvedParams[paramIndex]

    const min = instrument.def.params[this.paramName].min
    const max = instrument.def.params[this.paramName].max
    this.min = min !== undefined ? min : this.parameter.minValue
    this.max = max !== undefined ? max : this.parameter.maxValue

    this.logMin = Math.log2(min)
    this.logMax = Math.log2(max)
    this.logScale = instrument.def.params[this.paramName].log

    this.headingEl = document.createElement("p")
    this.headingEl.className = "heading"
    this.headingEl.innerText = this.paramName

    this.canvas = document.createElement("canvas")

    this.canvas.width = SIZE_PX
    this.canvas.height = SIZE_PX

    this.containerEl = document.createElement("div")
    this.containerEl.className = "knob-container"
    this.containerEl.appendChild(this.headingEl)
    this.containerEl.appendChild(this.canvas)
    this.containerEl.style.userSelect = "none"
    instrument.knobsEl.appendChild(this.containerEl)

    this.canvasCtx = this.canvas.getContext("2d")
    this.canvasCtx.fillStyle = "white"
    this.canvasCtx.strokeStyle = "white"
    this.draw()

    this.headingEl.addEventListener("mouseup", (e) => {
      if (e.shiftKey) {
        updateParam(instrument, this.paramName, this.parameter.value)
      }
    })

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.shiftKey) {
        //register a midi CC to control this
        registerCC(this.setFromCC.bind(this))
      } else {
        //move the param
        this.mouseStart = e.pageY
        this.clicked = true

        const startVal = this.logScale
          ? Math.log2(this.parameter.value)
          : this.parameter.value

        const onMouseMove = (e) => {
          const normalised = (this.mouseStart - e.pageY) * KNOB_SENSITIVITY

          const target = this.logScale
            ? Math.pow(
                2,
                Math.min(
                  Math.max(
                    startVal + normalised * (this.logMax - this.logMin),
                    this.logMin,
                  ),
                  this.logMax,
                ),
              )
            : Math.min(
                Math.max(
                  startVal + normalised * (this.max - this.min),
                  this.min,
                ),
                this.max,
              )

          this.parameter.setTargetAtTime(
            target,
            this.audioContext.currentTime,
            KNOB_TIME_CONSTANT,
          )
        }

        this.mouseMoveEvent = document.addEventListener(
          "mousemove",
          onMouseMove,
        )

        //eslint-disable-next-line
        document.addEventListener(
          "mouseup",
          (e) => {
            this.clicked = false
            document.removeEventListener("mousemove", onMouseMove)
          },
          { once: true },
        )
      }
    })

    //eslint-disable-next-line
    this.canvas.addEventListener("mouseover", (e) => {
      this.hovered = true

      this.canvas.addEventListener(
        "mouseleave",
        (e) => {
          this.hovered = false
        },
        { once: true },
      )
    })
  }

  draw() {
    this.canvasCtx.clearRect(0, 0, SIZE_PX, SIZE_PX)

    this.canvasCtx.beginPath()
    const radius = SIZE_PX / 2 - 6
    this.canvasCtx.arc(SIZE_PX / 2, SIZE_PX / 2, radius, 0, 2 * Math.PI)

    const knotchLength = this.shouldDrawParamValue() ? KNOB_KNOTCH_LENGTH : 0
    this.canvasCtx.moveTo(
      SIZE_PX / 2 + Math.sin(this.getRotation()) * radius * knotchLength,
      SIZE_PX / 2 + Math.cos(this.getRotation()) * radius * knotchLength,
    )
    this.canvasCtx.lineTo(
      SIZE_PX / 2 + Math.sin(this.getRotation()) * radius,
      SIZE_PX / 2 + Math.cos(this.getRotation()) * radius,
    )
    this.canvasCtx.stroke()

    if (this.shouldDrawParamValue()) {
      const valueString = `${this.parameter.value.toFixed(2)}`
      const maxTextWidth = this.canvasCtx.measureText(valueString).width
      this.canvasCtx.fillText(
        valueString,
        SIZE_PX / 2 - maxTextWidth / 2,
        SIZE_PX / 2 + 5,
      )
    }

    this.canvasCtx.font = "10px ibmvga"
    this.canvasCtx.fillText(`${this.min}`, 1, SIZE_PX)

    const maxTextWidth = this.canvasCtx.measureText(`${this.max}`).width
    this.canvasCtx.fillText(`${this.max}`, SIZE_PX - maxTextWidth, SIZE_PX)
    window.requestAnimationFrame(this.draw.bind(this))
  }
}

export { Knob }
