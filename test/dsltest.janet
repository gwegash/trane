(use judge)

(use ../src/globals)
(use ../src/dsl)

(setdyn *instruments* @{})

(def a 4)
(test-macro (breakbeat :break "local://thing" 4 4)
  (let [<1> (cond (int? 4) (tuple (splice (map (fn [x] (/ x 4)) (range 0 (+ 4 1))))) (tuple? 4) 4 (error "slices not a number of slices or tuple of slice times"))]
    (inst :breakbeat_sampler :break "local://thing" 4 <1>))) 

(test-macro (synth :synth "sawtooth")
  (inst :synth :synth "sawtooth"))

(deftest-type loop_body
  :setup (fn [] (do 
                  (setdyn *instruments* @{:out @[0 :out] :midi @[1 :midi]})
                  ))
  :reset (fn [context] (do 
                  (setdyn *instruments* @{:out @[0 :out] :midi @[1 :midi]})
                  ))
)

(deftest: loop_body "test_instrument mappings" [context]
  (breakbeat :break "local://thing" 4 8)
  (test (dyn *instruments*)
    @{:break @[2
               :breakbeat_sampler
               "local://thing"
               "4"
               "(0 0.125 0.25 0.375 0.5 0.625 0.75 0.875 1)"]
      :midi @[1 :midi]
      :out @[0 :out]})
)

(deftest: loop_body "test_several_instruments" [context]
  (breakbeat :breaks "local://thing.wav" 4 [0.1 0.2 0.3])
  (breakbeat :breaksa "local://thing.wav" 4 [0.1 0.2 0.3])
  (chain :breaks :breaksa :out)
  (test (dyn *instruments*)
    @{"breaks->wire->breaksa" @[4 :wire ":breaks" ":breaksa" "nil"]
      "breaksa->wire->out" @[5 :wire ":breaksa" ":out" "nil"]
      :breaks @[2
                :breakbeat_sampler
                "local://thing.wav"
                "4"
                "(0.1 0.2 0.3)"]
      :breaksa @[3
                 :breakbeat_sampler
                 "local://thing.wav"
                 "4"
                 "(0.1 0.2 0.3)"]
      :midi @[1 :midi]
      :out @[0 :out]})
)

(deftest: loop_body "test_several_instruments" [context]
  (breakbeat :breaks "local://thing.wav" 4 [0.1 0.2 0.3])
  (chorus :chorus)
  (chain :breaks :chorus :out)
  (test (dyn *instruments*)
    @{"breaks->wire->chorus" @[4 :wire ":breaks" ":chorus" "nil"]
      "chorus->wire->out" @[5 :wire ":chorus" ":out" "nil"]
      :breaks @[2
                :breakbeat_sampler
                "local://thing.wav"
                "4"
                "(0.1 0.2 0.3)"]
      :chorus @[3 :chorus]
      :midi @[1 :midi]
      :out @[0 :out]})
)

(deftest: loop_body "test_new_inst_def" [context]
  (sample :samples :url "thing.wav" :pitch :c4)
  (test (dyn *instruments*)
    @{:midi @[1 :midi]
      :out @[0 :out]
      :samples @[2
                 :pitched_sampler
                 ":url"
                 "thing.wav"
                 ":pitch"
                 "48"
                 ":gain"
                 "nil"
                 ":attack"
                 "nil"
                 ":release"
                 "nil"]})
)
