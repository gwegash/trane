#gratefully taken from https://github.com/yuma-m/pychord/blob/44d3db5c075efdda4e7b4ecdb9cdef074b2aab0d/pychord/constants/qualities.py
(def- chord_qualities @{
  :5 [0 7]
  :maj [0 4 7]
  :major [0 4 7]
  :m [0 3 7]
  :min [0 3 7]
  :minor [0 3 7]
  :- [0 3 7]
  :dim [0 3 6]
  :diminished [0 3 6]
  :b5 [0 4 6]
  :aug [0 4 8]
  :sus2 [0 2 7]
  :sus4 [0 5 7]
  :sus [0 5 7]
  :6 [0 4 7 9]
  :6b5 [0 4 6 9]
  :6-5 [0 4 6 9]
  :7 [0 4 7 10]
  :7-5 [0 4 6 10]
  :7b5 [0 4 6 10]
  :7+5 [0 4 8 10]
  :7s5 [0 4 8 10]
  :7sus4 [0 5 7 10]
  :m6 [0 3 7 9]
  :m7 [0 3 7 10]
  :m7 [0 3 7 10]
  :m7-5 [0 3 6 10]
  :m7b5 [0 3 6 10]
  :m7+5 [0 3 8 10]
  :m7s5 [0 3 8 10]
  :dim6 [0 3 6 8]
  :dim7 [0 3 6 9]
  :M7 [0 4 7 11]
  :maj7 [0 4 7 11]
  :M7+5 [0 4 8 11]
  :mM7 [0 3 7 11]
  :add4 [0 4 5 7]
  :Madd4 [0 4 5 7]
  :madd4 [0 3 5 7]
  :add9 [0 4 7 14]
  :Madd9 [0 4 7 14]
  :madd9 [0 3 7 14]
  :sus4add9 [0 5 7 14]
  :sus4add2 [0 2 5 7]
  :2 [0 4 7 14]
  :add11 [0 4 7 17]
  :4 [0 4 7 17]
  :m69 [0 3 7 9 14]
  :69 [0 4 7 9 14]
  :9 [0 4 7 10 14]
  :m9 [0 3 7 10 14]
  :M9 [0 4 7 11 14]
  :maj9 [0 4 7 11 14]
  :9sus4 [0 5 7 10 14]
  :7-9 [0 4 7 10 13]
  :7b9 [0 4 7 10 13]
  :7+9 [0 4 7 10 15]
  :7s9 [0 4 7 10 15]
  :9-5 [0 4 6 10 14]
  :9b5 [0 4 6 10 14]
  :9+5 [0 4 8 10 14]
  :9s5 [0 4 8 10 14]
  :7s9b5 [0 4 6 10 15]
  :7s9s5 [0 4 8 10 15]
  :m7b9b5 [0 3 6 10 13]
  :7b9b5 [0 4 6 10 13]
  :7b9s5 [0 4 8 10 13]
  :11 [0 7 10 14 17]
  :7+11 [0 4 7 10 18]
  :7s11 [0 4 7 10 18]
  :M7+11 [0 4 7 11 18]
  :M7s11 [0 4 7 11 18]
  :7b9s9 [0 4 7 10 13 15]
  :7b9s11 [0 4 7 10 13 18]
  :7s9s11 [0 4 7 10 15 18]
  :7-13 [0 4 7 10 20]
  :7b13 [0 4 7 10 20]
  :m7add11 [0 3 7 10 17]
  :M7add11 [0 4 7 11 17]
  :mM7add11 [0 3 7 11 17]
  :7b9b13 [0 4 7 10 13 17 20]
  :9+11 [0 4 7 10 14 18]
  :9s11 [0 4 7 10 14 18]
  :m11 [0 3 7 10 14 17]
  :13 [0 4 7 10 14 21]
  :13-9 [0 4 7 10 13 21]
  :13b9 [0 4 7 10 13 21]
  :13+9 [0 4 7 10 15 21]
  :13s9 [0 4 7 10 15 21]
  :13+11 [0 4 7 10 18 21]
  :13s11 [0 4 7 10 18 21]
  :maj13 [0 4 7 11 14 21]
  :M7add13 [0 4 7 9 11 14]
  }
)

