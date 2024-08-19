# project.janet
(declare-project
  :name "trane" 
  :description "A musical browser thing"
  :dependencies [
    {:url "https://github.com/ianthehenry/judge.git"
     :tag "v2.9.0"}
    {:url "https://github.com/pyrmont/documentarian"}
  ])

(task "test" [] (shell "jpm_tree/bin/judge ./test"))

(declare-source
  :source ["src/instruments.janet" "src/dsl.janet" "src/harmony.janet"])
