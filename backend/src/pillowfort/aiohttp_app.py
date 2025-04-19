#!/usr/bin/env python3

from aiohttp_wsgi import WSGIHandler
from aiohttp import web

from pillowfort.wsgi import application

app = web.Application()
wsgi_handler = WSGIHandler(application)

app.router.add_route('*', '/{path_info:.*}', wsgi_handler)

if __name__ == '__main__':
    web.run_app(
        app,
        host='0.0.0.0',
        port=80,
    )
