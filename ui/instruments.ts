import { base0B as atomColor } from "./dark_theme"
import { resolvePath } from "./utils"
import { Knob } from "./knob"

let tabIndex = 0

const getTabIndex = () => {
  tabIndex += 1
  return tabIndex
}

interface Voice {
  signal: AudioNode
  envelopeGain: GainNode
}

function isVoice(audioNode: AudioNode | Voice) {
  return "signal" in audioNode && "envelopeGain" in audioNode
}

interface Param {
  name: string
  path: string // string representation of a WebAudioNode parameter. Take a look at the WebAudioNodes interface below. Each of those Nodes has several params. Used to map names to WebAudio paths in the janet code
  min: number
  max: number
  logScale: boolean
  lastValue: number //sets the last value this was changed from the instrument definition. We set the param to this value if the setup() function recieves a different value to this one. We don't want to always override in case this is performance. Also the initial value that the node is set to
  isWorklet?: boolean //AudioworkletNodes, unlike regular audioNodes place their parameters in a ParameterMap, which makes resolution a bit trickier
}

type WebAudioNodes = Record<any, AudioNode | AudioWorkletNode>

class GraphNode {
  static friendlyName: string //name given in the language
  static params: Array<Param>
  audioContext: AudioContext
  webAudioNodes: WebAudioNodes = {}
  outputNode: AudioNode
  name: string
  el: HTMLElement
  knobsEl: Element
  resolvedParams: Array<AudioParam>

  constructor(context: AudioContext, parentEl: Element, name: string) {
    this.audioContext = context
    this.name = name

    this.el = document.createElement("div")
    this.el.className = "instrument"
    parentEl.appendChild(this.el)

    const nameEl = document.createElement("p")
    nameEl.className = "instrument-name"
    nameEl.style.color = atomColor
    nameEl.innerText = this.name
    this.el.appendChild(nameEl)
  }

  async setup() {
    return this
  }

  setupKnobs() {
    //TODO knob deletion
    this.params.forEach((param) => {
      const resolvedParam = this.resolveParam(param)
      new Knob(
        this.audioContext,
        this.knobsEl,
        resolvedParam,
        param.name,
        param.min,
        param.max,
        param.logScale,
      )
    })
  }

  updateParamIfChanged(paramIndex, newVal) {
    if (newVal) {
      const parsed = parseFloat(newVal)
      if (parsed !== this.params[paramIndex].lastValue) {
        this.params[paramIndex].lastValue = parsed
        this.resolvedParams[paramIndex].setTargetAtTime(
          parsed,
          this.audioContext.currentTime,
          0.01,
        )
      }
    }
  }

  /*
   * Resolves this effects parameters, puts a reference to each audio param inside of resolvedParams in the order they appear in params for fast lookup at play time.
   */
  resolveParam(param: Parameter) {
    if (!param.isWorklet) {
      const splitPath = param.path.split(".")
      const resolvedParam = resolvePath(this.webAudioNodes, splitPath)
      return resolvedParam
    } else {
      const splitPath = param.path.split(".") // worklet paths are of the form "node.param"
      const node = this.webAudioNodes[splitPath[0]]
      const resolvedParam = node.parameters.get(splitPath[1])
      return resolvedParam
    }
  }

  /*
   * Resolves this effects parameters, puts a reference to each audio param inside of resolvedParams in the order they appear in params for fast lookup at play time.
   */
  resolveParams() {
    this.resolvedParams = []

    this.params.forEach((param) => {
      const resolvedParam = this.resolveParam(param)
      this.resolvedParams.push(resolvedParam)
    })
  }

  //eslint-disable-next-line
  change(
    paramIndex: number,
    type: number,
    to: number,
    startTime: number,
    dur: number,
  ) {
    if (type < 0) {
      this.resolvedParams[paramIndex].setTargetAtTime(to, startTime, -type)
    } else if (type === 0) {
      this.resolvedParams[paramIndex].linearRampToValueAtTime(to, startTime)
    } else if (type === 1) {
      this.resolvedParams[paramIndex].exponentialRampToValueAtTime(
        to,
        startTime,
      )
    } else if (type === 2) {
      this.resolvedParams[paramIndex].setValueAtTime(to, startTime)
    }
  }

  disconnect() {
    Object.values(this.webAudioNodes).forEach((node) => {
      node.disconnect()
    })
    this.el?.remove()
  }

  _generate_params() {
    //gyah, get rid of this somewhere
    console.log(
      `:${this.friendlyName} @{
        ${this.params?.map((param, i) => ":" + param.name + " " + i).join("\n")}
        }
    `,
    )
  }
}

class Instrument extends GraphNode {
  //eslint-disable-next-line
  play(note, startTime, dur) {}

  disconnect() {
    Object.values(this.webAudioNodes).forEach((node) => {
      if (!node.disconnect) {
        Object.values(node).forEach((n) => {
          if (isVoice(n)) {
            n.signal.stop()
            n.signal.disconnect()
            n.envelopeGain.disconnect()
          }
        })
      } else {
        node.disconnect()
      }
    })
    this.el?.remove()
  }
}

export { GraphNode, Instrument, WebAudioNodes, Param, getTabIndex, isNil}
