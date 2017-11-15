#!/bin/sh -e

NODEREPO="node_8.x"
DISTRO=$(lsb_release -c -s)

NODE_REPO_APT_SOURCE=/etc/apt/sources.list.d/nodesource.list
if [ ! -f "$NODE_REPO_APT_SOURCE" ]
then
  # Add node.js apt repo:
  echo "deb https://deb.nodesource.com/${NODEREPO} ${DISTRO} main" > "$NODE_REPO_APT_SOURCE"
  echo "deb-src https://deb.nodesource.com/${NODEREPO} ${DISTRO} main" >> "$NODE_REPO_APT_SOURCE"

  # Add node.js repo key:
  wget --quiet -O - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
fi

apt-get update
apt-get install -y nodejs
