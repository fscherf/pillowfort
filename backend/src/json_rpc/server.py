from concurrent.futures import ThreadPoolExecutor
import asyncio
import logging

from aiohttp.web import Response, WebSocketResponse
from aiohttp import WSMsgType

from .request import JsonRpcRequest
from .client import JsonRpcClient

from .protocol import (
    encode_notification,
    decode_message,
    encode_result,
    encode_error,
    JsonRpcError,
    MESSAGE_TYPE,
    ERROR_TYPE,
)

default_logger = logging.getLogger('json-rpc.server')


class JsonRpcServer:
    '''
    https://www.jsonrpc.org/specification
    '''

    def __init__(self, max_workers=4, logger=default_logger):
        self.logger = logger
        self._max_workers = max_workers

        self.executor = None
        self.loop = None

        self.clients = []
        self.methods = {}
        self.notification_callbacks = {}

    # start / stop
    async def on_startup(self, app):
        self.loop = asyncio.get_running_loop()

        self.executor = ThreadPoolExecutor(
            max_workers=self._max_workers,
            thread_name_prefix='json-rpc-worker',
        )

    async def on_cleanup(self, app):
        self.executor.shutdown()

    # methods
    def add_method(self, name, callback):
        self.methods[name] = callback

    def add_methods(self, methods):
        for name, callback in methods:
            self.add_method(
                name=name,
                callback=callback,
            )

    # notifications
    def add_notification_callback(self, method, callback):
        '''
        NOTE: This method is not thread-safe! This OK for now because it is
              not expected that new callbacks will be registered at runtime.
        '''

        if method not in self.notification_callbacks:
            self.notification_callbacks[method] = []

        if not isinstance(callback, list):
            callback = [callback]

        self.notification_callbacks[method].extend(callback)

    def add_notification_callbacks(self, callbacks):
        for method, callback in callbacks:
            self.add_notification_callback(
                method=method,
                callback=callback,
            )

    def notify(self, method, params=None):
        message_string = encode_notification(
            method=method,
            params=params,
        )

        for client in self.clients:
            client.send_string(message_string)

    # request handling
    async def handle_request(self, http_request):

        # refuse connection if client is not capable of using websockets
        upgrade_header = http_request.headers.get('Upgrade', '').lower()

        if http_request.method != 'GET' or upgrade_header != 'websocket':
            return Response(
                status=426,  # Upgrade Required
                headers={
                    'Upgrade': 'websocket',
                    'Connection': 'Upgrade',
                },
            )

        # upgrade to websocket connection
        websocket_response = WebSocketResponse()
        await websocket_response.prepare(http_request)

        # setup client
        client = JsonRpcClient(
            server=self,
            http_request=http_request,
            websocket_response=websocket_response,
        )

        await self.loop.run_in_executor(
            self.executor,
            lambda: client.prepare(),
        )

        self.clients.append(client)

        # main loop
        try:
            async for message in websocket_response:
                if message.type == WSMsgType.TEXT:
                    response_string = await self.loop.run_in_executor(
                        self.executor,
                        lambda: self._handle_websocket_message(
                            client=client,
                            message_string=str(message.data),
                        )
                    )

                    if response_string:
                        await websocket_response.send_str(response_string)

                elif message.type == WSMsgType.PING:
                    await websocket_response.pong()

                elif message.type in (WSMsgType.CLOSED, WSMsgType.ERROR):
                    break

        except asyncio.CancelledError:
            pass

        finally:
            self.clients.remove(client)

            await websocket_response.close()

        return websocket_response

    def _handle_websocket_message(self, client, message_string):
        (
            error_type,
            error_message,
            message_type,
            message,
        ) = decode_message(message_string)

        # parsing error / invalid request
        if error_type in (ERROR_TYPE.PARSE_ERROR, ERROR_TYPE.INVALID_REQUEST):
            return encode_error(
                error_type=error_type,
                error_message=error_message,
            )

        request = JsonRpcRequest(
            server=self,
            client=client,
            message=message,
        )

        # requests
        if message_type is MESSAGE_TYPE.REQUEST:

            # method not found
            if message['method'] not in self.methods:
                return encode_error(
                    error_type=ERROR_TYPE.METHOD_NOT_FOUND,
                    error_message='Method not found',
                    message_id=message['id'],
                )

            method = self.methods[message['method']]

            try:
                result = method(request)

                return encode_result(
                    message_id=message['id'],
                    result=result,
                )

            except JsonRpcError as exception:
                return encode_error(
                    error_type=exception.ERROR_TYPE,
                    error_message=exception.get_error_message(),
                    message_id=message['id'],
                )

            except Exception:
                self.logger.exception(
                    'exception raised while running method %s',
                    method,
                )

                return encode_error(
                    error_type=ERROR_TYPE.INTERNAL_ERROR,
                    error_message='Internal error',
                    message_id=message['id'],
                )

        # notifications
        elif message_type is MESSAGE_TYPE.NOTIFICATION:

            # topic not found
            if message['method'] not in self.notification_callbacks:
                return

            for callback in self.notification_callbacks[message['method']]:
                try:
                    callback(request)

                except Exception:
                    self.logger.exception(
                        'exception raised while running callback %s',
                        callback,
                    )

        # responses
        elif message_type is MESSAGE_TYPE.RESPONSE:
            raise NotImplementedError('client responses are not implemented')

        # errors
        elif message_type is MESSAGE_TYPE.ERROR:
            raise NotImplementedError('client errors are not implemented')
