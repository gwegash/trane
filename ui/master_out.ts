import { Effect } from "./effect"

class Output extends Effect {
  //TODO this isn't really an effect.

  static def = {
    name: "out",
    params: {
      gain: { at: (n) => n.gainNode.gain, min: 0.001, max: 1.0, log: true },
    },
  }

	recordElement
	recording = false
	recorderChunks = []
	mediaRecorder

	clickRecord = () => {
		if(!this.recording){
      const dest = this.audioContext.createMediaStreamDestination()
      this.mediaRecorder = new MediaRecorder(dest.stream)
      this.webAudioNodes.gainNode.connect(dest)

      this.mediaRecorder.ondataavailable = (evt) => {
        // Push each chunk (blobs) in an array
        this.recorderChunks.push(evt.data)
      }

      this.mediaRecorder.onstop = (evt) => {
        // Make blob out of our blobs, and open it.
        const blob = new Blob(this.recorderChunks, { type: "audio/flac" })
        console.log(URL.createObjectURL(blob))
      }

			this.mediaRecorder.start()
			this.recordElement.textContent = "x"
			this.recording = true
		}
		else{
			this.mediaRecorder.stop()
			this.recording = false
			this.recordElement.textContent = "o"
			this.recording = false
		}
	}

  constructor(context: AudioContext, parentEl: Element, name: string) {
    super(context, parentEl, name)
    this.webAudioNodes.gainNode = this.audioContext.createGain()
    this.webAudioNodes.gainNode.connect(context.destination)
    this.webAudioNodes.gainNode.gain.setValueAtTime(0.75, context.currentTime)

    this.inputNode = this.webAudioNodes.gainNode
    this.outputNode = undefined //should error if someone tries to wire this to something :)

    this.knobsEl = document.createElement("div")
    this.knobsEl.className = "knobs"
    this.el.appendChild(this.knobsEl)
		
		this.recordElement = document.createElement("div")
		this.recordElement.classname = "master-record"
		this.recordElement.onClick = this.clickRecord
		this.recordElement.textContent = "o"
		this.el.appendChild(this.recordElement)

		this.recordElement.addEventListener("click", this.clickRecord.bind(this))

		this.knobsEl

    this.resolveParams() //always call me after settings up your webAudioNodes!
    this.setupKnobs()
  }


}

export { Output }
