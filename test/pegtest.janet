(use ../src/dsl)

(def little-parser
  ~{
    :rest (/ "~" :rest)
    :tie (/ "-" :tie)
    :note (cmt (<- (* (range "ag") (at-most 1 (+ "s" "b")) (range "28"))) ,keyword)
    :subdivide (group (* "[" :sequence "]"))
    :repetition (cmt (* (+ :subdivide :note :rest :tie) "*" (number :d+)) ,rep)
    :item (choice :repetition :note :subdivide :rest :tie)
    :sequence (+ (* :item :s :sequence) :item)
    :main (* :sequence -1)
  }
)

(peg/match little-parser "cs2 ~ ~")
(peg/match little-parser "cs2 cs9")
(peg/match little-parser "cs2 cs7 ")
(peg/match little-parser "cs2 cs7 d")
(peg/match little-parser "cs2 cs7")
(peg/match little-parser "[cs2 ~ cs7] ~*5")
(peg/match little-parser "[cs2 cs3] cs7 cs7*5")
(peg/match little-parser "[cs2 cs3 [cs3 cs5]*5] cs7 cs7")
(peg/match little-parser "[cs2 cs3 [cs3 cs5]] cs7 cs7")


(def test-patt
  ~{
    :string (<- :a+) 
    :dual (cmt (* :string "*" (number :d+)) ,rep)
    :sequence (choice (* :dual :s :sequence) :dual)
    :main (* :sequence -1)
  }
)

(peg/match test-patt "lol*4 eh*5")
(peg/match test-patt "eh*5 eh*4")
