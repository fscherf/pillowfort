from pillowfort import Endpoint


class BlackHoleEndpoint(Endpoint):
    URL = '/<url:.*>'
    NAME = 'Black Hole'

    def handle_request(self, request):
        return {
            'text': '[No Response]',
        }