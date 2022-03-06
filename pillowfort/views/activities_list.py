from lona import LonaView

from lona.html import (
    CLICK,
    HTML,
    Table,
    THead,
    TBody,
    H1,
    Tr,
    Th,
    Td,
    Br,
)

from pillowfort.widgets import Contstant


class ActivitiesListView(LonaView):
    def handle_tr_click(self, input_event):
        return {
            'redirect': self.server.reverse(
                route_name='pillowfort__activities_show',
                id=input_event.node._activity_id,
            ),
        }

    def handle_request(self, request):
        tbody = TBody()

        html = HTML(
            H1('Activities'),
            Table(
                THead(
                    Tr(
                        Th('Timestamp'),
                        Th('Method'),
                        Th('URL'),
                        Th('Error'),
                    ),
                ),
                tbody,
                _class='table table-striped table-hover',
                _style='width: 100%',
            ),
        )

        with self.server.state.lock:
            for activity in self.server.state['activities'][::-1]:
                error_string = ''

                if activity['error']:
                    error_string = repr(activity['error'])

                tr = Tr(
                    _style={
                        'cursor': 'pointer',
                    },
                    events=[CLICK],
                    handle_click=self.handle_tr_click,
                    nodes=[
                        Td(activity['timestamp']),
                        Td(activity['method']),
                        Td(activity['url']),
                        Td(error_string),
                    ]
                )

                tr._activity_id = activity['id']
                tbody.append(tr)

        return html