import localforage from "localforage"

function lerp (start, end, x){
    return (1-x)*start + x*end
}

function note_to_frequency(note : number){
    return 440.0*2.0*Math.pow(2, (note - 69.0)/12.0)
}

const resolvePath = (obj, pathArr : Array<string>) => {
    if(pathArr.length == 0){
        return obj
    }
    else{
        const field = pathArr.shift()
        return resolvePath(obj[field], pathArr)
    }
}

const loadSample = async (sampleURLRaw) => {
  let sampleURL
  const localFileSplit = sampleURLRaw.split("local://") //todo cache things already given a URL
  if(localFileSplit.length == 2){
      const fileBuffer : ArrayBuffer = await localforage.getItem(localFileSplit[1])
      const sampleBlob = new Blob([fileBuffer])
      sampleURL = URL.createObjectURL(sampleBlob)
  }
  else{
      sampleURL = sampleURLRaw
  }

  const response = await fetch(sampleURL)
  const buffer = await response.arrayBuffer()

  return buffer
}

export {lerp, loadSample, note_to_frequency, resolvePath}
