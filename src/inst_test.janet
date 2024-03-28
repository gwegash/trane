(use ./globals)
(use ./dsl)

(setdyn *instruments* @{})

(macex1 (sample :lol "hello" :C3))
(pp (dyn *instruments*))

