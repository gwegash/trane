import { editor } from "./editor"
import { instrumentsByName } from "./audio"

const urlParams = new URLSearchParams(window.location.search)
const tutor = urlParams.get("tutor")

interface ITutorBlock {
  text: string
  timePerKey: number // in seconds
}

interface ITutorInstruction {
  condition: (string) => boolean //takes code, returns if condition has been satisfied
  codeBlock: ITutorBlock
  where: (string) => number //takes code, returns position in code
  timeUntilNext?: number
}

function sleep(s) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * s))
}

let programCounter = 0
let currentlyAnimating = false // lock on the animation

const tutorInstructions: Array<ITutorInstruction> = [
  {
    condition: (_) => true,
    codeBlock: { text: " Hello.\n", timePerKey: 1.0 / 30 },
    where: (code) => code.length,
    timeUntilNext: 0.5,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "# trane is a music playground.\n# To execute the code below, press Alt+Enter. (⌥+Enter on Mac)\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
    timeUntilNext: 0.3,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: `
(chain                                                               # chain these together
  (sample :hello-sample :url "samples/Cmin 7th 3.wav" :pitch :C3)    # create a sampler
#  (biquad :hello-filter :filter_type "lowpass")                      # create a lowpass filter
  :out                                                               # plug them into the output
)
`,
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "\n# Very nice. You can create instruments in trane.\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "# The sample you've loaded shows up on the right.\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "# Lets try sending some notes to the sampler.\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "\n# Try executing the code below. (Alt+Enter or ⌥+Enter)\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: `
(live_loop :player                                       # loop forever
  (play (pick :C1 :C2 :C3) :hello-sample :dur 64)        # pick a note in 3 octaves, send it to our sampler, play for at most 64 beats
#  (target :hello-filter :frequency (rand 50 10000) 10)   # change the filter cutoff to a random frequency 
  (sleep 6)                                              # sleep for 6 beats
)
`,
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "\n# Lovely. I reckon you're going to hear some distortion and clipping soon.\n# The sample is a bit too loud. Try turning it down with the gain knob on the right.\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
    timeUntilNext: 9,
  },
  {
    condition: (_) => true,
    codeBlock: {
      text: "\n# OK. You can try uncommenting the 'biquad' and 'target' lines.\n# Remember to press (Alt+Enter or ⌥+Enter) to evaluate your changes\n",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
  },
  {
    condition: () => instrumentsByName[":hello-filter"],
    codeBlock: {
      text: "\n# Great stuff. Please feel free to mess around with the code some more.\n\n# For more information, docs and examples check out the github:\n# https://github.com/gwegash/trane",
      timePerKey: 1.0 / 30,
    },
    where: (code) => code.length,
  },
]

async function continueTutorial() {
  if (tutor === null) {
    return
  }
  const code = editor.state.doc.toString()
  const currentInstruction = tutorInstructions[programCounter]
  if (programCounter >= tutorInstructions.length) {
    console.log("end of tutorial")
    return
  }

  if (currentInstruction.condition(code) && !currentlyAnimating) {
    currentlyAnimating = true
    // TODO disable updates on the document
    const whereInDoc = currentInstruction.where(code)
    // Insert text at the start of the document

    //reduces-concats spaces to avoid the whitespace timeout
    const codeBlockReduced = currentInstruction.codeBlock.text.split("").reduce(
      (accum, val) => {
        val === " " ? accum.push(accum.pop() + " ") : accum.push(val)
        return accum
      },
      [""],
    )

    let currentWritePos = whereInDoc
    for (let i = 0; i < codeBlockReduced.length; i++) {
      editor.dispatch({
        changes: { from: currentWritePos, insert: codeBlockReduced[i] },
      })

      currentWritePos += codeBlockReduced[i].length
      await sleep(currentInstruction.codeBlock.timePerKey)
    }
    programCounter++
    currentlyAnimating = false
    if (currentInstruction.timeUntilNext) {
      //we continue straight till the next one
      setTimeout(continueTutorial, currentInstruction.timeUntilNext * 1000)
    }
  }
}

export { tutor, continueTutorial }
