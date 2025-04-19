#!/bin/bash

./manage.py collectstatic --no-input

if ! [ "$MAIL_DEBUG" -eq "1" ]; then
    exit 0
fi

echo running in mail debug mode

exec python -m smtpd -c DebuggingServer -n 0.0.0.0:1025
