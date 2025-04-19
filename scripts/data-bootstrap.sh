#!/bin/bash
set -e
set -x

source .env

MEDIA_ROOT=./data/media

# clear media
rm -rf $MEDIA_ROOT/*

# clear postgres database
docker compose down
docker compose up -d postgres

until docker compose exec postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; do
    echo "waiting for postgres..."
    sleep 1
done

docker compose exec postgres dropdb --username $POSTGRES_USER $POSTGRES_DB || true
docker compose exec postgres createdb --username $POSTGRES_USER $POSTGRES_DB

# setup database
docker compose run -it -e USER=admin backend /bin/bash -c "
    ./manage.py migrate
    ./manage.py createsuperuser
"

# finish
docker compose down
