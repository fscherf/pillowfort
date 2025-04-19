#!/bin/bash
set -e
set -x

source .env

MEDIA_ROOT=./data/media
BACKUPS_ROOT=./data/backups

backup_name=$1

if [ "$backup_name" == "" ]; then
    echo "no backup given"
    exit 1
fi

# remove old media
rm -rf $MEDIA_ROOT/*

# unpack
tar -xzvf $BACKUPS_ROOT/$backup_name -C ./data

# postgres
docker compose down
docker compose up -d postgres

until docker compose exec postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; do
    echo "waiting for postgres..."
    sleep 1
done

docker compose exec postgres dropdb --username $POSTGRES_USER $POSTGRES_DB || true
docker compose exec postgres createdb --username $POSTGRES_USER $POSTGRES_DB
docker compose cp ./data/postgres.sql postgres:/tmp/postgres.sql
docker compose exec postgres psql --username $POSTGRES_USER -f /tmp/postgres.sql $POSTGRES_DB
docker compose down

# finish
rm ./data/postgres.sql
