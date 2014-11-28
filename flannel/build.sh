#!/bin/bash

set -eo pipefail

commit=a7b435a9205335db25372bde8c1ff4e522ed3bc7
dir=flannel-${commit}
tmpdir=$(mktemp --directory)

cleanup() {
  rm -rf "${tmpdir}"
}
trap cleanup EXIT

mkdir -p bin
pushd "${tmpdir}" >/dev/null
curl -L "https://github.com/coreos/flannel/archive/${commit}.tar.gz" | tar xz
cd "${dir}"
./build
popd >/dev/null

cp "${tmpdir}/${dir}/bin/flanneld" bin/
