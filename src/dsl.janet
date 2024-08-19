(use ./globals)
(use ./harmony)
(use ./euclid)
(use ./params)
(use ./instruments)

(defn uclid [pat n steps]
  (def hits (euclid n steps))
  (map (fn [step] (if step pat :tie)) hits)
)

(defn note 
  ````Returns a MIDI note that corresponds to the given `quality`

  ## Example
  ```
  (note :c4) -> 48
  ```
  ````
  [quality]
  (cond
   (number? quality) quality
   (keyword? quality) (get midi_notes quality)
   (errorf "not a note %q" quality)
  )
)

(defmacro bpm
  ````Sets the bpm (beats per minute) of the current track. 

  Can only be set once per track, BPM changes are currently unsupported. 
  To change BPM, reload the page
  ## Example
  ```
  (bpm 120) # Sets the BPM to 120 beats per minute
  ```
  ````
  [beats_per_minute]
  (assert (not (dyn *bpm*)) (string "bpm already defined"))
  (assert (number? beats_per_minute) (string "bpm not a literal number"))
  (setdyn *bpm* beats_per_minute)
)

(defn chord
  ````Returns a MIDI chord of a given root and quality
  
  For qualities see [harmony.janet](https://github.com/gwegash/trane/blob/master/src/harmony.janet)

  ## Example
  ```
  (chord :C3 :min) -> @[36 39 43]

  ```
  ````
  [root quality]
  (def rootNum (note root))
  (map (fn [n] (+ n rootNum)) (get chord_qualities quality))
)

(defn notes
  ````A mapped version of note
  
  ## Example
  ```
  (notes :c3 :e3 :g3) -> @[36 40 43]

  ```
  ````
  [& qualities]
  (map note qualities)
)

(defmacro sleep
  ````Advances time in the current 'live-loop' by the specified `length`, in beats
  
  ## Example
  ```
  (sleep 4) # advance time by 4 beats

  ```
  ````
 [length]
  ~(setdyn :current-time (+ (dyn :current-time) ,length))
)

(defmacro encodeParam [inst instParam]
  ~(- (inc (+ (blshift ,inst 5) ,instParam)))
)

(defmacro change_ [channel to &named cType dur]
  (with-syms [$cType $dur]
    ~(let [,$cType (if ,cType ,cType -0.01) ,$dur (if ,dur ,dur -1.0)]
      (tuple ,channel ,to ,$cType (dyn :current-time) ,$dur)
    )
  )
)

## Eww, this is very nested, refactor me pleaaaaase
(defmacro change 
  ````Changes the parameter `param` knob of a module `instName` to `to`
  
  ## Example
  ```
  (change :gain-example :gain 0.5) # changes the gain knob on a gain module ':gain-example' to 0.5

  ```
  ````
  [instName param to & rest]
  (with-syms [$inst $instChannel $instMap $paramIdx]
    ~(let [,$inst (get (dyn ,*instruments*) ,instName)]
      (let [,$instChannel (first ,$inst)]
        (if ,$instChannel
          (assert ,$instChannel (string "instrument not found: " ,instName ))
          (pp (dyn ,*instruments*))
        )

        (let [,$instChannel (first ,$inst)]
          (let [,$instMap (get ,*inst_params* (get ,$inst 1))]
            (assert ,$instMap (string "instrument type not found " (get ,$inst 1)))

            (let [,$paramIdx (get ,$instMap ,param)]
              (assert ,$paramIdx (string "paramater " ,param " does not exist in instrument " (get ,$inst 1)))
              (array/push (get self :notes) (change_ (encodeParam ,$instChannel ,$paramIdx) ,to ,;rest))
            )
          )
        )
      )
    )
  )
)

(defmacro lin
  ````Changes the parameter `param` knob of a module `instName` to `to`
  Approaches `to` from its last value linearly
   
  ## Example
  ```
  (lin :gain-example :gain 0.5) # linearly changes the gain knob on a gain module ':gain-example' to 0.5

  ```
  ````
  [instName paramIdx to]
  ~(change ,instName ,paramIdx ,to ,:cType 0)
)

(defmacro exp
  ````Changes the parameter `param` knob of a module `instName` to `to`
  Approaches `to` from its last value exponentially
   
  ## Example
  ```
  (exp :gain-example :gain 0.5) # changes the gain knob on a gain module ':gain-example' to 0.5, approaches exponentially

  ```
  ````
  [instName paramIdx to]
  ~(change ,instName ,paramIdx ,to ,:cType 1)
)

(defmacro itarget
  ````Instantaneously changes the parameter `param` knob of a module `instName` to `to`
   
  ## Example
  ```
  (itarget :gain-example :gain 0.5) # instantaneously changes the gain knob on a gain module ':gain-example' to 0.5

  ```
  ````
  [instName paramIdx to]
  ~(change ,instName ,paramIdx ,to ,:cType 2)
)

(defmacro target [instName paramIdx to k] # see change() in instruments.ts
  ````changes the parameter `param` knob of a module `instName` to `to`
  Approaches the `to` by a rate defined by the constant `k`
    
  ## Example
  ```
  (target :gain-example :gain 0.5 0.1) # changes the gain knob on a gain module ':gain-example' to 0.5, by a rate 0.1

  ```
  ````
  (with-syms [$k]
    ~(let [,$k (if ,k ,k 0.01)]
      (assert (> ,$k 0) "time constant must be positive")
      (change ,instName ,paramIdx ,to ,:cType (- ,$k))
    )
  )
)

(defmacro time
  ````Returns the current time, in beats, of the containing live-loop
    
  ## Example
  ```
  (time) -> 32 

  ```
  ````

  []
  ~(dyn :current-time)
)


(defn quantiseModulo [modTime measure] ## This could be a terrible idea.
  # float64 eps?? probably a bit generous
  (if (< (math/abs (- modTime measure)) 1e-20)
     0
     modTime
   ) 
)

(defmacro til 
  ````Returns the time until the next measure of `when_beats`
    
  ## Example
  ```
  (time) -> 32
  (sleep (til 64)) -> (sleep 32)

  ```
  ````
  [when_beats]
  ~(quantiseModulo (- ,when_beats (mod (time) ,when_beats)) ,when_beats)
)

(defn rep 
  ````Returns a repeated array filled with `what` #times
    
  ## Example
  ```
  (rep [1 2 3] 3) -> @[(1 2 3) (1 2 3) (1 2 3)]

  ```
  ````
  [what times]
  (array/new-filled times what)
)

(defmacro wire 
  ````Wires the output of 'from' the input of `to`
  Accepts an optional `toParam` which specifies a named parameter, or knob, of `to` to wire the output to.
    
  ## Example
  ```
  # Wires the output of :signal into the :frequency parameter of :filter
  (wire :signal :filter :frequency)

  ```
  ````
  [from to &opt toParam]
  (with-syms [$fromInstName $toInstName $toInst $instType $instMap]
    ~(let [,$fromInstName ,from ,$toInstName ,to]
      (assert (get (dyn ,*instruments*) ,$toInstName) (string "dest instrument not found: " ,$toInstName))
      (assert (get (dyn ,*instruments*) ,$fromInstName) (string "source inst not found: " ,$fromInstName))

      (if ,toParam 
        (let [,$instType (get (get (dyn ,*instruments*) ,$toInstName) 1)]  
          (let [,$instMap (get ,*inst_params* ,$instType)]  
            (assert ,$instMap (string "instrument type not found " ,$instType))
            (assert (or (not ,toParam) (get ,$instMap ,toParam)) (string "paramater " ,toParam " does not exist in instrument " ,$instType))
          )
        )
      )

      # TODO assert to can recieve audio, ie is an effect
      (inst ,:wire (string ,$fromInstName "->wire->" ,$toInstName ;(if ,toParam ["," ,toParam] [])) :from ,$fromInstName :to ,$toInstName :toParam ,toParam)
    )
  )
)

(defmacro chain [& forms]
  ````Chaining macro, chains together modules. Wires the output of the first into the input of the second,
  and the output of the second into the output of the third etc.

  ## Example
  ```
  # Wires the output of an oscillator into a gain, wire the gain into the output
  (chain 
    (oscillator :hello-osc :wave_type "sine")
    (gain :hello-gain)
    :out
  )
  ```
  ````
  (def firstInst (eval (first forms))) #both keywords now
  (def nextInst (eval (get forms 1))) #both keywords now
  (if (and firstInst nextInst) 
    ~[
      (wire ,firstInst ,nextInst)
      ,;(chain nextInst ;(tuple/slice forms 2))
    ]
    []
  )
)

(defn play_ [pitch channel &named vel dur]
  (cond
    (or (array? pitch) (tuple? pitch)) (array/concat ;(map (fn [n] (play_ n channel :vel vel :dur dur)) pitch))
    (= pitch :rest) @[]
    (do 
      (def pitch_ (note pitch))
      (def vel_ (if vel vel 1.0))
      (def dur_ (if dur dur -1.0))
      @[[channel pitch_ vel_ (dyn :current-time) dur_]]
    )
  )
)

(defn squish-rest-reducer [accum el]
  (def [currentNote currentLen] el)
  (match currentNote
    :tie (do # else pop a value off the stack push it back on with the tie length added on
      (def [lastNote lastNoteLen] (array/pop accum))
      (array/push accum [lastNote (+ lastNoteLen currentLen)])
    )
    _ (array/push accum el)
  )
)

#Rests are nil
(defn squish-rests [pattern]
  (reduce squish-rest-reducer @[(get pattern 0)] (array/slice pattern 1))
)

# TODO maybe better as a macro?
(defn P 
  ````Evaluates a given subdivision `pattern` over a number of beats given by `lengthBeats`
  Returns a list of `[note, duration]` pairs that can be scheduled.

  ## Example
  ```
  (P [0 [1 1] 0 0] 4) -> @[(0 1) (1 0.5) (1 0.5) (0 1) (0 1)]
  ```
  ````
  [pattern lengthBeats]
  (cond 
    (or (number? pattern) (nil? pattern) (string? pattern) (keyword? pattern)) @[[pattern lengthBeats]]
    (or (array? pattern) (tuple? pattern)) (do
      (def elementLength (/ lengthBeats (length pattern))) 
      (squish-rests (array/concat ;(map (fn [element] (P element elementLength)) pattern)))
    )
  )
)

(defmacro play
  ````Plays a `note` on a given instrument `instName`
  Also accepts a `:dur` duration parameter, in beats.

  ## Example
  ```
  (play :C4 :my-sampler :dur 0.5) # plays a :C4 on :my-sampler for 0.5 beats
  (play 0 :my-drum :dur 2) # plays a note 0 on :my-drum for 2 beats
  ```
  ````
  [note instName & rest]
  (if note
    (do  
      (def instChannel (first (get (dyn *instruments*) instName)))
      (assert instChannel (string "instrument not found: " instName))
      ~(array/push (get self :notes) ;(play_ ,note ,instChannel ,;rest))
    )
  )
)

(defmacro pick 
  ````Picks an item randomly from the arguments `picks`

  ## Example
  ```
  (pick 1 2 3) -> 1
  (pick 1 2 3) -> 3
  ```
  ````
  [& picks]
  ~(get [,;picks] (math/rng-int (get self :rng) (length [,;picks])))
)

(defmacro rand 
  ````Picks a number uniformly between `lo` and `hi`

  ## Example
  ```
  (rand 0 1) -> 0.566847
  ```
  ````
  [lo hi]
  ~(+ ,lo (* (- ,hi ,lo) (math/rng-uniform (get self :rng))))
)

#selects an element from arr based on the current-time, quantised to changeEvery, modulo the length of the array
# current-time 8 (timesel [0 1 2 3] 4) -> 2
# current-time 16 (timesel [0 1 2 3] 4) -> 2
(defmacro timesel
  ````Indexes into the array or tuple `arr` with the current time, with the index increasing by one after `changeEvery` time has passed, modulo the length `arr`.

  ## Example
  ```
  (time) -> 5 
  (timesel [1 2 3 4] 1) -> 2
  (timesel [1 2 3 4] 2) -> 3
  
  ```
  ````
  [arr changeEvery]
  ~(get ,arr (% (math/floor (/ (dyn :current-time) ,changeEvery)) (length ,arr)))
)

(defmacro seed 
  ````Sets the random seed of the current live-loop. Useful for repeatable random patterns

  ## Example
  ```
  (seed 5)
  ```
  ````
  [seed]
  ~(set (self :rng) (math/rng ,seed))
)

(defmacro live_loop
  ````Creates a live-loop of a given name to schedule notes or parameter changes from

  ## Example
  ```
  (live-loop :hello-world
    (play :c4 :hello-synth :dur 0.25)
    (sleep 0.5)
  )
  ```
  ````
  [name & instructions]
  ~(put (dyn ,*lloops*) ,name (fiber/new (fn []
       (let [self @{:notes @[] :rng (math/rng)}]
         (forever 
           (set (self :start-time) (dyn :current-time))
           ,;instructions
           (yield [(- (dyn :current-time) (get self :start-time)) (get self :notes)])
           (set (self :notes) @[])
       )
       )
     ) :yei)))

