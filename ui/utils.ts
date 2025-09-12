import localforage from "localforage"

function lerp(start, end, x) {
  return (1 - x) * start + x * end
}

function note_to_frequency(note: number) {
  return 440.0 * 2.0 * Math.pow(2, (note - 69.0) / 12.0)
}

const resolvePath = (obj, pathArr: Array<string>) => {
  if (pathArr.length == 0) {
    return obj
  } else {
    const field = pathArr.shift()
    return resolvePath(obj[field], pathArr)
  }
}

const clamp = (x, min, max) => {
  return Math.max(min, Math.min(max, x))
}

const findClosest = (sortedArray: number[], x: number, left = 0, right = sortedArray.length - 1): number | undefined => {
  if (left > right) { if (right < 0) return 0
    if (left >= sortedArray.length) return sortedArray.length - 1

    const leftDiff = Math.abs(sortedArray[right] - x);
    const rightDiff = Math.abs(sortedArray[left] - x);

    return leftDiff <= rightDiff ? right : left;
  }

  const mid = Math.floor((left + right) / 2);

  if (sortedArray[mid] === x) return mid

  if (sortedArray[mid] < x) {
    return findClosest(sortedArray, x, mid + 1, right);
  } else {
    return findClosest(sortedArray, x, left, mid - 1);
  }
}

const loadSample = async (sampleURLRaw) => {
  let sampleURL
  const localFileSplit = sampleURLRaw.split("local://") //todo cache things already given a URL
  if (localFileSplit.length == 2) {
    const fileBuffer: ArrayBuffer = await localforage.getItem(localFileSplit[1])
    const sampleBlob = new Blob([fileBuffer])
    sampleURL = URL.createObjectURL(sampleBlob)
  } else {
    sampleURL = sampleURLRaw
  }

  const response = await fetch(sampleURL)
  if (response.ok) {
    const buffer = await response.arrayBuffer()

    return buffer
  }
}

export { findClosest, clamp, lerp, loadSample, note_to_frequency, resolvePath }
