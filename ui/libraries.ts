import { EditorView } from "@codemirror/view"
import { syntaxTree } from "@codemirror/language"
import { TreeCursor } from "@lezer/common"
import { elementsOf, nodeToString } from "./janet_syntax"

const USE_LIB = "use-lib"

const findLibraryUrls = (ed: EditorView): Array<string> => {
  const urls: Array<string> = []

  syntaxTree(ed.state).iterate({
    enter: (ref: TreeCursor) => {
      if (ref.type.name != "Form") {
        return
      }

      const [head, arg] = elementsOf(ref.node)
      if (!head || nodeToString(head, ed) != USE_LIB) {
        return
      }

      if (arg && arg.type.name == "String") {
        const url = nodeToString(arg, ed).slice(1, -1) //the node text includes its quotes
        if (url && !urls.includes(url)) {
          urls.push(url)
        }
      } else {
        console.warn("ignoring a (use-lib ...) without a literal string url")
      }
    },
  })

  return urls
}

const loadLibraries = async (
  runtime: { trane_load_library: (name: string, source: string) => boolean },
  urls: Array<string>,
): Promise<void> => {
  await Promise.all(
    urls.map(async (url) => {
      let source: string
      try {
        const response = await fetch(url)
        if (!response.ok) {
          console.error(`library ${url} -> HTTP ${response.status}`)
          return
        }
        source = await response.text()
      } catch (err) {
        console.error(`library ${url} couldn't be fetched: ${err}`)
        return
      }

      //errors inside the library are printed by janet, reported against the url
      if (!runtime.trane_load_library(url, source)) {
        console.error(`library ${url} didn't compile`)
      }
    }),
  )
}

export { findLibraryUrls, loadLibraries }
