(use ./globals)
(use ./harmony)
(use ./euclid)
(use ./params)

(defn- nicedescribe [x]
  (if (string? x)
    x
    (describe x)
  )
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
  (assert (not (get (dyn *instruments*) name)) (string "instrument already declared: " name))
  (put (dyn *instruments*) name @[(length (dyn *instruments*)) instType ;(map nicedescribe args)])
  name
)

(defn encodeParam [inst instParam]
  (- (inc (+ (blshift inst 5) instParam)))
)

(defn change_ [channel to &named cType dur]
  (def cType_ (if cType cType -0.01))
  (def dur_ (if dur dur -1.0))
  [channel to cType_ (dyn :current-time) dur_]
)

(defmacro change [instName param to & rest]
  (def inst (get (dyn *instruments*) instName))
  
  (def instChannel (first inst))
  (assert instChannel (string "instrument not found: " instName))

  (def instType (get inst 1))
  (def instMap (get *inst_params* instType))
  (assert instMap (string "instrument type not found " instType))

  (def paramIdx (get instMap param))
  (assert paramIdx (string "paramater " param " does not exist in instrument " instType))

  (def channelEncoded (encodeParam instChannel paramIdx))
  ~(array/push (get self :notes) (change_ ,channelEncoded ,to ,;rest))
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
  (def k_ (if k k 0.01))
  (assert (> k_ 0) "time constant must be positive")
  ~(change ,instName ,paramIdx ,to ,:cType (- ,k_))
)

(defn rep [num times]
  [;(array/new-filled times num)]
)

(defmacro wire [from to &opt toParam]
  (def fromInstName (eval from))
  (def toInstName (eval to))

  (def toInst (get (dyn *instruments*) toInstName))
  (assert toInst (string "dest instrument not found: " toInstName))
  (assert (get (dyn *instruments*) fromInstName) (string "source inst not found: " fromInstName))

  (if toParam (do 
    (def instType (get toInst 1))
    (def instMap (get *inst_params* instType))
    (assert instMap (string "instrument type not found " instType))

    (def paramIdx (get instMap toParam))
    (assert (or (not toParam) paramIdx) (string "paramater " toParam " does not exist in instrument " instType))
    )
  )

  # TODO assert to can recieve audio, ie is an effect
  ~(inst ,:wire ,(string fromInstName "->wire->" toInstName ;(if toParam ["," toParam] [])) ,fromInstName ,toInstName ,toParam)
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

(defn play_ [pitch channel &named vel dur]
  (if (or (array? pitch) (tuple? pitch)) ## multiple notes, ie chord
    (array/concat ;(map (fn [n] (play_ n channel :vel vel :dur dur)) pitch))
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
  (if currentNote # not a rest 
    (array/push accum el)
    (do # else pop a value off the stack push it back on with the rest length added on
      (def [lastNote lastNoteLen] (array/pop accum))
      (array/push accum [lastNote (+ lastNoteLen currentLen)])
    )
  )
)

#Rests are nil
(defn squish-rests [pattern]
  (reduce squish-rest-reducer @[(get pattern 0)] (array/slice pattern 1))
)

# TODO maybe better as a macro?
(defn P [pattern lengthBeats]
  (cond 
    (or (array? pattern) (number? pattern) (nil? pattern) (string? pattern) (keyword? pattern)) @[[pattern lengthBeats]]
    (tuple? pattern) (do
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

