import json

from flamingo.core.errors import ObjectDoesNotExist
from pillowfort import Endpoint, Variable


class ShowCars(Endpoint):
    URL = '/api/cars/'

    VARIABLES = [
        Variable('Delay API Calls', False),
        Variable('API Calls Delay', 2),
    ]

    def handle_request(self, request):
        cars = self.get_model('car')
        data = []

        for car in cars:
            data.append(car.data)

        return json.dumps(data)


class ShowCar(Endpoint):
    URL = '/api/cars/<id:[0-9]+>'

    def handle_request(self, request):
        cars = self.get_model('car')

        try:
            car = cars.get(id=int(car_id))

            return json.dumps(car.data)

        except ObjectDoesNotExist:
            return '{}'


class BrokenEndpoint(Endpoint):
    URL = '/api/broken'

    def handle_request(self, request):
        return 1 / 0