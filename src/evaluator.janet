# Lots here is taken from https://github.com/ianthehenry/toodle.studio

(use ./globals)

(def- template-env (make-env root-env))
(each module ["./helpers" "./globals" "./dsl" "./instruments" "./euclid" "./dsl_helpers" "./harmony"]
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

  (if (empty? errors)
    env
    (if error-fiber
      (propagate (first errors) error-fiber)
      (error (first errors)))))
