#!/bin/bash
set -e
set -x

source .env

MEDIA_ROOT=./data/media
BACKUPS_ROOT=./data/backups

backup_name=$1

if ! [ -d "$BACKUPS_ROOT" ]; then
    mkdir -p $BACKUPS_ROOT
fi

if [ "$backup_name" == "" ]; then
    backup_name="$(date +%Y-%m-%d-%H:%M:%S).tar.gz"
fi

# postgres
docker compose down
docker compose up -d postgres

until docker compose exec postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; do
    echo "waiting for postgres..."
    sleep 1
done

docker compose exec postgres sh -c "pg_dump --username $POSTGRES_USER --dbname $POSTGRES_DB > /tmp/postgres.sql"
docker compose cp postgres:/tmp/postgres.sql ./data/postgres.sql
docker compose down

# archive postgres and media
tar -czvf ./data/backups/$backup_name -C ./data ./postgres.sql ./media

# finish
rm ./data/postgres.sql
