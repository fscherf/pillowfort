#!/bin/bash

./manage.py collectstatic --no-input

if [ "$DEBUG" -eq "1" ]; then
    echo running in debug mode

    exec python3 -m watchfiles \
        "python3 -m pillowfort.aiohttp_app" \
        /app/backend/src

else
    exec python3 -m pillowfort.aiohttp_app

fi
