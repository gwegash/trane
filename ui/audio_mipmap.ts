export class AudioMipmap {
  private levels: Float32Array[];
  private originalLength: number;

  constructor(pcmData: Float32Array) {
    this.originalLength = pcmData.length;
    this.levels = this.generateMipLevels(pcmData);
  }

  private generateMipLevels(data: Float32Array): Float32Array[] {
    const levels: Float32Array[] = [data];
    let currentLevel = data;

    while (currentLevel.length > 1) {
      const nextLength = Math.max(1, Math.floor(currentLevel.length / 2));
      const nextLevel = new Float32Array(nextLength);

      //We should _maybe_ filter this properly. Basically this is fine for zooming etc. Also we only end up with bass after a huge lpf, whereas I want to see where the peaks are.
      for (let i = 0; i < nextLength; i++) {
        const srcIndex = i * 2;
        if (srcIndex + 1 < currentLevel.length) {
          if(i % 2 == 0){
            nextLevel[i] = Math.min(currentLevel[srcIndex], currentLevel[srcIndex + 1])
          }
          else {
            nextLevel[i] = Math.max(currentLevel[srcIndex], currentLevel[srcIndex + 1])
          }
        } else {
          nextLevel[i] = currentLevel[srcIndex];
        }
      }

      levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    return levels;
  }

  sample(position: number, lodBias: number = 0): number {
    if (position < 0 || position >= 1) {
      return 0;
    }

    const scaledPos = position * (this.originalLength - 1);
    const targetLevel = Math.max(0, Math.min(this.levels.length - 1, Math.ceil(lodBias)));
    
    const level = this.levels[targetLevel];
    const levelScale = level.length - 1;
    const samplePos = scaledPos * (levelScale / (this.originalLength - 1));
    
    const index = Math.floor(samplePos);
    const frac = samplePos - index;
    
    if (index >= level.length - 1) {
      return level[level.length - 1];
    }
    
    return level[index] * (1 - frac) + level[index + 1] * frac;
  }

  sampleRange(startPos: number, endPos: number, numSamples: number): Float32Array {
    const result = new Float32Array(numSamples);
    const range = endPos - startPos;
    const pixelSize = range / numSamples;
    const lod = Math.log2(pixelSize * this.originalLength);
    
    for (let i = 0; i < numSamples; i++) {
      const pos = startPos + (i / (numSamples - 1)) * range;
      result[i] = this.sample(pos, lod);
    }
    
    return result;
  }

  getLevelCount(): number {
    return this.levels.length;
  }

  getLevelSize(level: number): number {
    if (level < 0 || level >= this.levels.length) {
      return 0;
    }
    return this.levels[level].length;
  }
}
