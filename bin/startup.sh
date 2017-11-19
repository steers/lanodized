#!/bin/bash

cd "$PROJECT_DIR"

LOGO="data/logo.txt"
[[ -f "$LOGO" ]] && cat "$LOGO"

NODE_ENV=${NODE_ENV:-development}
APP_DB_USER=$(jq -r ".${NODE_ENV}.username" config/database.json)
APP_DB_PASS=$(jq -r ".${NODE_ENV}.password" config/database.json)
APP_DB_NAME=$(jq -r ".${NODE_ENV}.database" config/database.json)

print_db_usage () {
    echo "================================================================================"
    echo "Your PostgreSQL ${PG_VERSION} database can be accessed locally using the forwarded port (default: 15432)"
    echo "  Host: localhost"
    echo "  Port: 15432"
    echo "  Database: $APP_DB_NAME"
    echo "  Username: $APP_DB_USER"
    echo "  Password: $APP_DB_PASS"
    echo "~"
    echo "Admin access to postgres user via VM:"
    echo "  vagrant ssh"
    echo "  sudo su - postgres"
    echo "~"
    echo "psql access to app database user via VM:"
    echo "  vagrant ssh"
    echo "  sudo su - postgres"
    echo "  PGUSER=$APP_DB_USER PGPASSWORD=$APP_DB_PASS psql -h localhost $APP_DB_NAME"
    echo "~"
    echo "Env variable for application development:"
    echo "  DATABASE_URL=postgresql://$APP_DB_USER:$APP_DB_PASS@localhost:15432/$APP_DB_NAME"
    echo "~"
    echo "Local command to access the database via psql:"
    echo "  PGUSER=$APP_DB_USER PGPASSWORD=$APP_DB_PASS psql -h localhost -p 15432 $APP_DB_NAME"
    echo "================================================================================"
}

echo -e "\e[4mYour Vagrant environment is up and running!\e[24m"
echo -e "Connect using: \e[7mvagrant ssh\e[27m"
echo "================================================================================"

pm2 show lanodized

print_db_usage
