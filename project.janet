# project.janet
(declare-project
  :dependencies [
    {:url "https://github.com/ianthehenry/judge.git"
     :tag "v2.9.0"}
  ])

(task "test" [] (shell "jpm_tree/bin/judge ./test"))
