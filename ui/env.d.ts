// --define:DEV=true|false and --define:DEBUG=true in package.json's build/dev scripts
declare const DEV: boolean
declare const DEBUG: boolean

// --alias:wasm-runtime=./build/wasm.js 
declare module "wasm-runtime" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Module = any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const InitializeWasm: (opts?: any) => Promise<any>
  export default InitializeWasm
}

// file:../sampler_node_pitch, which ships no types
declare module "timestretcher" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Timestretcher: any
}

// --loader:.wasm=binary hands these over as a Uint8Array
declare module "*.wasm" {
  const bytes: Uint8Array
  export default bytes
}

declare module "*.css"

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtime: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instruments: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  midi: any
  instruments2GraphViz: () => string
}
