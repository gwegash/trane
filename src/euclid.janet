(defn euclid [pulses steps]
  (if (> pulses steps)
    (array/new-filled steps 0)
    (do  
      (def pattern @[])
      (def counts @[])
      (def remainders @[])
      (var divisor (- steps pulses))
      (array/concat remainders pulses)
      (var level 0)
      (while true
          (array/push counts (math/floor (/ divisor (get remainders level))))
          (array/push remainders (% divisor (get remainders level)))
          (set divisor (get remainders level))
          (set level (+ level 1))
          (if (<= (get remainders level) 1)
              (break)
          )
      )
      (array/push counts divisor)
      
      (defn build [level]
          (case level
            -1 (array/push pattern nil)
            -2 (array/push pattern 0)
            (do (
               for i 0 (get counts level)
                (build (- level 1))
              )
              (if (not (= (get remainders level) 0))
                  (build (- level 2))
              )
            )
          )
      )
      
      (build level)
      (def i (index-of 0 pattern))
      (array/concat (array/slice pattern i) (array/slice pattern 0 i))
    )
  )
)
