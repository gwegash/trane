(let [_00006Y :hello _00006Z :g] 
  (assert (get (dyn :instruments) _00006Z) 
          (string "dest instrument not found: " _00006Z)) 
  (assert (get (dyn :instruments) _00006Y) 
          (string "source inst not found: " _00006Y))
  (if nil (let [_000071 (get (get (dyn :instruments) _00006Z) 1)]
            (let [_000072 (get @{:biquad @{ :Q 2 :detune 1 :frequency 0 :gain 3} :compressor @{ :attack 3 :knee 1 :ratio 2 :release 4 :threshold 0} :gain @{:gain 0} :oscillator @{:frequency 0} :panner @{:pan 0}} _000071)] 
              (assert _000072 (string "instrument type not found " _000071)) 
              (assert (or (not nil) (get _000072 nil)) (string "paramater " nil " does not exist in instrument " _000071)))))
  (inst :wire (string _00006Y "->wire->" _00006Z (splice (if nil ["," nil] []))) _00006Y _00006Z nil))
