#!/bin/sh -e

DEFAULT_DIR="/opt/lanodized"
PROJECT_DIR=${PROJECT_DIR:-$DEFAULT_DIR}

# Install global modules in a way that doesn't require root permissions
NPM_GLOBAL="${HOME}/.npm-global"
npm config set prefix "$NPM_GLOBAL"
export PATH="${NPM_GLOBAL}/bin:$PATH"
echo "export PATH=${NPM_GLOBAL}/bin:\$PATH" >> "${HOME}/.profile"

cd "$PROJECT_DIR"
npm install
npm run dev-install

if [ ! -f "${PROJECT_DIR}/config/database.json" ]
then
  cp "${PROJECT_DIR}/config/database.json.example" "${PROJECT_DIR}/config/database.json"
fi

npm run bootstrap

# Set up PM2 to daemonize and monitor the application
npm install -g pm2
pm2 install pm2-logrotate

if ! pm2 start app.json
then
    echo "There was a problem starting the application, please consult the logs." >&2
    pm2 logs --nostream >&2
fi
pm2 startup | grep '^sudo .*pm2 startup' | sh -
