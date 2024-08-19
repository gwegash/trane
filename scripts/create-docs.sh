set -euxo pipefail
  
./jpm_tree/bin/documentarian -T docs/api_template.mustache -o docs/api.md -d src/ -L ../
