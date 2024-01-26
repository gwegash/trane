set -euxo pipefail

janet -c src/init.janet build/trane.jimage

emcc   -O0   -o build/wasm.js  -I build/janet   build/janet/janet.c   src/driver.cpp   --embed-file build/trane.jimage@trane.jimage  -lembind   -s "EXPORTED_FUNCTIONS=['_main']"   -s "EXPORTED_RUNTIME_METHODS=['FS', 'UTF8ToString']"   -s ALLOW_MEMORY_GROWTH=1   -s AGGRESSIVE_VARIABLE_ELIMINATION=1   -s MODULARIZE   -s EXPORT_ES6   -s SINGLE_FILE
