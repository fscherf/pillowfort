#!/usr/bin/env python3

from aiohttp_wsgi import WSGIHandler
from aiohttp import web

from pillowfort.api.v1.json_rpc.server import get_json_rpc_server
from pillowfort.wsgi import application

json_rpc_server = get_json_rpc_server()
wsgi_handler = WSGIHandler(application)

app = web.Application()

app.on_startup.append(json_rpc_server.on_startup)
app.on_cleanup.append(json_rpc_server.on_cleanup)

app.router.add_route('*', '/api/v1/json-rpc', json_rpc_server.handle_request)
app.router.add_route('*', '/{path_info:.*}', wsgi_handler)

if __name__ == '__main__':
    web.run_app(
        app,
        host='0.0.0.0',
        port=80,
    )
