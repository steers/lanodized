#!/bin/sh -e

if [ ! -d "$PROJECT_DIR" ]
then
    echo "Invalid project directory '$PROJECT_DIR'" >&2
    exit 1
fi

# Install global modules in a way that doesn't require root permissions
NPM_GLOBAL="${HOME}/.npm-global"
npm config set prefix "$NPM_GLOBAL"
export PATH="${NPM_GLOBAL}/bin:$PATH"
echo "export PATH=${NPM_GLOBAL}/bin:\$PATH" >> "${HOME}/.profile"

cd "$PROJECT_DIR"
npm install
npm run dev-install
npm run bootstrap

# Install some sweet node command-line tools
npm install -g pm2
pm2 completion install

# Set up PM2 to daemonize and monitor the application
pm2 install pm2-logrotate

if ! pm2 start app.json
then
    echo "There was a problem starting the application, please consult the logs." >&2
    pm2 logs --nostream >&2
fi
pm2 startup | grep '^sudo .*pm2 startup' | sh -
