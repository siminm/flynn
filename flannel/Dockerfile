FROM flynn/busybox

ADD bin/etcdctl /bin/etcdctl
ADD bin/flanneld /bin/flanneld
ADD start.sh /bin/start-flannel

ENTRYPOINT ["/bin/start-flannel"]
