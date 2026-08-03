import { EditorView } from "@codemirror/view"
import { syntaxTree } from "@codemirror/language"
import {SyntaxNodeRef, SyntaxNode, TreeCursor} from '@lezer/common'
import {instrumentsByName} from './audio'
import {editor as ed} from './editor'
import type { GraphNode } from './instruments'

const SIGNIFICANT_FIGURES = 4

const formatValue = (value: number): string =>
  String(Number(value.toPrecision(SIGNIFICANT_FIGURES))) //weird trick, but drops the trailing zeros

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

const findInstrumentTreeNodes = (): Record<string, SyntaxNode> => {
  const treeNodes: Record<string, SyntaxNode> = {}
  const tree = syntaxTree(ed.state)
  tree.iterate({
    enter: (ref: TreeCursor) => {
      if(ref.type.name == "Form"){

        //return ed.state.sliceDoc(child.from, child.to)
        const [maybeInstTypeNode, maybeInstNameNode] = elementsOf(ref.node)

        if (!maybeInstNameNode || !maybeInstTypeNode){
          return true
        }
        else{
          const maybeInstName = nodeToString(maybeInstNameNode, ed)
          const maybeInstType = nodeToString(maybeInstTypeNode, ed)
          const instrument = instrumentsByName[maybeInstName]
          if(instrument && instrument.def.name == maybeInstType){
            if(treeNodes[maybeInstName]){
             console.error("Found two instrument definitions of the same name when looking :(")
            }
            treeNodes[maybeInstName] = ref.node 
          }
        }
      }
    }
  })
  return treeNodes
}

const replaceOrInsertParam = (instrumentNode: SyntaxNode, param: string, value: number) => {
  const kwParam = `:${param}`
  const children = elementsOf(instrumentNode)
  const childStrings = children.map(ref => ed.state.sliceDoc(ref.from, ref.to))
  const paramIndex = childStrings.indexOf(kwParam, 2) //ignore inst name and type

  if(paramIndex >= 2 && paramIndex+1 < children.length){ //we've got a param-value pair, or a badly formatted thing
    //double check the 2nd form isn't another keyword we'll clobber
    if(childStrings[paramIndex+1][0] !== ':'){
      //We can replace the param and value
      ed.dispatch({
        changes: { from: children[paramIndex].from, to: children[paramIndex + 1].to, insert: `${kwParam} ${formatValue(value)}` },
      })
    }
    else{
      //nothing is written in this case, so say why rather than letting the knob look broken
      console.warn(
        `not writing ${kwParam}: the value position holds ${childStrings[paramIndex + 1]}`,
      )
    }
  }
  else{
    //The param hasn't been configured in code yet, so let's add one.
    const lastChild = children[children.length-1]
    ed.dispatch({
      changes: { from: lastChild.to, to: lastChild.to, insert: ` ${kwParam} ${formatValue(value)}` },
    })
  }
}

const updateParam = (instrument: GraphNode, paramName: string, paramValue: number) => {
  const treeNodes = findInstrumentTreeNodes()
  const instrumentNode = treeNodes[instrument.name]
  if (!instrumentNode) {
    // The instrument is in the audio graph but not literally in the buffer, deleted or renamed since last eval. Although might be computed
    console.warn(
      `no declaration of ${instrument.name} in the buffer, not writing ${paramName}`,
    )
    return
  }
  replaceOrInsertParam(instrumentNode,
                       paramName,
                       paramValue)
}

export {findInstrumentTreeNodes, updateParam}
