  # trane API

  ## dsl

  [P](#P), [bpm](#bpm), [chain](#chain), [change](#change), [exp](#exp), [itarget](#itarget), [lin](#lin), [live_loop](#live_loop), [pick](#pick), [play](#play), [rand](#rand), [rep](#rep), [seed](#seed), [sleep](#sleep), [target](#target), [til](#til), [time](#time), [timesel](#timesel), [uclid](#uclid), [wire](#wire)

  ### P

  **function**  | [source][1]

  ```janet
  (P pattern lengthBeats)
  ```

  Evaluates a given subdivision `pattern` over a number of beats given by `lengthBeats`
Returns a list of `[note, duration]` pairs that can be scheduled.

**Example**
```
(P [0 [1 1] 0 0] 4) # -> @[(0 1) (1 0.5) (1 0.5) (0 1) (0 1)]
```

  [1]: ../src/dsl.janet#L224

  ### bpm

  **macro**  | [source][2]

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

  [2]: ../src/dsl.janet#L13

  ### chain

  **macro**  | [source][3]

  ```janet
  (chain & forms)
  ```

  

  [3]: ../src/dsl.janet#L198

  ### change

  **macro**  | [source][4]

  ```janet
  (change instName param to & rest)
  ```

  Changes the parameter `param` knob of a module `instName` to `to`

**Example**
```
(change :gain-example :gain 0.5) # changes the gain knob on a gain module ':gain-example' to 0.5
```

  [4]: ../src/dsl.janet#L42

  ### exp

  **macro**  | [source][5]

  ```janet
  (exp instName paramIdx to)
  ```

  Changes the parameter `param` knob of a module `instName` to `to`
Approaches `to` from its last value exponentially
 
**Example**
```
(exp :gain-example :gain 0.5) # changes the gain knob on a gain module ':gain-example' to 0.5, approaches exponentially
```

  [5]: ../src/dsl.janet#L87

  ### itarget

  **macro**  | [source][6]

  ```janet
  (itarget instName paramIdx to)
  ```

  Instantaneously changes the parameter `param` knob of a module `instName` to `to`
 
**Example**
```
(itarget :gain-example :gain 0.5) # instantaneously changes the gain knob on a gain module ':gain-example' to 0.5
```

  [6]: ../src/dsl.janet#L100

  ### lin

  **macro**  | [source][7]

  ```janet
  (lin instName paramIdx to)
  ```

  Changes the parameter `param` knob of a module `instName` to `to`
Approaches `to` from its last value linearly
 
**Example**
```
(lin :gain-example :gain 0.5) # linearly changes the gain knob on a gain module ':gain-example' to 0.5
```

  [7]: ../src/dsl.janet#L74

  ### live_loop

  **macro**  | [source][8]

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

  [8]: ../src/dsl.janet#L314

  ### pick

  **macro**  | [source][9]

  ```janet
  (pick & picks)
  ```

  Picks an item randomly from the arguments `picks`

**Example**
```
(pick 1 2 3) # -> 1
(pick 1 2 3) # -> 3
```

  [9]: ../src/dsl.janet#L263

  ### play

  **macro**  | [source][10]

  ```janet
  (play note instName & rest)
  ```

  Plays a `note` on a given instrument `instName`
Also accepts a `:dur` duration parameter, in beats.

**Example**
```
(play :C4 :my-sampler :dur 0.5) # plays a :C4 on :my-sampler for 0.5 beats
(play 0 :my-drum :dur 2) # plays a note 0 on :my-drum for 2 beats
```

  [10]: ../src/dsl.janet#L243

  ### rand

  **macro**  | [source][11]

  ```janet
  (rand lo hi)
  ```

  Picks a number uniformly between `lo` and `hi`

**Example**
```
(rand 0 1) # -> 0.566847
```

  [11]: ../src/dsl.janet#L276

  ### rep

  **function**  | [source][12]

  ```janet
  (rep what times)
  ```

  Returns a repeated array filled with `what` #times
  
**Example**
```
(rep [1 2 3] 3) # -> @[(1 2 3) (1 2 3) (1 2 3)]
```

  [12]: ../src/dsl.janet#L155

  ### seed

  **macro**  | [source][13]

  ```janet
  (seed seed)
  ```

  Sets the random seed of the current live-loop. Useful for repeatable random patterns

**Example**
```
(seed 5)
```

  [13]: ../src/dsl.janet#L302

  ### sleep

  **macro**  | [source][14]

  ```janet
  (sleep length)
  ```

  Advances time in the current 'live-loop' by the specified `length`, in beats

**Example**
```
(sleep 4) # advance time by 4 beats
```

  [14]: ../src/dsl.janet#L29

  ### target

  **macro**  | [source][15]

  ```janet
  (target instName paramIdx to k)
  ```

  

  [15]: ../src/dsl.janet#L112

  ### til

  **macro**  | [source][16]

  ```janet
  (til when_beats)
  ```

  Returns the time until the next measure of `when_beats`
  
**Example**
```
(time) # -> 32
(sleep (til 64)) # -> (sleep 32)
```

  [16]: ../src/dsl.janet#L142

  ### time

  **macro**  | [source][17]

  ```janet
  (time)
  ```

  Returns the current time, in beats, of the containing live-loop
  
**Example**
```
(time) # -> 32 
```

  [17]: ../src/dsl.janet#L129

  ### timesel

  **macro**  | [source][18]

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

  [18]: ../src/dsl.janet#L288

  ### uclid

  **function**  | [source][19]

  ```janet
  (uclid pat n steps)
  ```

  

  [19]: ../src/dsl.janet#L8

  ### wire

  **macro**  | [source][20]

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

  [20]: ../src/dsl.janet#L167

  ## harmony

  [chord](#chord), [note](#note), [notes](#notes)

  ### chord

  **function**  | [source][21]

  ```janet
  (chord root quality)
  ```

  Returns a MIDI chord of a given root and quality

For qualities see [harmony.janet](https://github.com/gwegash/trane/blob/master/src/harmony.janet#L3)

**Example**
```
(chord :C3 :min) # -> @[36 39 43]
```

  [21]: ../src/harmony.janet#L534

  ### note

  **function**  | [source][22]

  ```janet
  (note quality)
  ```

  Returns a MIDI note that corresponds to the given `quality`

**Example**
```
(note :c4) # -> 48
```

  [22]: ../src/harmony.janet#L518

  ### notes

  **function**  | [source][23]

  ```janet
  (notes & qualities)
  ```

  A mapped version of note

**Example**
```
(notes :c3 :e3 :g3) # -> @[36 40 43]
```

  [23]: ../src/harmony.janet#L549

  ## instruments

  [Dlay](#Dlay), [biquad](#biquad), [breakbeat](#breakbeat), [chorus](#chorus), [compressor](#compressor), [constant](#constant), [distortion](#distortion), [drums](#drums), [gain](#gain), [keyboard](#keyboard), [ladder](#ladder), [lfo](#lfo), [line_in](#line_in), [looper](#looper), [oscillator](#oscillator), [panner](#panner), [reverb](#reverb), [sample](#sample), [scope](#scope), [synth](#synth)

  ### Dlay

  **macro**  | [source][24]

  ```janet
  (Dlay name &named delay_time feedback)
  ```

  Creates a delay module with a given `name`
* `delay_time` is given in beats
* `feedback` is a number

**Example**
```
# Creates a delay module with a delay line length of 0.75 beats and a feedback of 50%
(Dlay :hello-delay :delay_time 0.75 :feedback 0.5)
```

  [24]: ../src/instruments.janet#L16

  ### biquad

  **macro**  | [source][25]

  ```janet
  (biquad name &named filter_type frequency detune Q gain)
  ```

  

  [25]: ../src/instruments.janet#L103

  ### breakbeat

  **macro**  | [source][26]

  ```janet
  (breakbeat name &named url length_beats slices)
  ```

  

  [26]: ../src/instruments.janet#L85

  ### chorus

  **macro**  | [source][27]

  ```janet
  (chorus name)
  ```

  

  [27]: ../src/instruments.janet#L77

  ### compressor

  **macro**  | [source][28]

  ```janet
  (compressor name &named threshold knee ratio attack release)
  ```

  

  [28]: ../src/instruments.janet#L49

  ### constant

  **macro**  | [source][29]

  ```janet
  (constant name &named constant)
  ```

  

  [29]: ../src/instruments.janet#L123

  ### distortion

  **macro**  | [source][30]

  ```janet
  (distortion name &named amount)
  ```

  

  [30]: ../src/instruments.janet#L45

  ### drums

  **macro**  | [source][31]

  ```janet
  (drums name &named hits)
  ```

  

  [31]: ../src/instruments.janet#L65

  ### gain

  **macro**  | [source][32]

  ```janet
  (gain name &named gain)
  ```

  

  [32]: ../src/instruments.janet#L69

  ### keyboard

  **macro**  | [source][33]

  ```janet
  (keyboard name)
  ```

  

  [33]: ../src/instruments.janet#L73

  ### ladder

  **macro**  | [source][34]

  ```janet
  (ladder name)
  ```

  

  [34]: ../src/instruments.janet#L119

  ### lfo

  **macro**  | [source][35]

  ```janet
  (lfo name &named wave frequency magnitude)
  ```

  

  [35]: ../src/instruments.janet#L111

  ### line_in

  **macro**  | [source][36]

  ```janet
  (line_in name)
  ```

  

  [36]: ../src/instruments.janet#L53

  ### looper

  **macro**  | [source][37]

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

  [37]: ../src/instruments.janet#L31

  ### oscillator

  **macro**  | [source][38]

  ```janet
  (oscillator name &named wave frequency)
  ```

  

  [38]: ../src/instruments.janet#L107

  ### panner

  **macro**  | [source][39]

  ```janet
  (panner name &named pan)
  ```

  

  [39]: ../src/instruments.janet#L81

  ### reverb

  **macro**  | [source][40]

  ```janet
  (reverb name &named impulse)
  ```

  Creates a convolution reverb module with a given `name`
Grabs an impulse from the URL of the `impulse` parameter

**Example**
```
(reverb :hello-verb :impulse "http://impulses.com/big_impulse.wav")
```

  [40]: ../src/instruments.janet#L3

  ### sample

  **macro**  | [source][41]

  ```janet
  (sample name &named url pitch gain attack release)
  ```

  

  [41]: ../src/instruments.janet#L57

  ### scope

  **macro**  | [source][42]

  ```janet
  (scope name)
  ```

  

  [42]: ../src/instruments.janet#L115

  ### synth

  **macro**  | [source][43]

  ```janet
  (synth name &named wave gain attack release)
  ```

  

  [43]: ../src/instruments.janet#L99

