import { GraphNode } from "./instruments"
import { CrossfaderNode } from "./crossfader"

class Effect extends GraphNode {
  inputNode: AudioNode

  createWetDry() {
    /*
     *Use after the hooking up of inputNode and outputNode, before resolveParams
     *this.inputNode must be a gainNode with value one (Ie an untouched signal)
     */
    this.webAudioNodes.crossfaderNode = new CrossfaderNode(this.audioContext)

    this.inputNode.connect(this.webAudioNodes.crossfaderNode.getRight())
    this.outputNode.connect(this.webAudioNodes.crossfaderNode.getLeft())

    this.outputNode = this.webAudioNodes.crossfaderNode.getOutput()
  }
}

export { Effect }
