FROM python:3.13-alpine

COPY requirements.txt .

RUN apk add \
		bash curl wget \
		build-base libpq libpq-dev py3-psycopg2 && \
	pip install -r requirements.txt

RUN rm requirements.txt
