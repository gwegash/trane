import { context, play } from "./audio"
import { bpm, janetRuntime } from "./index"

const LEAD_TIME_MILLIS = 500 //hack, let's see if this helps
let current_time_beats = 0
let start_time_seconds

let envRunning //The environment that _is_ running. On a code change signal, we'll set this

const loops: Map<string, LoopState> = {}

interface LoopState {
  current_time_beats: number
  started: boolean
}

function init() {
  //requires the audioContext and runtime to be initialised
  if (start_time_seconds !== undefined) {
    //don't bother if we've already started
    return
  }
  start_time_seconds = context.currentTime
  masterLoop() //async, fires this off
}

function scheduleEvents(events) {
  for (let i = 0; i < events.size(); i++) {
    const note = events.get(i)
    play(
      note.channel,
      note.pitch,
      note.vel,
      start_time_seconds +
        beat_time_to_real_seconds(note.start) +
        LEAD_TIME_MILLIS / 1000.0,
      beat_time_to_real_seconds(note.dur),
    )
  }
}

// lets make a master loop, exists by sleeping for 4 bars, sets up other code to run, and keeps a master clock of things

function codeReload(environment, lloop_names) {
  const allLoopNames: Set<string> = new Set()

  if (lloop_names) {
    for (let i = 0; i < lloop_names.size(); i++) {
      const loop_name = lloop_names.get(i)
      allLoopNames.add(loop_name)
    }
  }

  const newLoops = [...allLoopNames].filter((x) => !loops[x])
  const loopsToDie = Object.keys(loops).filter((x) => !allLoopNames.has(x))

  newLoops.forEach((loop_name) => {
    console.log(`setting up loop ${loop_name} to run`)
    loops[loop_name] = { started: false }
  })

  loopsToDie.forEach((loop_name) => {
    delete loops[loop_name]
  })

  envRunning = environment
}

function beat_time_to_real_seconds(beat) {
  return (beat / bpm) * 60
}

async function masterLoop() {
  const loopsToStart = Object.keys(loops).filter(
    (loop_name) => !loops[loop_name].started,
  )
  loopsToStart.forEach((loop_name) => {
    const currentLoopState = loops[loop_name]
    currentLoopState.started = true
    currentLoopState.current_time_beats = current_time_beats
    console.log(`starting ${loop_name}`)
    execute_loop(loop_name) //async, fires this off and doesn't wait for a return
  })
  const rest_length = 4

  const wakeup_time_s =
    start_time_seconds +
    beat_time_to_real_seconds(current_time_beats + rest_length) -
    LEAD_TIME_MILLIS / 1000 //preempt the wakeup time by 250s
  const elapsed_time = context.currentTime - start_time_seconds

  const sleepFor_s = wakeup_time_s - elapsed_time
  const scheduleForMillis = sleepFor_s * 1000
  current_time_beats = current_time_beats + rest_length
  setTimeout(masterLoop, scheduleForMillis) //TODO make this run immediately on code ready, or on keypress
}

async function execute_loop(loop_name) {
  const currentLoopState = loops[loop_name]
  if (!currentLoopState) {
    console.log(`loop ${loop_name} is dead, not running`)
    return
  }
  const result = janetRuntime.trane_continue(
    envRunning,
    loop_name.slice(1),
    currentLoopState.current_time_beats,
  )
  if (!result.isError) {
    scheduleEvents(result.notes)
  } else {
    console.log("error in " + loop_name + " killing it")
    delete loops[loop_name]
  }

  const wakeup_time_s =
    start_time_seconds +
    beat_time_to_real_seconds(
      currentLoopState.current_time_beats + result.rest_length,
    ) -
    LEAD_TIME_MILLIS / 1000 //preempt the wakeup time by 250s
  const elapsed_time = context.currentTime - start_time_seconds

  const sleepFor_s = wakeup_time_s - elapsed_time

  if (sleepFor_s < 0) {
    console.warn("sleeptime is negative: " + sleepFor_s)
  }

  const scheduleForMillis = sleepFor_s * 1000

  //update the timer before we wake up
  currentLoopState.current_time_beats =
    currentLoopState.current_time_beats + result.rest_length
  setTimeout(() => execute_loop(loop_name), scheduleForMillis)
}

export { init, codeReload }
