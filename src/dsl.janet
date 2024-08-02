(use ./globals)
(use ./harmony)
(use ./euclid)
(use ./params)

(defmacro nicedescribe [x]
  ~(if (string? ,x)
    ,x
    (describe ,x)
  )
)

(defn uclid [pat n steps]
  (def hits (euclid n steps))
  (map (fn [step] (if step pat :tie)) hits)
)

(defn note [quality]
  (cond
   (number? quality) quality
   (keyword? quality) (get midi_notes quality)
   (errorf "not a note %q" quality)
  )
)

(defn chord [root quality]
  (def rootNum (note root))
  (map (fn [n] (+ n rootNum)) (get chord_qualities quality))
)

(defn notes [& qualities]
  (map note qualities)
)

(defmacro sleep [length]
  ~(setdyn :current-time (+ (dyn :current-time) ,length))
)

#instruments! TODO default arguments
(defmacro inst [instType name & args]
  ~(do
    (assert (not (get (dyn ,*instruments*) ,name)) (string "instrument already declared: " ,name))
    (put (dyn ,*instruments*) ,name @[(length (dyn ,*instruments*)) ,instType ,;(map nicedescribe args)])
    ,name
  )
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
(defmacro change [instName param to & rest]
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

(defmacro lin [instName paramIdx to] # see change() in instruments.ts
  ~(change ,instName ,paramIdx ,to ,:cType 0)
)

(defmacro exp [instName paramIdx to] # see change() in instruments.ts
  ~(change ,instName ,paramIdx ,to ,:cType 1)
)

(defmacro itarget [instName paramIdx to] # see change() in instruments.ts
  ~(change ,instName ,paramIdx ,to ,:cType 2)
)

(defmacro target [instName paramIdx to k] # see change() in instruments.ts
  (with-syms [$k]
    ~(let [,$k (if ,k ,k 0.01)]
      (assert (> ,$k 0) "time constant must be positive")
      (change ,instName ,paramIdx ,to ,:cType (- ,$k))
    )
  )
)

(defn rep [num times]
  (array/new-filled times num)
)

(defmacro wire [from to &opt toParam]
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
      (inst ,:wire (string ,$fromInstName "->wire->" ,$toInstName ;(if ,toParam ["," ,toParam] [])) ,;[$fromInstName $toInstName toParam])
    )
  )
)

(defmacro chain [& forms]
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


(defmacro reverb [name impulse]
  ~(inst ,:reverb ,name ,impulse)
)

(defmacro Dlay [name delayTime]
  ~(inst ,:Dlay ,name ,delayTime)
)

(defmacro looper [name loopTime]
  ~(inst ,:looper ,name ,loopTime)
)

(defmacro distortion [name amount]
  ~(inst ,:distortion ,name ,amount)
)

(defmacro compressor [name]
  ~(inst ,:compressor ,name)
)

(defmacro line_in [name]
  ~(inst ,:line_in ,name)
)

(defmacro sample [name sample_url sample_pitch]
  (def n (note sample_pitch))
  ~(inst ,:pitched_sampler ,name ,sample_url ,n)
)

(defmacro drums [name & sample_urls]
  ~(inst ,:drums ,name ,;sample_urls)
)

(defmacro gain [name]
  ~(inst ,:gain ,name)
)

(defmacro chorus [name]
  ~(inst ,:chorus ,name)
)

(defmacro panner [name]
  ~(inst ,:panner ,name)
)

(defmacro breakbeat [name sample_url length_beats num_slices]
  ~(inst ,:breakbeat_sampler ,name ,sample_url ,length_beats ,num_slices)
)

(defmacro synth [name wave_type]
  ~(inst ,:synth ,name ,wave_type)
)

(defmacro biquad [name filterType]
  ~(inst ,:biquad ,name ,filterType)
)

(defmacro oscillator [name wave_type]
  ~(inst ,:oscillator ,name ,wave_type)
)

(defmacro lfo [name wave_type]
  ~(inst ,:lfo ,name ,wave_type)
)

(defmacro scope [name]
  ~(inst ,:scope ,name)
)

(defmacro constant [name]
  ~(inst ,:constant ,name)
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
(defn P [pattern lengthBeats]
  (cond 
    (or (number? pattern) (nil? pattern) (string? pattern) (keyword? pattern)) @[[pattern lengthBeats]]
    (or (array? pattern) (tuple? pattern)) (do
      (def elementLength (/ lengthBeats (length pattern))) 
      (squish-rests (array/concat ;(map (fn [element] (P element elementLength)) pattern)))
    )
  )
)

(defmacro play [note instName & rest]
  (if note
    (do  
      (def instChannel (first (get (dyn *instruments*) instName)))
      (assert instChannel (string "instrument not found: " instName))
      ~(array/push (get self :notes) ;(play_ ,note ,instChannel ,;rest))
    )
  )
)

(defmacro pick [& pitches]
  ~(get [,;pitches] (math/rng-int (get self :rng) (length [,;pitches])))
)

(defmacro rand [lo hi]
  ~(+ ,lo (* (- ,hi ,lo) (math/rng-uniform (get self :rng))))
)

#selects an element from arr based on the current-time, quantised to changeEvery, modulo the length of the array
# current-time 8 (timesel [0 1 2 3] 4) -> 2
# current-time 16 (timesel [0 1 2 3] 4) -> 2
(defmacro timesel [arr changeEvery]
  ~(get ,arr (% (math/floor (/ (dyn :current-time) ,changeEvery)) (length ,arr)))
)

(defmacro seed [seed]
  ~(set (self :rng) (math/rng ,seed))
)

(defmacro live_loop [name & instructions]
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

