#!/bin/bash

if ! [ -d "node_modules" ]; then
    npm install
fi

if [ "$DEBUG" -eq "1" ]; then
    echo running in debug mode

    exec npm run watch

else
    exec npm run build

fi
