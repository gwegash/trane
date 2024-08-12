(use judge)

(use ../src/globals)
(use ../src/dsl)

(setdyn *instruments* @{})

(def a 4)
(test-macro (breakbeat :break "local://thing" 4 4)
  (let [<1> (cond (int? nil) (tuple (splice (map (fn [x] (/ x nil)) (range 0 (+ nil 1))))) (tuple? nil) nil (error "slices not a number of slices or tuple of slice times"))]
    (inst :breakbeat_sampler :break :url nil :length_beats nil :slices <1>))) 

(test-macro (synth :synth "sawtooth")
  (inst :synth :synth :wave nil))

(deftest-type loop_body
  :setup (fn [] (do 
                  (setdyn *instruments* @{:out @[0 :out] :midi @[1 :midi]})
                  ))
  :reset (fn [context] (do 
                  (setdyn *instruments* @{:out @[0 :out] :midi @[1 :midi]})
                  ))
)

(deftest: loop_body "test_instrument mappings" [context]
  (breakbeat :break :url "local://thing" :length_beats 4 :slices 8)
  (test (dyn *instruments*)
    @{:break @[2
               :breakbeat_sampler
               ":url"
               "local://thing"
               ":length_beats"
               "4"
               ":slices"
               "(0 0.125 0.25 0.375 0.5 0.625 0.75 0.875 1)"]
      :midi @[1 :midi]
      :out @[0 :out]})
)

(deftest: loop_body "test_several_instruments" [context]
  (breakbeat :breaks :url "local://thing.wav" :length_beats 4 :slices [0.1 0.2 0.3])
  (breakbeat :breaksa :url "local://thing.wav" :length_beats 4 :slices [0.1 0.2 0.3])
  (chain :breaks :breaksa :out)
  (test (dyn *instruments*)
    @{"breaks->wire->breaksa" @[4
                                :wire
                                ":from"
                                ":breaks"
                                ":to"
                                ":breaksa"
                                ":toParam"
                                "nil"]
      "breaksa->wire->out" @[5
                             :wire
                             ":from"
                             ":breaksa"
                             ":to"
                             ":out"
                             ":toParam"
                             "nil"]
      :breaks @[2
                :breakbeat_sampler
                ":url"
                "local://thing.wav"
                ":length_beats"
                "4"
                ":slices"
                "(0.1 0.2 0.3)"]
      :breaksa @[3
                 :breakbeat_sampler
                 ":url"
                 "local://thing.wav"
                 ":length_beats"
                 "4"
                 ":slices"
                 "(0.1 0.2 0.3)"]
      :midi @[1 :midi]
      :out @[0 :out]})
)

(deftest: loop_body "test_several_instruments" [context]
  (breakbeat :breaks :url "local://thing.wav" :length_beats 4 :slices [0.1 0.2 0.3])
  (chorus :chorus)
  (chain :breaks :chorus :out)
  (test (dyn *instruments*)
    @{"breaks->wire->chorus" @[4
                               :wire
                               ":from"
                               ":breaks"
                               ":to"
                               ":chorus"
                               ":toParam"
                               "nil"]
      "chorus->wire->out" @[5
                            :wire
                            ":from"
                            ":chorus"
                            ":to"
                            ":out"
                            ":toParam"
                            "nil"]
      :breaks @[2
                :breakbeat_sampler
                ":url"
                "local://thing.wav"
                ":length_beats"
                "4"
                ":slices"
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
