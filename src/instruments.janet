(use ./dsl_helpers)
(use ./harmony) # `sample` resolves its :pitch here, now that it is a function

(defn reverb 
  ````Creates a convolution reverb module with a given `name`
  Grabs an impulse from the URL of the `impulse` parameter

  **Example**
  ```
  (reverb :hello-verb :impulse "http://impulses.com/big_impulse.wav")
  ```
  ````
  [name &named impulse wet-dry decay-time predelay]
  (inst :reverb name :impulse impulse :wet-dry wet-dry :decay-time decay-time :predelay predelay)
)

# shadows the Janet `delay` because I don't really use it. But hey, if you want it, then you can change that here.
(defn delay
  ````Creates a delay module with a given `name`
  * `delay_time` is given in beats
  * `feedback` is a number

  **Example**
  ```
  # Creates a delay module with a delay line length of 0.75 beats and a feedback of 50%
  (delay :hello-delay :delay_time 0.75 :feedback 0.5)
  ```
  ````
  [name &named delay_time feedback]
  (inst :delay name :delay_time delay_time :feedback feedback)
)

(defn looper 
  ````Creates a looping module with a given `name`
  `loop_time` is given in beats

  **Example**
  ```
  # Creates a looping module with a loop time of 4 beats
  (looper :hello-looper :loop_time 4)
  ```
  ````
  [name &named loop_time]
  (inst :looper name :loop_time loop_time)
)

(defn distortion [name &named amount]
  (inst :distortion name :amount amount)
)

(defn compressor [name &named threshold knee ratio attack release]
  (inst :compressor name :threshold threshold :knee knee :ratio ratio :attack attack :release release)
)

(defn line_in [name]
  (inst :line_in name)
)

(defn sample [name &named url pitch gain attack release loop-start loop-end]
  (inst :sample name :url url :pitch (note pitch) :gain gain :attack attack
        :release release :loop_start loop-start :loop_end loop-end))

(defn drums [name &named hits]
  (inst :drums name :hits hits)
)

(defn gain [name &named gain]
  (inst :gain name :gain gain)
)

(defn keyboard [name]
  (inst :keyboard name)
)

(defn chorus [name]
  (inst :chorus name)
)

(defn panner [name &named pan]
  (inst :panner name :pan pan)
)

(defn breakbeat [name &named url length_beats slices gain timestretch transpose]
  # `slices` is either a count, meaning cut the sample into that many equal pieces,
  # or an explicit tuple of normalised slice points
  (def slice-points
    (cond
      (int? slices) (tuple ;(map (fn [x] (/ x slices)) (range 0 (+ slices 1))))
      (tuple? slices) slices))
  (inst :breakbeat name :url url :length_beats length_beats :slices slice-points
        :gain gain :transpose transpose :timestretch timestretch))

(defn synth [name &named wave gain attack release]
  (inst :synth name :wave wave :gain gain :attack attack :release release)
)

(defn biquad [name &named filter_type frequency detune Q gain]
  (inst :biquad name :filter_type filter_type :frequency frequency :detune detune :Q Q :gain gain)
)

(defn oscillator [name &named wave frequency]
  (inst :oscillator name :wave wave :frequency frequency)
)

(defn lfo [name &named wave frequency magnitude]
  (inst :lfo name :wave wave :frequency frequency :magnitude magnitude)
)

(defn scope [name]
  (inst :scope name)
)

(defn ladder [name &named cutoff Q]
  (inst :ladder name :cutoff cutoff :Q Q)
)

(defn tb303 [name &named wave gain cutoff resonance envMod decay attack slide]
  (inst :tb303 name :wave wave :gain gain :cutoff cutoff :resonance resonance :envMod envMod :decay decay :attack attack :slide slide)
)

(defn constant [name &named constant]
  (inst :constant name :constant constant)
)
