.PHONY: \
	all base build test \
	backend-build backend-bash backend-shell backend-test \
	frontend-build frontend-bash frontend-lint \
	start stop \
	data-backup data-restore data-bootstrap

all: start


# base
data/.gitkeep:
	mkdir -p data
	mkdir -p data/media
	touch data/.gitkeep

.env:
	cp example.env .env

base: data/.gitkeep .env

build: base
	docker compose build ${args}

test: base backend-test frontend-test


# backend
backend-build: base
	docker compose build backend

backend-bash: base
	docker compose run backend /bin/bash

backend-shell: base
	docker compose run backend ./manage.py shell

backend-test: base
	docker compose run backend tox ${args}


# frontend
frontend-build: base
	docker compose build frontend

frontend-bash: base
	docker compose run frontend /bin/bash

frontend-test: base
	docker compose run frontend npm run test

frontend-lint: base
	docker compose run frontend npm run lint


# services
start: base
	docker compose up --remove-orphans; \
	docker compose down

stop: base
	docker compose down


# data
data-bootstrap: base
	./scripts/data-bootstrap.sh ${args}

data-backup: base
	./scripts/data-backup.sh ${args}

data-restore: base
	./scripts/data-restore.sh ${args}
