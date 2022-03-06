from lona import LonaView

from lona.html import (
    HTML,
    Table,
    THead,
    TBody,
    H1,
    Tr,
    Th,
    Td,
)

from pillowfort.widgets import Contstant
from pillowfort import Endpoint


class EndpointsView(LonaView):
    def handle_request(self, request):
        tbody = TBody()

        for route in self.server._router.routes:
            if not issubclass(route.view, Endpoint):
                continue

            tbody.append(
                Tr(
                    Td(route.name or Contstant('null')),
                    Td(route.raw_pattern),
                    Td(route.view.__module__),
                ),
            )

        return HTML(
            H1('Endpoints'),
            Table(
                THead(
                    Tr(
                        Th('Name'),
                        Th('URL'),
                        Th('File'),
                    ),
                ),
                tbody,
                _class='table',
                _style='width: 100%',
            ),
        )