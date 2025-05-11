import asyncio

from .protocol import encode_notification


class JsonRpcClient:
    '''
    TODO: move Django specific code to a middleware
    '''

    def __init__(self, server, http_request, websocket_response):
        self.server = server
        self.http_request = http_request
        self.websocket_response = websocket_response

        self.subscriptions = set()
        self.user = None

    def prepare(self):
        from django.contrib.auth.models import User, AnonymousUser
        from django.contrib.sessions.models import Session

        self.user = AnonymousUser()
        session_key = self.http_request.cookies.get('sessionid', '')

        if session_key:
            try:
                session = Session.objects.get(session_key=session_key)
                uid = session.get_decoded().get('_auth_user_id')

                try:
                    self.user = User.objects.get(pk=uid)

                except User.DoesNotExist:
                    pass

            except Session.DoesNotExist:
                pass

    def send_string(self, string):
        async def _send_string():
            await self.websocket_response.send_str(string)

        return asyncio.run_coroutine_threadsafe(
            coro=_send_string(),
            loop=self.server.loop,
        )

    def notify(self, method, params=None):
        if method not in self.subscriptions:
            return

        message_string = encode_notification(
            method=method,
            params=params,
        )

        return self.send_string(message_string)

    def subscribe(self, topics):
        if not isinstance(topics, (list, set)):
            topics = []

        self.subscriptions.update(topics)

    def unsubscribe(self, topics):
        if not isinstance(topics, (list, set)):
            topics = []

        for topic in topics:
            self.subscriptions.remove(topic)
