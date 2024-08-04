import {Effect} from "./effect"
import {Instrument, getTabIndex} from "./instruments"

const rows = [
    [  "2", "3", null, "5", "6", "7"  ], 
    ["q", "w", "e", "r", "t", "y", "u"], 
    [  "s", "d", null, "g", "h", "j"  ], 
    ["z", "x", "c", "v", "b", "n", "m"],
]

const keyToSemitone = {
      "2" :13, "3": 15,           "5": 18, "6": 20, "7": 22,
    "q": 12, "w": 14, "e" :16, "r": 17, "t": 19, "y": 21, "u": 23,
      "s": 1, "d": 3,         "g": 6, "h" :8, "j" :10,
    "z": 0, "x": 2, "c": 4, "v" :5, "b": 7, "n" :9, "m": 11,
}

class Keyboard extends Effect {

    static friendlyName = "keyboard"
    canvasCtx //TODO this is overloaded with audiocontext, rename!
    height = 65
    width = 120
    canvas
    pressedKeys: Set<string>
    noteRegistrations: Set<Instrument>

    baseKey = 60 //middle C

    constructor(context : AudioContext, parentEl : Element, name : string){
        super(context, parentEl, name)
        this.noteRegistrations = new Set()

        this.setupUI()
    }

    registerEvents(to: Instrument){
        console.debug(`Keyboard: ${this.name} wired up to ${to.name}`)
        this.noteRegistrations.add(to)
    }

    deregisterEvents(to: Instrument){
        console.debug(`Keyboard: ${this.name} disconnecting from ${to.name}`)
        this.noteRegistrations.delete(to)
    }

    async setup(){
        return this
    }

    setupUI(){

        this.el.tabIndex = getTabIndex()
        this.knobsEl = document.createElement("div")
        this.knobsEl.className = "knobs"
        this.el.appendChild(this.knobsEl)

        this.canvas = document.createElement("canvas")

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style.width = this.width
        this.canvas.style.height = this.height
        this.knobsEl.appendChild(this.canvas)

        this.canvasCtx = this.canvas.getContext("2d")
        this.canvasCtx.imageSmoothingEnabled = false
        this.canvasCtx.strokeStyle = "white"

        this.pressedKeys = new Set()
        this.el.addEventListener("keydown", (event: KeyboardEvent) => {
            if(keyToSemitone[event.key] !== undefined && !this.pressedKeys.has(event.key)){ //second conditions stops key repeats
                this.pressedKeys.add(event.key)
                this.noteRegistrations.forEach(inst => {
                    inst.play(this.baseKey + keyToSemitone[event.key], this.audioContext.currentTime, -1) // negative time is forever
                })
            }
        })
        window.addEventListener("keyup", (event: KeyboardEvent) => {
            this.pressedKeys.delete(event.key)
            if(keyToSemitone[event.key] !== undefined){
                this.noteRegistrations.forEach(inst => {
                    inst.play(this.baseKey + keyToSemitone[event.key], this.audioContext.currentTime, 0) // negative time is forever
                })
            }
        })

        this.draw()
        //this.resolveParams()
        //this.setupKnobs()
    }

    draw(){
        this.canvasCtx.fillStyle = "#333"
        this.canvasCtx.fillRect(0, 0, this.width, this.height)
        this.canvasCtx.font = "10px pixeled"
        const gap = 1
        const boxWidth = (this.height - (rows.length + 1))*gap/4

        let y = gap 
        for (let row = 0; row < rows.length; row ++){
            const keys = rows[row]
            let x = (row % 2 == 1) ? gap : gap + boxWidth/2
            keys.forEach(key => {
                if(key){
                    if(row % 2 == 1) {
                        this.canvasCtx.fillStyle = "white"
                        this.canvasCtx.strokeStyle = "black"
                    }
                    else{
                        this.canvasCtx.fillStyle = "black"
                        this.canvasCtx.strokeStyle = "white"
                    }
                    if(this.pressedKeys.has(key)){ //override if we're pressing the key
                        this.canvasCtx.fillStyle = "#555"
                    }
                    this.canvasCtx.fillRect(x, y, boxWidth, boxWidth)

                    //for the wider characters
                    let xAdjust = 5
                    if(key === "j"){
                        xAdjust = 6
                    }
                    else if(key === "m"){
                        xAdjust = 3
                    }

                    this.canvasCtx.strokeText(key, x + xAdjust, y + boxWidth - 4)
                }
                x += boxWidth + gap + 1
            })
            y += boxWidth + gap
        }

    window.requestAnimationFrame(this.draw.bind(this))
    }
}

export {Keyboard}
