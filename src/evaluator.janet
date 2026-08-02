# Lots here is taken from https://github.com/ianthehenry/toodle.studio

(use ./globals)
(use ./dsl_helpers) # validate-references

(def- template-env (make-env root-env))
(each module ["./globals" "./dsl" "./instruments" "./euclid" "./dsl_helpers" "./harmony"]
  (merge-module template-env (require module)))

(defn- chunk-string [str]
  (var unread true)
  (fn [buf _]
    (when unread
      (set unread false)
      (buffer/blit buf str))))

(defn evaluate [user-script]
  (def env (make-env template-env))
  (def lloops @{})
  (def instruments @{:out @[0 :out] :midi @[1 :midi]}) #start with the master out, midi in

  (put env *lloops* lloops)
  (put env *instruments* instruments)
  # filled in by live_loop as the script compiles, checked once it has finished
  (put env *checks* @[])


  (def errors @[])
  (var error-fiber nil)

  (defn parse-error [&opt x y]
    (def buf @"")
    (with-dyns [*err* buf *err-color* false]
      (bad-parse x y))
    (put env :exit true)
    (array/push errors (string/slice buf 0 -2)))
  (defn compile-error [&opt msg fiber where line col]
    (def buf @"")
    (with-dyns [*err* buf *err-color* false]
      (bad-compile msg nil where line col))
    (array/push errors (string/slice buf 0 -2))
    (put env :exit true)
    (set error-fiber fiber))

  (run-context {
    :env env
    :chunks (chunk-string user-script)
    :source "script"
    :on-parse-error parse-error
    :on-compile-error compile-error
    :on-status (fn [fiber value]
      (unless (= (fiber/status fiber) :dead)
        (array/push errors value)
        (set error-fiber fiber)))
    })

  (unless (empty? errors)
    (if error-fiber
      (propagate (first errors) error-fiber)
      (error (first errors))))

  # The whole script has now been evaluated, so the audio graph is complete and every
  # instrument exists regardless of the order they were declared in. Only now can the
  # references collected from live_loop bodies be judged. Failing here means nothing
  # is handed to the running loops, so a typo cannot reach the audio thread.
  (def reference-errors (validate-references env))
  (unless (empty? reference-errors)
    (error (string/join reference-errors "\n")))

  env)
