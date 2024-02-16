import {editor} from "./editor"

const urlParams = new URLSearchParams(window.location.search);
const tutor = urlParams.get('tutor')

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
    return new Promise(resolve => setTimeout(resolve, 1000*s));
}

let programCounter = 0
let currentlyAnimating = false // lock on the animation

const tutorInstructions : Array<ITutorInstruction> = [
  {
    condition: (_) => true,
    codeBlock: { text: " Hello, trane is a music playground.\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 1.0,
  },
  {
    condition: (_) => true,
    codeBlock: { text: "# To execute the code below, press Alt+Enter. (⌥+Enter on Mac)\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 0.3,
  },
  {
    condition: (_) => true,
    codeBlock: { text: `
(chain 
  (sample :hello-sample "samples/Cmin 7th 3.wav" 36)
  #(biquad :hello-filter "lowpass")
  :out
)
`, timePerKey: 1.0/60},
    where: (code) => code.length,
  },
  {
    condition: (_) => true,
    codeBlock: { text: "\n# Very nice. You can create instruments in trane.\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: { text: "# The sample you've loaded shows up on the right.\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: { text: "# Lets try sending some notes to the sampler.\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: { text: "\n# Try executing the code below. (Alt+Enter or ⌥+Enter)\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 1,
  },
  {
    condition: (_) => true,
    codeBlock: { text: `
(live_loop :player                                       # loop forever
  (play (pick 12 24 36) :hello-sample :dur 64)           # pick a random note in 3 octaves, send it to our sampler, play for at most 64 beats
  #(target :hello-filter :frequency (rand 50 10000) 10)  
  (sleep 6)                                              # sleep for 6 beats
)
`, timePerKey: 1.0/60},
    where: (code) => code.length,
  },
  {
    condition: (_) => true,
    codeBlock: { text: "\n# Lovely. I reckon you're going to hear some distortion and clipping soon.\n# The sample is a touch too loud. Try turning it down with the gain knob on the right\n", timePerKey: 1.0/30},
    where: (code) => code.length,
    timeUntilNext: 1,
  },
]

async function continueTutorial(){
  const code = editor.state.doc.toString()
  const currentInstruction = tutorInstructions[programCounter]
  if(programCounter >= tutorInstructions.length){
    console.log("end of tutorial")
    return 
  }

  if(currentInstruction.condition(code) && !currentlyAnimating){
    currentlyAnimating = true
    // TODO disable updates on the document
    const whereInDoc = currentInstruction.where(code)
    // Insert text at the start of the document

    for (let i = 0; i<currentInstruction.codeBlock.text.length; i++){
      editor.dispatch({
        changes: {from: whereInDoc + i, insert: currentInstruction.codeBlock.text[i]}
      })
      await sleep(currentInstruction.codeBlock.timePerKey)
    } 
    programCounter++
    currentlyAnimating = false
    if(currentInstruction.timeUntilNext) { //we continue straight till the next one
      setTimeout(continueTutorial, currentInstruction.timeUntilNext*1000)
    }
  }
}

export { tutor, continueTutorial }
