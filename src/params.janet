# Param table: instrument type -> param name -> wire index.
#
# This used to be a generated file, scraped out of the TypeScript sources. It is now
# empty in the compiled image and filled in at startup by the UI layer, which derives
# it from the same `def` objects it builds the audio graph from (see paramsAsJanet in
# ui/audio.ts). There is therefore no second copy to keep in sync.
#
# The index is what `change` packs into 5 bits via encodeParam, so it must match the
# declaration order of `def.params` on the TypeScript side exactly.
(def *inst_params* @{})

(defn set-params
  ````Replaces the param table from `source`, Janet source text for a table.

  Mutates in place rather than rebinding: dsl.janet's `change` and `wire` macros
  capture this exact table when they expand, so the binding must never be replaced.

  Called once from JS, before the first compile.
  ````
  [source]
  (def parsed (parse source))
  (each k (keys *inst_params*)
    (put *inst_params* k nil))
  (merge-into *inst_params* parsed)
  *inst_params*)
