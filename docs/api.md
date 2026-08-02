  # trane API

  ## dsl

  [*](#), [+](#-1), [-](#-), [/](#-2), [P](#P), [bpm](#bpm), [chain](#chain), [change](#change), [exp](#exp), [itarget](#itarget), [lin](#lin), [live_loop](#live_loop), [pick](#pick), [play](#play), [rand](#rand), [rep](#rep), [seed](#seed), [sleep](#sleep), [target](#target), [til](#til), [time](#time), [timesel](#timesel), [uclid](#uclid), [wire](#wire)

  ### *

  **function**  | [source][1]

  ```janet
  (* & args)
  ```

  

  [1]: ../src/dsl.janet#L321

  ### +

  **function**  | [source][2]

  ```janet
  (+ & args)
  ```

  

  [2]: ../src/dsl.janet#L315

  ### -

  **function**  | [source][3]

  ```janet
  (- & args)
  ```

  

  [3]: ../src/dsl.janet#L317

  ### /

  **function**  | [source][4]

  ```janet
  (/ & args)
  ```

  

  [4]: ../src/dsl.janet#L319

  ### P

  **function**  | [source][5]

  ```janet
  (P pattern lengthBeats)
  ```

  Evaluates a given subdivision `pattern` over a number of beats given by `lengthBeats`
Returns a list of `[note, duration]` pairs that can be scheduled.

**Example**
```
(P [0 [1 1] 0 0] 4) # -> @[(0 1) (1 0.5) (1 0.5) (0 1) (0 1)]
```

  [5]: ../src/dsl.janet#L199

  ### bpm

  **function**  | [source][6]

  ```janet
  (bpm beats_per_minute)
  ```

  Sets the bpm (beats per minute) of the current track.

Can only be set once per track, BPM changes are currently unsupported.
To change BPM, reload the page
**Example**
```
(bpm 120) # Sets the BPM to 120 beats per minute
```

  [6]: ../src/dsl.janet#L13

  ### chain

  **function**  | [source][7]

  ```janet
  (chain & forms)
  ```

  

  [7]: ../src/dsl.janet#L174

  ### change

  **function**  | [source][8]

  ```janet
  (change instName param to &named cType dur)
  ```

  Changes the parameter `param` knob of a module `instName` to `to`

**Example**
```
(change :gain-example :gain 0.5) # changes the gain knob on a gain module ':gain-example' to 0.5
```

  [8]: ../src/dsl.janet#L40

  ### exp

  **function**  | [source][9]

  ```janet
  (exp instName paramIdx to)
  ```

  Changes the parameter `param` knob of a module `instName` to `to`
Approaches `to` from its last value exponentially

**Example**
```
(exp :gain-example :gain 0.5) # changes the gain knob on a gain module ':gain-example' to 0.5, approaches exponentially
```

  [9]: ../src/dsl.janet#L75

  ### itarget

  **function**  | [source][10]

  ```janet
  (itarget instName paramIdx to)
  ```

  Instantaneously changes the parameter `param` knob of a module `instName` to `to`

**Example**
```
(itarget :gain-example :gain 0.5) # instantaneously changes the gain knob on a gain module ':gain-example' to 0.5
```

  [10]: ../src/dsl.janet#L87

  ### lin

  **function**  | [source][11]

  ```janet
  (lin instName paramIdx to)
  ```

  Changes the parameter `param` knob of a module `instName` to `to`
Approaches `to` from its last value linearly

**Example**
```
(lin :gain-example :gain 0.5) # linearly changes the gain knob on a gain module ':gain-example' to 0.5
```

  [11]: ../src/dsl.janet#L63

  ### live_loop

  **macro**  | [source][12]

  ```janet
  (live_loop name & instructions)
  ```

  Creates a live-loop of a given name to schedule notes or parameter changes from

**Example**
```
(live-loop :hello-world
  (play :c4 :hello-synth :dur 0.25)
  (sleep 0.5)
)
```

  [12]: ../src/dsl.janet#L285

  ### pick

  **function**  | [source][13]

  ```janet
  (pick & picks)
  ```

  Picks an item randomly from the arguments `picks`

**Example**
```
(pick 1 2 3) # -> 1
(pick 1 2 3) # -> 3
```

  [13]: ../src/dsl.janet#L237

  ### play

  **function**  | [source][14]

  ```janet
  (play note instName &named vel dur)
  ```

  Plays a `note` on a given instrument `instName`
Also accepts a `:dur` duration parameter, in beats.

**Example**
```
(play :C4 :my-sampler :dur 0.5) # plays a :C4 on :my-sampler for 0.5 beats
(play 0 :my-drum :dur 2) # plays a note 0 on :my-drum for 2 beats
```

  [14]: ../src/dsl.janet#L218

  ### rand

  **function**  | [source][15]

  ```janet
  (rand lo hi)
  ```

  Picks a number uniformly between `lo` and `hi`

**Example**
```
(rand 0 1) # -> 0.566847
```

  [15]: ../src/dsl.janet#L249

  ### rep

  **function**  | [source][16]

  ```janet
  (rep what times)
  ```

  Returns a repeated array filled with `what` #times
  
**Example**
```
(rep [1 2 3] 3) # -> @[(1 2 3) (1 2 3) (1 2 3)]
```

  [16]: ../src/dsl.janet#L135

  ### seed

  **function**  | [source][17]

  ```janet
  (seed seed)
  ```

  Sets the random seed of the current live-loop. Useful for repeatable random patterns

**Example**
```
(seed 5)
```

  [17]: ../src/dsl.janet#L274

  ### sleep

  **function**  | [source][18]

  ```janet
  (sleep length)
  ```

  Advances time in the current 'live-loop' by the specified `length`, in beats

**Example**
```
(sleep 4) # advance time by 4 beats
```

  [18]: ../src/dsl.janet#L29

  ### target

  **function**  | [source][19]

  ```janet
  (target instName paramIdx to k)
  ```

  changes the parameter `param` knob of a module `instName` to `to`
Approaches the `to` by a rate defined by the constant `k`

**Example**
```
(target :gain-example :gain 0.5 0.1) # changes the gain knob on a gain module ':gain-example' to 0.5, by a rate 0.1
```

  [19]: ../src/dsl.janet#L98

  ### til

  **function**  | [source][20]

  ```janet
  (til when_beats)
  ```

  Returns the time until the next measure of `when_beats`

**Example**
```
(time) # -> 32
(sleep (til 64)) # -> (sleep 32)
```

  [20]: ../src/dsl.janet#L123

  ### time

  **function**  | [source][21]

  ```janet
  (time)
  ```

  Returns the current time, in beats, of the containing live-loop

**Example**
```
(time) # -> 32
```

  [21]: ../src/dsl.janet#L112

  ### timesel

  **function**  | [source][22]

  ```janet
  (timesel arr changeEvery)
  ```

  Indexes into the array or tuple `arr` with the current time, with the index increasing by one after `changeEvery` time has passed, modulo the length `arr`.

**Example**
```
(time) # -> 5
(timesel [1 2 3 4] 1) # -> 2
(timesel [1 2 3 4] 2) # -> 3
```

  [22]: ../src/dsl.janet#L261

  ### uclid

  **function**  | [source][23]

  ```janet
  (uclid pat n steps)
  ```

  

  [23]: ../src/dsl.janet#L8

  ### wire

  **function**  | [source][24]

  ```janet
  (wire from to &opt toParam)
  ```

  Wires the output of 'from' the input of `to`
Accepts an optional `toParam` which specifies a named parameter, or knob, of `to` to wire the output to.

**Example**
```
# Wires the output of :signal into the :frequency parameter of :filter
(wire :signal :filter :frequency)
```

  [24]: ../src/dsl.janet#L147

  ## harmony

  [chord](#chord), [note](#note), [note?](#note-1), [notes?](#notes), [scale](#scale)

  ### chord

  **function**  | [source][25]

  ```janet
  (chord root quality)
  ```

  Returns a MIDI chord generator of a given root and quality

For qualities see [harmony.janet](https://github.com/gwegash/trane/blob/master/src/harmony.janet#L3)

**Example**
```
((chord :C3 :min) [0 1 2]) # -> @[36 39 43]
((chord :C3 :min) 0) # -> 36
```

  [25]: ../src/harmony.janet#L618

  ### note

  **function**  | [source][26]

  ```janet
  (note quality)
  ```

  Returns a MIDI note or notes that corresponds to the given `quality(s)`

**Example**
```
(note :c4) # -> 48
(note [:c4 :d4]) # -> [48 50]
```

  [26]: ../src/harmony.janet#L560

  ### note?

  **function**  | [source][27]

  ```janet
  (note? n)
  ```

  

  [27]: ../src/harmony.janet#L534

  ### notes?

  **function**  | [source][28]

  ```janet
  (notes? n)
  ```

  

  [28]: ../src/harmony.janet#L541

  ### scale

  **function**  | [source][29]

  ```janet
  (scale root quality)
  ```

  Returns a MIDI scale generator of a given root and quality

For qualities see [harmony.janet](https://github.com/gwegash/trane/blob/master/src/harmony.janet#L518)

**Example**
```
((scale :C3 :minor) [0 1 2 3 4 5 6]) # -> @[36 38 39 41 43 44 46]
((scale :C3 :minor) 0) # -> 36
```

  [29]: ../src/harmony.janet#L598

  ## instruments

  [biquad](#biquad), [breakbeat](#breakbeat), [chorus](#chorus), [compressor](#compressor), [constant](#constant), [delay](#delay), [distortion](#distortion), [drums](#drums), [gain](#gain), [keyboard](#keyboard), [ladder](#ladder), [lfo](#lfo), [line_in](#line_in), [looper](#looper), [oscillator](#oscillator), [panner](#panner), [reverb](#reverb), [sample](#sample), [scope](#scope), [synth](#synth), [tb303](#tb303)

  ### biquad

  **function**  | [source][30]

  ```janet
  (biquad name &named filter_type frequency detune Q gain)
  ```

  

  [30]: ../src/instruments.janet#L97

  ### breakbeat

  **function**  | [source][31]

  ```janet
  (breakbeat name &named url length_beats slices gain timestretch transpose)
  ```

  

  [31]: ../src/instruments.janet#L83

  ### chorus

  **function**  | [source][32]

  ```janet
  (chorus name)
  ```

  

  [32]: ../src/instruments.janet#L75

  ### compressor

  **function**  | [source][33]

  ```janet
  (compressor name &named threshold knee ratio attack release)
  ```

  

  [33]: ../src/instruments.janet#L51

  ### constant

  **function**  | [source][34]

  ```janet
  (constant name &named constant)
  ```

  

  [34]: ../src/instruments.janet#L121

  ### delay

  **function**  | [source][35]

  ```janet
  (delay name &named delay_time feedback)
  ```

  Creates a delay module with a given `name`
* `delay_time` is given in beats
* `feedback` is a number

**Example**
```
# Creates a delay module with a delay line length of 0.75 beats and a feedback of 50%
(delay :hello-delay :delay_time 0.75 :feedback 0.5)
```

  [35]: ../src/instruments.janet#L18

  ### distortion

  **function**  | [source][36]

  ```janet
  (distortion name &named amount)
  ```

  

  [36]: ../src/instruments.janet#L47

  ### drums

  **function**  | [source][37]

  ```janet
  (drums name &named hits)
  ```

  

  [37]: ../src/instruments.janet#L63

  ### gain

  **function**  | [source][38]

  ```janet
  (gain name &named gain)
  ```

  

  [38]: ../src/instruments.janet#L67

  ### keyboard

  **function**  | [source][39]

  ```janet
  (keyboard name)
  ```

  

  [39]: ../src/instruments.janet#L71

  ### ladder

  **function**  | [source][40]

  ```janet
  (ladder name &named cutoff Q)
  ```

  

  [40]: ../src/instruments.janet#L113

  ### lfo

  **function**  | [source][41]

  ```janet
  (lfo name &named wave frequency magnitude)
  ```

  

  [41]: ../src/instruments.janet#L105

  ### line_in

  **function**  | [source][42]

  ```janet
  (line_in name)
  ```

  

  [42]: ../src/instruments.janet#L55

  ### looper

  **function**  | [source][43]

  ```janet
  (looper name &named loop_time)
  ```

  Creates a looping module with a given `name`
`loop_time` is given in beats

**Example**
```
# Creates a looping module with a loop time of 4 beats
(looper :hello-looper :loop_time 4)
```

  [43]: ../src/instruments.janet#L33

  ### oscillator

  **function**  | [source][44]

  ```janet
  (oscillator name &named wave frequency)
  ```

  

  [44]: ../src/instruments.janet#L101

  ### panner

  **function**  | [source][45]

  ```janet
  (panner name &named pan)
  ```

  

  [45]: ../src/instruments.janet#L79

  ### reverb

  **function**  | [source][46]

  ```janet
  (reverb name &named impulse wet-dry decay-time predelay)
  ```

  Creates a convolution reverb module with a given `name`
Grabs an impulse from the URL of the `impulse` parameter

**Example**
```
(reverb :hello-verb :impulse "http://impulses.com/big_impulse.wav")
```

  [46]: ../src/instruments.janet#L4

  ### sample

  **function**  | [source][47]

  ```janet
  (sample name &named url pitch gain attack release loop-start loop-end)
  ```

  

  [47]: ../src/instruments.janet#L59

  ### scope

  **function**  | [source][48]

  ```janet
  (scope name)
  ```

  

  [48]: ../src/instruments.janet#L109

  ### synth

  **function**  | [source][49]

  ```janet
  (synth name &named wave gain attack release)
  ```

  

  [49]: ../src/instruments.janet#L93

  ### tb303

  **function**  | [source][50]

  ```janet
  (tb303 name &named wave gain cutoff resonance envMod decay attack slide)
  ```

  

  [50]: ../src/instruments.janet#L117

