(def *lloops* :lloops)
(def *instruments* :instruments)
(def *instrument_counter* :instruments_counter)
(def *bpm* :bpm)
(def *self* :self)

# Instrument/param references collected from live_loop bodies while the script is
# compiling, checked in one pass at the end of evaluate. See validate-references.
(def *checks* :checks)