(def- midi_notes @{
    :c 0 
    :db 1 
    :cs 1 
    :d 2 
    :eb 3 
    :ds 3 
    :e 4 
    :f 5 
    :fs 6 
    :gb 6 
    :g 7 
    :ab 8 
    :gs 8 
    :a 9 
    :bb 10
    :as 10
    :b 11
    :cb 11

    :c0 0 
    :db0 1 
    :cs0 1 
    :d0 2 
    :eb0 3 
    :ds0 3 
    :e0 4 
    :f0 5 
    :fs0 6 
    :gb0 6 
    :g0 7 
    :ab0 8 
    :gs0 8 
    :a0 9 
    :bb0 10
    :as0 10
    :b0 11
    :cb0 11

    :c1 12 
    :db1 13 
    :cs1 13 
    :d1 14 
    :eb1 15 
    :ds1 15 
    :e1 16 
    :f1 17 
    :fs1 18 
    :gb1 18 
    :g1 19 
    :ab1 20 
    :gs1 20 
    :a1 21 
    :bb1 22
    :as1 22
    :b1 23
    :cb1 23

    :c2 24 
    :db2 25 
    :cs2 25 
    :d2 26 
    :eb2 27 
    :ds2 27 
    :e2 28 
    :f2 29 
    :fs2 30 
    :gb2 30 
    :g2 31 
    :ab2 32 
    :gs2 32 
    :a2 33 
    :bb2 34
    :as2 34
    :b2 35
    :cb2 35

    :c3 36 
    :db3 37 
    :cs3 37 
    :d3 38 
    :eb3 39 
    :ds3 39 
    :e3 40 
    :f3 41 
    :fs3 42 
    :gb3 42 
    :g3 43 
    :ab3 44 
    :gs3 44 
    :a3 45 
    :bb3 46
    :as3 46
    :b3 47
    :cb3 47

    :c4 48 
    :db4 49 
    :cs4 49 
    :d4 50 
    :eb4 51 
    :ds4 51 
    :e4 52 
    :f4 53 
    :fs4 54 
    :gb4 54 
    :g4 55 
    :ab4 56 
    :gs4 56 
    :a4 57 
    :bb4 58
    :as4 58
    :b4 59
    :cb4 59

    :c5 60 
    :db5 61 
    :cs5 61 
    :d5 62 
    :eb5 63 
    :ds5 63 
    :e5 64 
    :f5 65 
    :fs5 66 
    :gb5 66 
    :g5 67 
    :ab5 68 
    :gs5 68 
    :a5 69 
    :bb5 70
    :as5 70
    :b5 71
    :cb5 71

    :c6 72 
    :db6 73 
    :cs6 73 
    :d6 74 
    :eb6 75 
    :ds6 75 
    :e6 76 
    :f6 77 
    :fs6 78 
    :gb6 78 
    :g6 79 
    :ab6 80 
    :gs6 80 
    :a6 81 
    :bb6 82
    :as6 82
    :b6 83
    :cb6 83

    :c7 84 
    :db7 85 
    :cs7 85 
    :d7 86 
    :eb7 87 
    :ds7 87 
    :e7 88 
    :f7 89 
    :fs7 90 
    :gb7 90 
    :g7 91 
    :ab7 92 
    :gs7 92 
    :a7 93 
    :bb7 94
    :as7 94
    :b7 95
    :cb7 95

    :c8 96 
    :db8 97 
    :cs8 97 
    :d8 98 
    :eb8 99 
    :ds8 99 
    :e8 100 
    :f8 101 
    :fs8 102 
    :gb8 102 
    :g8 103 
    :ab8 104 
    :gs8 104 
    :a8 105 
    :bb8 106
    :as8 106
    :b8 107
    :cb8 107

    :c9 108 
    :db9 109 
    :cs9 109 
    :d9 110 
    :eb9 111 
    :ds9 111 
    :e9 112 
    :f9 113 
    :fs9 114 
    :gb9 114 
    :g9 115 
    :ab9 116 
    :gs9 116 
    :a9 117 
    :bb9 118
    :as9 118
    :b9 119
    :cb9 119

    :C 0 
    :Db 1 
    :Cs 1 
    :D 2 
    :Eb 3 
    :Ds 3 
    :E 4 
    :F 5 
    :Fs 6 
    :Gb 6 
    :G 7 
    :Ab 8 
    :Gs 8 
    :A 9 
    :Bb 10
    :As 10
    :B 11
    :Cb 11

    :C0 0 
    :Db0 1 
    :Cs0 1 
    :D0 2 
    :Eb0 3 
    :Ds0 3 
    :E0 4 
    :F0 5 
    :Fs0 6 
    :Gb0 6 
    :G0 7 
    :Ab0 8 
    :Gs0 8 
    :A0 9 
    :Bb0 10
    :As0 10
    :B0 11
    :Cb0 11

    :C1 12 
    :Db1 13 
    :Cs1 13 
    :D1 14 
    :Eb1 15 
    :Ds1 15 
    :E1 16 
    :F1 17 
    :Fs1 18 
    :Gb1 18 
    :G1 19 
    :Ab1 20 
    :Gs1 20 
    :A1 21 
    :Bb1 22
    :As1 22
    :B1 23
    :Cb1 23

    :C2 24 
    :Db2 25 
    :Cs2 25 
    :D2 26 
    :Eb2 27 
    :Ds2 27 
    :E2 28 
    :F2 29 
    :Fs2 30 
    :Gb2 30 
    :G2 31 
    :Ab2 32 
    :Gs2 32 
    :A2 33 
    :Bb2 34
    :As2 34
    :B2 35
    :Cb2 35

    :C3 36 
    :Db3 37 
    :Cs3 37 
    :D3 38 
    :Eb3 39 
    :Ds3 39 
    :E3 40 
    :F3 41 
    :Fs3 42 
    :Gb3 42 
    :G3 43 
    :Ab3 44 
    :Gs3 44 
    :A3 45 
    :Bb3 46
    :As3 46
    :B3 47
    :Cb3 47

    :C4 48 
    :Db4 49 
    :Cs4 49 
    :D4 50 
    :Eb4 51 
    :Ds4 51 
    :E4 52 
    :F4 53 
    :Fs4 54 
    :Gb4 54 
    :G4 55 
    :Ab4 56 
    :Gs4 56 
    :A4 57 
    :Bb4 58
    :As4 58
    :B4 59
    :Cb4 59

    :C5 60 
    :Db5 61 
    :Cs5 61 
    :D5 62 
    :Eb5 63 
    :Ds5 63 
    :E5 64 
    :F5 65 
    :Fs5 66 
    :Gb5 66 
    :G5 67 
    :Ab5 68 
    :Gs5 68 
    :A5 69 
    :Bb5 70
    :As5 70
    :B5 71
    :Cb5 71

    :C6 72 
    :Db6 73 
    :Cs6 73 
    :D6 74 
    :Eb6 75 
    :Ds6 75 
    :E6 76 
    :F6 77 
    :Fs6 78 
    :Gb6 78 
    :G6 79 
    :Ab6 80 
    :Gs6 80 
    :A6 81 
    :Bb6 82
    :As6 82
    :B6 83
    :Cb6 83

    :C7 84 
    :Db7 85 
    :Cs7 85 
    :D7 86 
    :Eb7 87 
    :Ds7 87 
    :E7 88 
    :F7 89 
    :Fs7 90 
    :Gb7 90 
    :G7 91 
    :Ab7 92 
    :Gs7 92 
    :A7 93 
    :Bb7 94
    :As7 94
    :B7 95
    :Cb7 95

    :C8 96 
    :Db8 97 
    :Cs8 97 
    :D8 98 
    :Eb8 99 
    :Ds8 99 
    :E8 100 
    :F8 101 
    :Fs8 102 
    :Gb8 102 
    :G8 103 
    :Ab8 104 
    :Gs8 104 
    :A8 105 
    :Bb8 106
    :As8 106
    :B8 107
    :Cb8 107

    :C9 108 
    :Db9 109 
    :Cs9 109 
    :D9 110 
    :Eb9 111 
    :Ds9 111 
    :E9 112 
    :F9 113 
    :Fs9 114 
    :Gb9 114 
    :G9 115 
    :Ab9 116 
    :Gs9 116 
    :A9 117 
    :Bb9 118
    :As9 118
    :B9 119
    :Cb9 119
  }
)

