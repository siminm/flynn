#!/bin/sh

set -eo pipefail

attempts=0
max_attempts=20

until etcdctl --peers=${ETCD_ADDR} mk /coreos.com/network/config "{\"Backend\":{\"Type\":\"vxlan\"},\"Network\":\"${FLANNEL_NETWORK}\"}"; do
  attempts=`expr ${attempts} + 1`
  if [ "${attempts}" = "${max_attempts}" ]; then
    echo "configuration failed"
    exit 1
  fi
  sleep 1
done

exec flanneld -etcd-endpoints=http://${ETCD_ADDR} -iface=${EXTERNAL_IP}
