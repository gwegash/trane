(use judge)

(use ../src/harmony)

(test ((chord :c4 :min) [0 1 2]) @[48 51 55])
(test ((chord :c4 :min) 0) 48)
(test ((chord :c4 :min) [-3 -2 -1]) @[36 39 43])

(test ((scale :C3 :minor) [0 1 2 3 4 5 6]) @[36 38 39 41 43 44 46])
(test ((scale :C3 :minor) 0) 36)

(test (note 1) 1)