(def- scales @{
    :bebop [0 2 4 5 7 9 10 11]
    :blues [0 3 5 6 7 10]
    :flamenco [0 1 4 5 7 8 11]
    :harmonic_minor [0 2 3 5 7 8 11]
    :hirajoshi [0 4 6 7 11]
    :melodic_minor [0 2 3 5 7 9 11]
    :minor_pentatonic [0 3 5 7 10]
    :major_pentatonic [0 2 4 7 9]
    :minor [0 2 3 5 7 8 10]
    :major [0 2 4 5 7 9 11]
  }
)

(defn note? [n]
  (or 
    (number? n)
    (not (nil? (get midi_notes n)))
  )
)

(defn notes? [n]
  (if (indexed? n)
    (all note? n)
    (note? n)
  )
)

(defn- note_single [quality]
 (if (number? quality) 
   quality
   (get midi_notes quality)
 )
)

(defn- notes
  [qualities]
  (map note_single qualities)
)

(defn note 
  ````Returns a MIDI note or notes that corresponds to the given `quality(s)`

  **Example**
  ```
  (note :c4) # -> 48
  (note [:c4 :d4]) # -> [48 50]
  ```
  ````
  [quality]
  (cond
   (note? quality) (note_single quality)
   (notes? quality) (notes quality)
   (errorf "not a note or notes %q" quality)
  )
)

