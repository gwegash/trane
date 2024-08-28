(use ./dsl_helpers)

(defmacro reverb 
  ````Creates a convolution reverb module with a given `name`
  Grabs an impulse from the URL of the `impulse` parameter

  **Example**
  ```
  (reverb :hello-verb :impulse "http://impulses.com/big_impulse.wav")
  ```
  ````
  [name &named impulse wet-dry]
  ~(inst ,:reverb ,name :impulse ,impulse :wet-dry ,wet-dry)
)

(defmacro Dlay 
  ````Creates a delay module with a given `name`
  * `delay_time` is given in beats
  * `feedback` is a number

  **Example**
  ```
  # Creates a delay module with a delay line length of 0.75 beats and a feedback of 50%
  (Dlay :hello-delay :delay_time 0.75 :feedback 0.5)
  ```
  ````
  [name &named delay_time feedback]
  ~(inst ,:Dlay ,name :delay_time ,delay_time :feedback ,feedback)
)

(defmacro looper 
  ````Creates a looping module with a given `name`
  `loop_time` is given in beats

  **Example**
  ```
  # Creates a looping module with a loop time of 4 beats
  (looper :hello-looper :loop_time 4)
  ```
  ````
  [name &named loop_time]
  ~(inst ,:looper ,name :loop_time ,loop_time)
)

(defmacro distortion [name &named amount]
  ~(inst ,:distortion ,name :amount ,amount)
)

(defmacro compressor [name &named threshold knee ratio attack release]
  ~(inst ,:compressor ,name :threshold ,threshold :knee ,knee :ratio ,ratio :attack ,attack :release ,release)
)

(defmacro line_in [name]
  ~(inst ,:line_in ,name)
)

(defmacro sample [name &named url pitch gain attack release]
  (with-syms [$note]
   ~(let [,$note (note ,pitch)]
      (inst :pitched_sampler ,name :url ,url :pitch ,$note :gain ,gain :attack ,attack :release ,release)
    )
  )
)

(defmacro drums [name &named hits]
  ~(inst ,:drums ,name :hits ,hits)
)

(defmacro gain [name &named gain]
  ~(inst ,:gain ,name :gain ,gain)
)

(defmacro keyboard [name]
  ~(inst ,:keyboard ,name)
)

(defmacro chorus [name]
  ~(inst ,:chorus ,name)
)

(defmacro panner [name &named pan]
  ~(inst ,:panner ,name :pan ,pan)
)

(defmacro breakbeat [name &named url length_beats slices gain]
  (with-syms [$slices]
    ~(let [,$slices 
           (cond 
             (int? ,slices) (tuple ;(map (fn [x] (/ x ,slices)) (range 0 (+ ,slices 1))))
             (tuple? ,slices) ,slices
             (error "slices not a number of slices or tuple of slice times")
           )
           ]
       (inst ,:breakbeat_sampler ,name :url ,url :length_beats ,length_beats :slices ,$slices :gain ,gain)
     )
  )
)

(defmacro synth [name &named wave gain attack release]
  ~(inst ,:synth ,name :wave ,wave :gain ,gain :attack ,attack :release ,release)
)

(defmacro biquad [name &named filter_type frequency detune Q gain]
  ~(inst ,:biquad ,name :filter_type ,filter_type :frequency ,frequency :detune ,detune :Q ,Q :gain ,gain)
)

(defmacro oscillator [name &named wave frequency]
  ~(inst ,:oscillator ,name :wave ,wave :frequency ,frequency)
)

(defmacro lfo [name &named wave frequency magnitude]
  ~(inst ,:lfo ,name :wave ,wave :frequency ,frequency :magnitude ,magnitude)
)

(defmacro scope [name]
  ~(inst ,:scope ,name)
)

(defmacro ladder [name &named cutoff Q]
  ~(inst ,:ladder_filter ,name :cutoff ,cutoff :Q ,Q)
)

(defmacro constant [name &named constant]
  ~(inst ,:constant ,name :constant ,constant)
)
