(use ./globals)
(use ./dsl)

(setdyn *lloops* @{})

(lloop :hello [1 2 3])
(lloop :hello2 [3 4 5])

(resume (get (dyn *lloops*) :hello))
(resume (get (dyn *lloops*) :hello2))

(def env (evaluator/evaluate "(lloop :hello (play 0 50) (sleep 50) (play 0 60))"))
(runner/run env :hello 0)

(def self @{:notes @[]})
(macex1 '(play 50 0))
(play 50 0)
