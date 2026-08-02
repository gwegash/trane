(use ./harmony)
(use ./globals)
(use ./params)

# Every instrument argument crosses into JS as a string; nil becomes the literal
# "nil", which audio.ts maps back to undefined.
(defn nicedescribe [x]
  (if (string? x) x (string/format "%n" x)))

(defn inst
  ````Registers an instrument in the graph and returns its `name`.

  Runs while the script is being evaluated -- that is, during trane_compile -- so the
  whole audio graph exists, and any error in building it has already been reported,
  before a single live_loop runs.
  ````
  [inst-type name & args]
  (def instruments (dyn *instruments*))
  (assert (not (get instruments name)) (string "instrument already declared: " name))
  (put instruments name @[(length instruments) inst-type ;(map nicedescribe args)])
  name)

# Which argument of each DSL form names an instrument, and which name a parameter
# too. (play note :inst ...) puts the instrument second; (change :inst :param ...)
# puts it first and the parameter second.
(def- instrument-arg
  {'play 2 'change 1 'lin 1 'exp 1 'itarget 1 'target 1})

(def- names-a-param
  {'change true 'lin true 'exp true 'itarget true 'target true})

(defn record-references
  ````Walks a live_loop body while it is being compiled, noting the instruments and
  parameters it mentions so that validate-references can check them once the whole
  graph exists.

  Only literal keywords are recorded. `(play n (pick :a :b))` is skipped rather than
  wrongly rejected -- this reports what it is sure about and stays quiet otherwise.
  ````
  [form]
  (def checks (dyn *checks*))
  (when (and checks (indexed? form))
    (def idx (get instrument-arg (first form)))
    (when idx
      (def inst-name (get form idx))
      (def param (get form 2))
      (when (keyword? inst-name)
        (array/push checks
                    (if (and (get names-a-param (first form)) (keyword? param))
                      [:param inst-name param]
                      [:instrument inst-name]))))
    (each sub form
      (record-references sub))))

(defn validate-references
  ````Checks everything record-references collected against the finished instrument
  table. Returns a list of error strings, empty when the script is sound.

  This runs after the whole script has been evaluated, so an instrument may be
  declared below the live_loop that plays it.
  ````
  [env]
  (def instruments (get env *instruments*))
  (def errors @[])
  (each check (or (get env *checks*) @[])
    (def [kind inst-name] check)
    (def inst (get instruments inst-name))
    (cond
      (nil? inst)
      (array/push errors (string "instrument not found: " inst-name))

      (= kind :param)
      (let [inst-type (get inst 1)
            params (get *inst_params* inst-type)
            param (get check 2)]
        (cond
          (nil? params)
          (array/push errors (string "instrument type not found: " inst-type))

          (nil? (get params param))
          (array/push errors
                      (string "parameter " param " does not exist on " inst-name
                              " (" inst-type ")"))))))
  (distinct errors))

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

(defn change_ [channel to &named cType dur]
  # 0 is a meaningful cType (linear ramp) and Janet counts it as true, so `if` is safe
  [channel to (if cType cType -0.01) (dyn :current-time) (if dur dur -1.0)])

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

# Packs an instrument channel and a param index into a single negative number, which
# is how audio.ts tells a param change from a note. 5 bits for the param index caps a
# node at 32 params -- see the NodeDef comment in ui/instruments.ts.
(defn encodeParam [inst instParam]
  (- (inc (+ (blshift inst 5) instParam))))

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
	# save the original function under a new name (private: an implementation
	# detail of this macro, not part of the DSL surface or the generated docs)
	(def ,original-fn :private ,fn)

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
      # save the original function under a new name (private, as above)
      (def ,original-fn :private ,fn)

      # now redefine the function
      (defn ,(symbol fn) [& args]
        (,original-fn ;(map ,note args))
      )
    )
  )
)
