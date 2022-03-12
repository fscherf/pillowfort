import datetime
import random
import string

from lona import LonaView

from lona_bootstrap_5 import show_alert

from pillowfort.response_formatter import ResponseFormatter


class Endpoint(LonaView):
    URL = ''
    ROUTE_NAME = ''
    INTERACTIVE = False
    VARIABLES = []
    RESPONSE_FORMATTER = ResponseFormatter

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.handle_request = self._handle_request_wrapper(self.handle_request)

    def _generate_random_id(self, length=8):
        return ''.join(
            random.choice(string.ascii_letters)
            for i in range(length)
        )

    def _add_activity(self, request, response, error):
        if request.url.path == '/favicon.ico':
            return

        self.server.state['activities'].append({
            'id': self._generate_random_id(),
            'endpoint': self,
            'timestamp': str(datetime.datetime.now()),
            'url': str(request.url.path),
            'method': request.method,
            'post': request.POST,
            'get': request.GET,
            'response': response,
            'error': error,
        })

    def _handle_request_wrapper(self, handle_request):
        def run_handle_request(request):
            error = None

            try:
                response = handle_request(request)

            except Exception as e:
                response = {
                    'text': '[No Response]'
                }

                error = e

            self._add_activity(
                request=request,
                response=response,
                error=error,
            )

            if error:
                raise error

            return response

        return run_handle_request

    def get_model(self, name):
        return self.server.state['models'].get_model(name)

    def get_variable(self, name, section=''):
        return self.server.state['variables'][section][name]

    def show_alert(
            self,
            text,
            type='info',
            timeout=None,
            broadcast=False,
            filter_connections=lambda connection: True,
            wait=True,
    ):

        return show_alert(
            lona_view=self,
            text=text,
            type=type,
            timeout=timeout,
            broadcast=broadcast,
            filter_connections=filter_connections,
            wait=wait,
        )