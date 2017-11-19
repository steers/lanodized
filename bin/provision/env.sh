#!/bin/sh -e

(
    echo 'export PROJECT_DIR=/opt/lanodized'
    echo 'export NODE_ENV=development'
) > /etc/profile.d/lanodized.sh
