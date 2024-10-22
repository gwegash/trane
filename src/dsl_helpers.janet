(use ./harmony)
(use ./globals)

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

# Following Gratefully borrowed from alect https://alectroemel.com/posts/2023-09-26-physics-vectors.html
(defmacro vectorize [fn]
  (let [original-fn (symbol :original/ fn)]
	~(upscope
	# save the original function under a new name
	(def ,original-fn ,fn)

	# now redefine the function
	(defn ,(symbol fn) [& args]
     # Use reduce to accumulate all the arguments with the function.
     # There are 4 possible situations to consider.
     # The comments below will use + as a standing for the provided function.

    # special case - can be unary
    (if (= (length args) 1)
     (,original-fn (first args))
     (reduce2
      |(cond
         # [x1 y1] + [x2 y2] => [(x1 + x2) (y1 + y2)]
         (and (indexed? $0) (indexed? $1))
         (tuple ;(map ,original-fn $0 $1))

         # [x y] + n => [(x + n) (y + n)]
         (and (indexed? $0) (number? $1))
         (tuple ;(map (fn [v] (,original-fn v $1)) $0))

         # n + [x y]  => [(x + n) (y + n)]
         (and (number? $0) (indexed? $1))
         (tuple ;(map (fn [v] (,original-fn v $0)) $1))

         # n1 + n2  => n1 + n2
         (and (number? $0) (number? $1))
         (,original-fn $0 $1)
       )
	args))))
  )
)

(defmacro notify_args [fn]
  (let [original-fn (symbol :original/ fn)]
    ~(upscope
      # save the original function under a new name
      (def ,original-fn ,fn)

      # now redefine the function
      (defn ,(symbol fn) [& args]
        (,original-fn ;(map ,note args))
      )
    )
  )
)
