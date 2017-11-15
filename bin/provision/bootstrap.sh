#!/bin/sh -e

PROJECT_DIR="/opt/lanodized"

cd "$PROJECT_DIR"
npm install
npm run dev-install

if [ ! -f "${PROJECT_DIR}/config/database.json" ]
then
  cp "${PROJECT_DIR}/config/database.json.example" "${PROJECT_DIR}/config/database.json"
fi

npm run bootstrap
