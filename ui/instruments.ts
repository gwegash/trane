import { base0B as atomColor } from "./dark_theme"
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

// The bag of Web Audio nodes beloging to a particular GraphNode, used to keep the nodes subgraph for easy cleanup
type WebAudioNodes = Record<string, any>

interface Param {
  at: (nodes: WebAudioNodes) => AudioParam
  min?: number //can be left undefined, defaults to AudioParam's own minValue
  max?: number //can be left undefined, defaults to AudioParam's own maxValue
  log?: boolean //draw/scrub the knob logarithmically
  default?: number //baseline `applyArgs` compares against; see resolveParams
}

/*
 * The single source of truth for a node type. `name` is the name it goes by in the
 * Janet DSL: it is what (gain :foo) emits as a type keyword, what instMap is keyed
 * by, and what audio.ts sends to Janet as the param table at startup.
 *
 * The DECLARATION ORDER of `params` defines each param's wire index. That index is
 * packed into 5 bits by encodeParam in dsl_helpers.janet, so a node may have at most
 * 32 params. dont write one of these indices by hand, let the DSL do it
 */
interface NodeDef {
  name: string
  params?: Record<string, Param>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InstArgs = any

class GraphNode {
  static def: NodeDef
  audioContext: AudioContext
  webAudioNodes: WebAudioNodes = {}
  outputNode: AudioNode
  name: string
  el: HTMLElement
  knobsEl: Element
  paramNames: Array<string> = [] //declaration order == wire index order
  resolvedParams: Array<AudioParam> = []
  private lastApplied: Record<string, number> = {}

  get def(): NodeDef {
    return (this.constructor as typeof GraphNode).def
  }

  /* Index on the wire for a named param, or -1. */
  paramIndex(name: string) {
    return this.paramNames.indexOf(name)
  }

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

  //Use setup to handle DSL instrument arguments that are not params. Ie ones that cannot be changed from a live_loop, like sample URLs. Because these don't map to audioParams they need to be handled separately, and most often uniquely
  async setup(args: InstArgs) {
    return this
  }

  setupKnobs() {
    //TODO knob deletion
    this.paramNames.forEach((name, i) => {
      const param = this.def.params[name]
      new Knob(
        this.audioContext,
        this.knobsEl,
        this.resolvedParams[i],
        name,
        param.min,
        param.max,
        param.log,
      )
    })
  }

  // params are only written when the value differs from the last via code changes
  applyArgs(args: Record<string, string | undefined>) {
    this.paramNames.forEach((name, i) => {
      const raw = args[name]
      if (raw === undefined) {
        return
      }
      const value = parseFloat(raw)
      if (Number.isNaN(value) || value === this.lastApplied[name]) {
        return
      }
      this.lastApplied[name] = value
      this.resolvedParams[i].setTargetAtTime(
        value,
        this.audioContext.currentTime,
        0.01,
      )
    })
  }

  resolveParams() {
    const params = this.def.params ?? {}
    this.paramNames = Object.keys(params)
    this.resolvedParams = this.paramNames.map((name) =>
      params[name].at(this.webAudioNodes),
    )
    this.paramNames.forEach((name) => {
      if (params[name].default !== undefined) {
        this.lastApplied[name] = params[name].default
      }
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

export {
  GraphNode,
  Instrument,
  WebAudioNodes,
  Param,
  NodeDef,
  InstArgs,
  getTabIndex,
}
