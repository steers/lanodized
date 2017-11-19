#!/bin/sh -e

if [ ! -d "$PROJECT_DIR" ]
then
    echo "Invalid project directory '$PROJECT_DIR'" >&2
    exit 1
fi

cd "$PROJECT_DIR"
if [ ! -f "config/database.json" ]
then
    cp "config/database.json.example" "config/database.json"
fi

NODE_ENV=${NODE_ENV:-development}
APP_DB_USER=$(jq -r ".${NODE_ENV}.username" config/database.json)
APP_DB_PASS=$(jq -r ".${NODE_ENV}.password" config/database.json)
APP_DB_NAME=$(jq -r ".${NODE_ENV}.database" config/database.json)

PG_VERSION=${PG_VERSION:-9.6}
echo "export PG_VERSION=$PG_VERSION" > /etc/profile.d/pg_version.sh

export DEBIAN_FRONTEND=noninteractive
DISTRO=$(lsb_release -c -s)

PG_REPO_APT_SOURCE=/etc/apt/sources.list.d/pgdg.list
if [ ! -f "$PG_REPO_APT_SOURCE" ]
then
    # Add PG apt repo:
    echo "deb http://apt.postgresql.org/pub/repos/apt/ ${DISTRO}-pgdg main" > "$PG_REPO_APT_SOURCE"

    # Add PGDG repo key:
    wget --quiet -O - https://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | apt-key add -
fi

# Update package list and install
apt-get update
apt-get -y install "postgresql-$PG_VERSION" "postgresql-contrib-$PG_VERSION"

PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
PG_DIR="/var/lib/postgresql/$PG_VERSION/main"

# Edit postgresql.conf to change listen address to '*':
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# Append to pg_hba.conf to add password auth:
echo "host    all             all             all                     md5" >> "$PG_HBA"

# Explicitly set default client_encoding
echo "client_encoding = utf8" >> "$PG_CONF"

# Restart so that all new config is loaded:
service postgresql restart

cat << EOF | su - postgres -c psql
-- Create the database user:
CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASS';

-- Create the database:
CREATE DATABASE $APP_DB_NAME WITH OWNER=$APP_DB_USER
                                  LC_COLLATE='en_US.utf8'
                                  LC_CTYPE='en_US.utf8'
                                  ENCODING='UTF8'
                                  TEMPLATE=template0;
EOF
