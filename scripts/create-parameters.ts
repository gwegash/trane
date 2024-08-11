import {TypescriptParser, ClassDeclaration} from "typescript-parser"
import { readFile, readdir, writeFile } from 'node:fs/promises';

// This file parses the contents of all the audio modules. 
// It then tries to find the parameter mapping in each module and generate some janet for parameter mappings.
//
// This is quite brittle, and ugly, and doesn't work with modules loaded dynamically.
// I'd like to move this to the browser land (No parsing required)
// and have the browser inject all instrument defenitions and parameter mappings to the janet compiler. 
// Oh well, this works for now.
//

const rx = /\[([^)]+)\]/

async function createParameters(){
  const paramsMap = {}
  const parser = new TypescriptParser();
 
  await Promise.all((await readdir("./ui")).map(async file => {
    if(file.endsWith(".ts")){
      const parsed = await parser.parseFile(`./ui/${file}`, 'workspace root')
      const classDeclarations = parsed.declarations.filter(declaration => declaration instanceof ClassDeclaration)
      await Promise.all(classDeclarations.map(async classDeclaration => {
        const paramsDef = classDeclaration.properties.find(property => property.name === "params")
        const friendlyNameDef = classDeclaration.properties.find(property => property.name === "friendlyName")
        if(paramsDef && friendlyNameDef){
          //Ok, this looks good. let's open the file
          const contents = await readFile(`./ui/${file}`)

          const matches = rx.exec(contents.subarray(paramsDef.start, paramsDef.end).toString())
          const friendlyName = contents.subarray(friendlyNameDef.start, friendlyNameDef.end)
            .toString()
            ?.split("\"")
            ?.at(1)
            ?.trim()

          if(matches && friendlyName){
            paramsMap[friendlyName] = eval(matches[0])
          }
          else{
            console.warn("couldn't genereate params for", file)
          }
        }
      }))
    }
  }))

  if(Object.values(paramsMap).length > 0){
    janetFormattedParamsMap = Object.entries(paramsMap).map(([friendlyName, params]) => (
      `    :${friendlyName} @{\n` + params.map((param, idx) => 
        `      :${param.name} ${idx}\n`).join("") +
      '    }\n'
          
    )).join("")

    const fileContents = 
      '(def *inst_params* @{\n' + 
      janetFormattedParamsMap + 
      '})'

    console.log(fileContents)
    await writeFile("./src/params.janet", fileContents)
  }
  else{
    console.error("something went wrong trying to generate parameter definitions")
  }

}

createParameters()




