import json

from flamingo.core.errors import ObjectDoesNotExist
from pillowfort import Endpoint, Variable, JsonResponseFormatter


class ShowCars(Endpoint):
    URL = '/api/cars/'
    RESPONSE_FORMATTER = JsonResponseFormatter

    VARIABLES = [
        Variable('Delay API Calls', False),
        Variable('API Calls Delay', 2),
    ]

    def handle_request(self, request):
        cars = self.get_model('car')
        data = []

        for car in cars:
            data.append(car.data)

        return {
            'text': json.dumps(data)
        }


class ShowCar(Endpoint):
    URL = '/api/cars/<id:[0-9]+>'
    RESPONSE_FORMATTER = JsonResponseFormatter

    def handle_request(self, request):
        cars = self.get_model('car')

        try:
            car = cars.get(id=int(request.match_info['id']))

            return {
                'text': json.dumps(car.data)
            }

        except ObjectDoesNotExist:
            return {
                'text': '{}',
            }


class BrokenEndpoint(Endpoint):
    URL = '/api/broken'

    def handle_request(self, request):
        return 1 / 0