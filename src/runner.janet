(use ./globals)

(defn- zip-all [t predicates]
  (var result true)
  (for i 0 (length t)
    (unless ((predicates i) (t i))
      (set result false)
      (break)))
  result)

(defn- tuple-of? [t predicates]
  (and
    (tuple? t)
    (= (length t) (length predicates))
    (zip-all t predicates)))

(defn- note? [x]
  (tuple-of? x [int? number? number? number? number?]))

(defn- notes? [xs]
  (all note? xs))

(defn- rest_length? [x]
  (number? x) and (< 0 x))

(defn- fiber_return? [x]
  (tuple-of? x [rest_length? notes?])) #rest length, array of notes

#printing the instruments structure
(defn- pwint [x]
  (cond
    (keyword? x) (describe x)
    (array? x) (map pwint x)
    x
  )
)

(defn print_instruments [instruments]
  (map pwint (kvs instruments))
)

(defn print_loops [loops]
  (map describe (keys loops))
)

(defn run [env fiber_name start_beat]
  (def lloops (env *lloops*))
  
  (def current_loop (get lloops fiber_name))

  # The current fiber env
  (def fiber-env (fiber/getenv current_loop))

  # The dynamic bindings we want to use
  (def new-fiber-env @{:current-time start_beat})

  (fiber/setenv current_loop (table/setproto new-fiber-env fiber-env))

  (def next-action (resume current_loop))

  (match (fiber/status current_loop)
    :pending
      (cond
        (nil? next-action) ()
        (fiber_return? next-action) next-action
        (eprintf "illegal yield %q" next-action))
    :error (errorf "doodle error %q \n %q" next-action (debug/stacktrace current_loop))
    :dead ()
    _ (error "unexpected next-action"))
  )
