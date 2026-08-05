import { EditorView } from "@codemirror/view"
import { SyntaxNodeRef, SyntaxNode } from "@lezer/common"

const elementsOf = (node: SyntaxNode) => {
  const els: Array<SyntaxNodeRef> = []
  for (let c = node.firstChild; c; c = c.nextSibling){
    if (c.name !== "(" && c.name !== ")" && c.name !== "LineComment"){ //We ignore linecomments so that we don't insert anything after them. might break? probably fine.
      els.push(c)
    }
  }
  return els
}

const nodeToString = (node: SyntaxNodeRef, ed: EditorView): string => {
  return ed.state.sliceDoc(node.from, node.to)
}

export { elementsOf, nodeToString }