(defn- single_note_chord_scale_generator [tones rootNum]
  (fn [n]
    (let [idx (% n (length tones))]
      (+ 
        rootNum
        (* 12 (math/floor (/ n (length tones)))) 
        (get tones (if (>= idx 0) idx (+ (length tones) idx)))
      )
    )
  )
)

(defn- chord_scale_generator [tones rootNum]
  (fn [notes_or_note]
    (if (or (array? notes_or_note) (tuple? notes_or_note))
      (map (single_note_chord_scale_generator tones rootNum) notes_or_note)
      ((single_note_chord_scale_generator tones rootNum) notes_or_note)
    )
  )
)

(defn scale
  ````Returns a MIDI scale generator of a given root and quality
  
  For qualities see [harmony.janet](https://github.com/gwegash/trane/blob/master/src/harmony.janet#L518)

  **Example**
  ```
  ((scale :C3 :minor) [0 1 2 3 4 5 6]) # -> @[36 38 39 41 43 44 46]
  ((scale :C3 :minor) 0) # -> 36
  ```
  ````
  [root quality]
  (def rootNum (note root))
  (def tones (get scales quality))
  (if tones
    (chord_scale_generator tones rootNum)
    (errorf "not a scale %q" quality)
  )
)

(defn chord
  ````Returns a MIDI chord generator of a given root and quality
  
  For qualities see [harmony.janet](https://github.com/gwegash/trane/blob/master/src/harmony.janet#L3)

  **Example**
  ```
  ((chord :C3 :min) [0 1 2]) # -> @[36 39 43]
  ((chord :C3 :min) 0) # -> 36
  ```
  ````
  [root quality]
  (def rootNum (note root))
  (def tones (get chord_qualities quality))
  (if tones
    (chord_scale_generator tones rootNum)
    (errorf "not a chord %q" quality)
  )
)
