(use ./harmony)
(use ./globals)

(def self @{:notes @[] :rng (math/rng)}) #just to keep the DSL working inside and outside of live-loops #overridden by runner 

(defmacro nicedescribe [x]
  ~(if 
     (string? ,x) ,x
     (string/format "%n" ,x)
  )
)

(defmacro inst [instType name & args]
  ~(do
    (assert (not (get (dyn ,*instruments*) ,name)) (string "instrument already declared: " ,name))
    (put (dyn ,*instruments*) ,name @[(length (dyn ,*instruments*)) ,instType ,;(map nicedescribe args)])
    ,name
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

(defmacro change_ [channel to &named cType dur]
  (with-syms [$cType $dur]
    ~(let [,$cType (if ,cType ,cType -0.01) ,$dur (if ,dur ,dur -1.0)]
      (tuple ,channel ,to ,$cType (dyn :current-time) ,$dur)
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

(defmacro encodeParam [inst instParam]
  ~(- (inc (+ (blshift ,inst 5) ,instParam)))
)

(defn quantiseModulo [modTime measure] ## This could be a terrible idea.
  # float64 eps?? probably a bit generous
  (if (< (math/abs (- modTime measure)) 1e-20)
     0
     modTime
   ) 
)
