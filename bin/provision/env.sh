#!/bin/bash -e

cat << EOF > /etc/profile.d/lanodized.sh
export PROJECT_DIR=/opt/lanodized
export NODE_ENV=development
EOF
