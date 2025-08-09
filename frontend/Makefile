all: watch


build:
	docker compose run frontend /bin/bash -c " \
		rm -rf node_modules && \
		npm install && \
		npm run build \
	"

serve:
	docker compose run --service-ports frontend npm run serve

test:
	docker compose run frontend npm run test

lint:
	docker compose run frontend npm run lint

shell:
	docker compose run frontend /bin/bash
